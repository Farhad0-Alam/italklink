import { getUncachableStripeClient } from './stripeClient';
import { db } from './db';
import { affiliates } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * StripeAffiliateService: Handles Stripe Connect operations for affiliates
 * Manages account links, transfers, and payout processing
 */
export class StripeAffiliateService {
  /**
   * Generate Stripe Connect account link for affiliate onboarding
   * Affiliate clicks link to authorize their Stripe account
   */
  async generateConnectLink(affiliateId: string, returnUrl: string) {
    const stripe = await getUncachableStripeClient();
    
    // Get affiliate record
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, affiliateId));
    
    if (!affiliate) {
      throw new Error('Affiliate not found');
    }

    // Create or get Stripe Connected Account
    let stripeAccountId = affiliate.stripeConnectAccountId;
    
    if (!stripeAccountId) {
      // Create new connected account for this affiliate
      const account = await stripe.accounts.create({
        type: 'express',
        country: affiliate.country || 'US',
        email: '', // Will be set by affiliate during onboarding
        metadata: {
          affiliateId: affiliateId
        }
      });
      stripeAccountId = account.id;
      
      // Store Stripe account ID
      await db.update(affiliates)
        .set({ stripeConnectAccountId: stripeAccountId })
        .where(eq(affiliates.id, affiliateId));
    }

    // Generate account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      type: 'account_onboarding',
      refresh_url: returnUrl + '?reauth=true',
      return_url: returnUrl + '?connected=true',
      collect: 'eventually' // Collect required info during onboarding
    });

    return {
      url: accountLink.url,
      stripeAccountId: stripeAccountId
    };
  }

  /**
   * Check if affiliate has completed Stripe Connect onboarding
   */
  async isOnboardingComplete(affiliateId: string): Promise<boolean> {
    const stripe = await getUncachableStripeClient();
    
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, affiliateId));
    
    if (!affiliate?.stripeConnectAccountId) {
      return false;
    }

    const account = await stripe.accounts.retrieve(affiliate.stripeConnectAccountId);
    
    // Check if account is charges enabled (required for payouts)
    return account.charges_enabled && account.payouts_enabled;
  }

  /**
   * Execute Stripe transfer to affiliate's connected account
   * Called when payout status is marked as "paid"
   */
  async executeTransfer(
    affiliateId: string,
    amountInCents: number,
    description: string
  ): Promise<string> {
    const stripe = await getUncachableStripeClient();
    
    // Get affiliate
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, affiliateId));
    
    if (!affiliate?.stripeConnectAccountId) {
      throw new Error('Affiliate has not completed Stripe Connect onboarding');
    }

    // Verify onboarding is complete
    const isComplete = await this.isOnboardingComplete(affiliateId);
    if (!isComplete) {
      throw new Error('Affiliate Stripe account is not ready for payouts');
    }

    // Create transfer to connected account
    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: 'usd',
      destination: affiliate.stripeConnectAccountId,
      description: description,
      metadata: {
        affiliateId: affiliateId,
        type: 'affiliate_commission'
      }
    });

    return transfer.id;
  }

  /**
   * Get Stripe Connect account status
   */
  async getAccountStatus(affiliateId: string) {
    const stripe = await getUncachableStripeClient();
    
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, affiliateId));
    
    if (!affiliate?.stripeConnectAccountId) {
      return {
        connected: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        requirements: []
      };
    }

    const account = await stripe.accounts.retrieve(affiliate.stripeConnectAccountId);
    
    return {
      connected: true,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements?.eventually || [],
      payoutSchedule: account.settings?.payouts?.schedule || {}
    };
  }
}

export const stripeAffiliateService = new StripeAffiliateService();
