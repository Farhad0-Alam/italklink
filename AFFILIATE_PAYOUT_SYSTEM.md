# Affiliate Payout System - How Funds Get Sent

## Current Payout Flow

### **Step 1: Affiliate Requests Payout**
```
POST /api/affiliate/payout-request
{
  amount: 50000  // $500.00
}
```
✅ **Status: DRAFT**
- Creates payout record
- Deducts from affiliate balance
- Requires: KYC approved, minimum threshold met, payout method configured

---

### **Step 2: Maker Approval (Accounts Team)**
```
POST /api/admin/payouts/:id/approve
```
✅ **Status: DRAFT → MAKER_APPROVED**
- Accounts team reviews the request
- Checks affiliate details, balance, history
- Approves and passes to finance

---

### **Step 3: Checker Approval (Finance Team)**
```
POST /api/admin/payouts/:id/verify
```
✅ **Status: MAKER_APPROVED → CHECKER_APPROVED**
- Finance team double-checks
- Verifies payout details
- Ready for processing

---

### **Step 4: Process Payout (Execute Payment) ⚠️ NEEDS INTEGRATION**
```
POST /api/admin/payouts/:id/process
{
  transactionRef: "TXN-2024-12345",  // From payment provider
  notes: "Sent via bank transfer"
}
```
✅ **Status: CHECKER_APPROVED → PAID**

**What Currently Happens:**
- Updates payout status to "paid"
- Records transaction reference
- Creates balance ledger entry
- Sends "payout.processed" event notification

**What's MISSING (Not Implemented):**
❌ No actual payment execution
❌ No API calls to payment gateways
❌ No bank transfer initiation
❌ No PayPal/Stripe/Crypto processing

---

## Payout Methods Currently Supported (Database Only)

```
affiliates.payoutMethod can be:
- "bank_transfer"      // Bank account details
- "paypal"             // PayPal email
- "stripe_connect"     // Stripe account
- "crypto"             // Wallet address
- "wise_transfer"      // Wise (TransferWise)
- "check"              // Physical check
```

**Stored in:** `affiliates.payoutDetails` (JSON field)

Example:
```json
{
  "bank_account": "1234567890",
  "bank_code": "SWIFT123",
  "account_name": "John Doe",
  "bank_name": "Chase Bank"
}
```

---

## What Needs to Be Implemented

### **Option 1: Bank Transfer Integration**
```typescript
// What needs to happen in /process endpoint:

const affiliate = await db.select().from(affiliates).where(eq(affiliates.id, ...));

if (affiliate.payoutMethod === 'bank_transfer') {
  // Integrate with payment provider
  const bankTransfer = await stripeConnect.payouts.create({
    amount: payout.amount,
    currency: payout.currency,
    destination: affiliate.payoutDetails.stripe_account_id,
    description: `Affiliate commission payout #${payout.id}`
  });
  
  // Record transaction reference
  transactionRef = bankTransfer.id;
}
```

### **Option 2: PayPal Integration**
```typescript
if (affiliate.payoutMethod === 'paypal') {
  const paypalPayment = await paypalClient.payouts.create({
    items: [{
      recipient_type: 'EMAIL',
      amount: {
        currency_code: 'USD',
        value: (payout.amount / 100).toString()
      },
      receiver: affiliate.payoutDetails.paypal_email,
      note: `Commission payout from TalkLink`
    }]
  });
  
  transactionRef = paypalPayment.batch_header.payout_batch_id;
}
```

### **Option 3: Stripe Connected Account**
```typescript
if (affiliate.payoutMethod === 'stripe_connect') {
  const stripeTransfer = await stripe.transfers.create({
    amount: payout.amount,
    currency: 'usd',
    destination: affiliate.payoutDetails.stripe_account_id,
    transfer_data: {
      destination: affiliate.payoutDetails.stripe_account_id
    }
  });
  
  transactionRef = stripeTransfer.id;
}
```

### **Option 4: Wise (TransferWise) Integration**
```typescript
if (affiliate.payoutMethod === 'wise_transfer') {
  const wiseQuote = await wise.rates.createQuote({
    sourceCurrency: 'USD',
    targetCurrency: affiliate.payoutDetails.currency,
    sourceAmount: payout.amount / 100
  });
  
  const transfer = await wise.transfers.create({
    quoteUuid: wiseQuote.id,
    targetAccount: affiliate.payoutDetails.account_id,
    customerTransactionId: payout.id
  });
  
  transactionRef = transfer.id;
}
```

---

## Database Schema for Payouts

```typescript
// Payout Record
{
  id: string;
  affiliateId: string;
  amount: number;              // in cents (50000 = $500)
  currency: 'USD' | 'EUR'...;
  method: string;              // bank_transfer, paypal, etc
  status: 'draft' | 'maker_approved' | 'checker_approved' | 'paid' | 'cancelled';
  
  // Approval Trail
  makerUserId: string;          // Who approved first
  checkerUserId: string;        // Who verified
  
  // Execution Details
  transactionRef: string;       // External transaction ID
  processedAt: Date;            // When marked as paid
  failureReason?: string;       // If cancelled
  
  // Tracking
  periodStart: Date;            // Commission period
  periodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Balance Ledger (Immutable audit trail)
{
  affiliateId: string;
  delta: number;               // +amount (credit) or -amount (debit)
  currency: string;
  kind: 'credit' | 'debit';
  refType: 'commission' | 'payout' | 'adjustment' | 'chargeback';
  refId: string;              // Links to commission/payout
  description: string;        // "Commission from order #123" or "Payout #ABC processed"
  runningBalance: number;     // Balance after this transaction
  createdAt: Date;
}
```

---

## Current Implementation Status

### ✅ Implemented (Database & Tracking)
- Payout request creation
- Status workflow (draft → approved → verified → paid)
- Balance tracking & audit trail
- Multi-tier approval (maker-checker)
- Transaction reference recording
- Payout history & analytics
- Event notifications

### ❌ Not Implemented (Actual Payment Processing)
- Stripe Connect payouts
- PayPal API integration
- Bank transfer execution
- Wise/SWIFT transfers
- Crypto wallet transfers
- Payment confirmation webhooks
- Failure handling & retries
- Refund processing

---

## How to Complete Implementation

### For Each Payment Method, Add:

```typescript
// In /api/admin/payouts/:id/process endpoint:

switch(affiliate.payoutMethod) {
  case 'stripe_connect':
    transactionRef = await executeStripePayment(payout, affiliate);
    break;
  case 'paypal':
    transactionRef = await executePayPalPayment(payout, affiliate);
    break;
  case 'bank_transfer':
    transactionRef = await executeBankTransfer(payout, affiliate);
    break;
  case 'wise_transfer':
    transactionRef = await executeWiseTransfer(payout, affiliate);
    break;
  default:
    throw new Error(`Unsupported payout method: ${affiliate.payoutMethod}`);
}

// Update payout with transaction ref and mark as paid
await db.update(payouts)
  .set({
    status: 'paid',
    transactionRef,
    processedAt: new Date()
  })
  .where(eq(payouts.id, payout.id));
```

---

## Recommended Integration Approach

### Phase 1: Stripe Connect (Simplest)
- Best for international affiliates
- Direct account connection
- Lowest fees
- Fastest implementation

### Phase 2: Bank Transfer (ACH/Wire)
- Use Stripe payout or Wise
- Cover most countries
- Higher volume capability

### Phase 3: PayPal
- Adds flexibility
- User-friendly
- Easier onboarding

### Phase 4: Crypto
- Appeal to tech-savvy affiliates
- GDPR compliant (less personal data)
- Optional premium feature

---

## Security Considerations

✅ **Currently Secured:**
- Only checker-approved payouts can be processed
- Transaction reference required before marking paid
- Balance already deducted (prevents overdraft)
- Full audit trail in balance ledger
- Self-referral prevention
- KYC verification before payout

⚠️ **Need to Add When Implementing Payments:**
- API key encryption for payment gateways
- Rate limiting on payout processing
- Webhook signature verification
- Idempotency keys (prevent duplicate charges)
- Encryption of payout details in database
- Monthly audit reports
- Fraud detection for large payouts
- Chargeback dispute handling

---

## Testing Payments

```bash
# Stripe Test Mode
stripe_account_id: "acct_1234567890"

# PayPal Sandbox
paypal_email: "merchant-test@paypal.com"

# Wise Sandbox
wise_token: "sandbox_token_xxx"
```

Use test/sandbox credentials until production-ready.
