# Admin Panel - Complete Access & Testing Guide

## 🔐 HOW TO LOGIN AS ADMIN

### Step 1: Access Admin Panel
**URL:** `http://localhost:5000/admin`

### Step 2: Create Admin Account or Login

**Option A: Login with Existing Admin Account**
```
Email: admin@talklink.com (or your admin email)
Password: (Your admin password)
```

**Option B: Create First Admin Account**
- Go to registration page
- Create account with admin email
- The system will grant admin role to first user

**Option C: Force Admin Role via Database** (If needed)
```bash
# Access the database and update user role
# In the users table, set role = 'admin' or 'super_admin'
```

---

## 📊 ADMIN DASHBOARD - What You'll See

**File Location:** `client/src/pages/admin.tsx` (Main admin dashboard)

**Components:** 
- `client/src/components/admin/AdminLayout.tsx` - Admin sidebar/navigation
- `client/src/modules/admin-panel/components/AdminMain.tsx` - Main panel

### Admin Dashboard Features:

1. **Overall Analytics** ✅
   - Total Users
   - Total Sales
   - Total Revenue
   - Active Orders

2. **Quick Actions**
   - Approve/Reject Products
   - View Pending Reviews
   - Update Commission Rates
   - Check Inventory Levels

3. **Admin Navigation Menu** (in sidebar)
   - Dashboard
   - Product Management
   - Review Moderation
   - Commission Settings
   - Inventory Management
   - User Management
   - Analytics
   - Settings

---

## 🛍️ SHOP ADMIN FEATURES (8 Features to Check)

### 1. **Product Moderation** ✅
**Path:** `/admin/shop/moderation` or `/admin` → Products

**File:** `client/src/pages/shop/admin-moderation.tsx`

**What to Test:**
- View pending products awaiting approval
- View product details (title, price, description, seller)
- **Approve Product** button → Product goes live
- **Reject Product** button → Reason prompt
- See approval/rejection history

**API Endpoint:**
```
GET  /api/shop/admin/products           - List pending products
POST /api/shop/admin/products/:id/approve - Approve product
POST /api/shop/admin/products/:id/reject  - Reject product with reason
```

**Test Steps:**
1. Go to http://localhost:5000/admin
2. Find "Product Moderation" or "Pending Products"
3. See list of pending products
4. Click "Approve" or "Reject" on any product
5. Verify status changes

---

### 2. **Review Moderation** ✅
**Path:** `/admin/shop/reviews` or `/admin` → Reviews

**File:** `client/src/pages/shop/admin-review-moderation.tsx`

**What to Test:**
- View all pending reviews
- See review content, rating, and reviewer
- **Approve Review** → Goes live on product
- **Reject Review** → Removed from queue
- See moderation audit trail

**API Endpoints:**
```
GET  /api/admin/reviews/pending        - View pending reviews
POST /api/admin/reviews/:id/approve    - Approve review
POST /api/admin/reviews/:id/reject     - Reject review
GET  /api/admin/reviews/audit          - Moderation audit trail
```

**Test Steps:**
1. Go to Admin → Review Moderation
2. See pending reviews queue
3. Click Approve/Reject on any review
4. Check audit trail for history

---

### 3. **Commission Settings** ✅
**Path:** `/admin/shop/commission` or `/admin` → Commissions

**File:** `client/src/pages/shop/admin-commission.tsx`

**What to Test:**
- View current commission split (50% seller, 30% affiliate, 20% platform)
- **Update Global Rate** - Change default percentage
- **Category Rates** - Set different rates per category
- **Promotional Rates** - Temporary promotional rates
- Save changes

**API Endpoints:**
```
GET    /api/admin/commissions                        - View all settings
PATCH  /api/admin/commissions/global                - Update global rate
PATCH  /api/admin/commissions/category/:categoryId  - Update category rate
PATCH  /api/admin/commissions/promotional           - Update promotional rate
```

**Test Steps:**
1. Go to Admin → Commission Settings
2. See current rates displayed
3. Change global rate (e.g., from 50% to 55%)
4. Set category-specific rates
5. Click Save
6. Verify new rates apply to next orders

**Example: Change Commission Split**
- Seller: 50% → 55%
- Affiliate: 30% → 25%
- Platform: 20% → 20%

---

### 4. **Inventory Management** ✅
**Path:** `/admin/inventory` or `/admin` → Inventory

**What to Test:**
- View all products with stock levels
- See low-stock products
- **Update Stock** for any product
- Set reorder points
- Receive low-stock alerts
- Sort by stock status

**API Endpoints:**
```
GET    /api/admin/inventory              - All inventory
PATCH  /api/admin/inventory/:product/stock - Update stock level
GET    /api/admin/inventory/low-stock    - Low stock alerts
```

**Test Steps:**
1. Go to Admin → Inventory
2. See all products with quantities
3. Find product with low stock (highlighted in red)
4. Click "Update Stock"
5. Change quantity to higher number
6. Verify it no longer shows as low stock

**Inventory Status:**
- 🟢 Green: Adequate stock
- 🟡 Yellow: Low stock warning
- 🔴 Red: Out of stock

---

### 5. **Inventory Alerts** ✅
**Feature:** Low-stock email notifications

**What to Test:**
- Products marked low-stock trigger alerts
- Admin receives email notifications
- Seller receives notification

**API Used:**
```
/api/admin/inventory/low-stock
```

---

### 6. **Order Management** ✅
**Path:** `/admin` → Orders

**What to Test:**
- View all orders (not just user orders)
- See order details, buyer, seller, amount
- Update order status
- View order timeline
- Issue refunds

**API Endpoints:**
```
GET    /api/admin/orders              - All orders
GET    /api/admin/orders/:id          - Order details
PATCH  /api/admin/orders/:id/status   - Update status
GET    /api/admin/orders/:id/timeline - Order timeline
```

---

### 7. **Refund Management** ✅
**Path:** `/admin` → Refunds

**What to Test:**
- View all refund requests
- See reason for refund
- **Approve Refund** → Process payment back
- **Reject Refund** → Deny with reason
- Track refund status

**API Endpoints:**
```
GET    /api/admin/refunds                    - All requests
POST   /api/admin/refunds/:id/approve        - Approve refund
POST   /api/admin/refunds/:id/reject         - Reject refund
PATCH  /api/admin/refunds/:id/update-status  - Update status
```

---

### 8. **User Management** ✅
**Path:** `/admin` → Users

**What to Test:**
- View all users (customers, sellers, admins)
- See user role, signup date, status
- Change user role (customer ↔ seller ↔ admin)
- Suspend/activate users
- View user activity

**API Endpoints:**
```
GET    /api/admin/users              - All users
PATCH  /api/admin/users/:id/role     - Change role
PATCH  /api/admin/users/:id/status   - Suspend/activate
GET    /api/admin/users/:id/activity - User activity log
```

---

## 📈 ANALYTICS - ADMIN DASHBOARD

### View Platform Analytics
**Path:** `/admin` → Analytics

**What to Check:**
- **Total Revenue** - Sum of all sales
- **Total Orders** - Number of orders
- **Active Users** - Number of active customers
- **Active Sellers** - Number of active sellers
- **Revenue by Category** - Sales breakdown
- **Top Products** - Best-selling items
- **Top Sellers** - Highest revenue sellers
- **Charts & Graphs** - Visual representations

**API Endpoints:**
```
GET /api/admin/analytics              - Dashboard overview
GET /api/admin/analytics/revenue      - Revenue data
GET /api/admin/analytics/orders       - Orders data
GET /api/admin/analytics/users        - User growth
GET /api/admin/analytics/top-products - Best sellers
GET /api/admin/analytics/top-sellers  - Top revenue sellers
```

---

## ⚙️ PLATFORM SETTINGS

### Access Settings
**Path:** `/admin` → Settings

**What to Configure:**
- **Platform Name** - Your platform's name
- **Commission Rates** - Default percentages
- **Email Settings** - SendGrid configuration
- **Payment Settings** - Stripe configuration
- **Features** - Enable/disable features
- **Email Templates** - Customize notifications
- **System Logs** - View system activities

**API Endpoints:**
```
GET    /api/features/settings/:key     - Get setting
POST   /api/features/settings          - Update setting
GET    /api/admin/settings             - All settings
PATCH  /api/admin/settings/:key        - Update setting
```

---

## 👥 SELLER MANAGEMENT

### Manage Sellers
**Path:** `/admin` → Sellers

**What to Manage:**
- View all sellers
- See seller details (name, email, products, revenue)
- Approve new sellers
- Suspend/activate sellers
- View seller subscription plan
- Check seller payout status

**API Endpoints:**
```
GET    /api/admin/sellers              - All sellers
GET    /api/admin/sellers/:id          - Seller details
PATCH  /api/admin/sellers/:id/status   - Suspend/activate
GET    /api/admin/sellers/:id/payouts  - Payout history
```

---

## 📋 ADMIN QUICK CHECKLIST

### Daily Tasks (What to Check)
- [ ] Approve pending products
- [ ] Moderate pending reviews
- [ ] Check for low-stock items
- [ ] Review new user signups
- [ ] Process refund requests
- [ ] Monitor platform analytics

### Weekly Tasks
- [ ] Review top-selling products
- [ ] Check seller payouts
- [ ] Review abandoned carts
- [ ] Analyze revenue trends
- [ ] Update commission rates if needed

### Monthly Tasks
- [ ] Full audit of platform activity
- [ ] Seller performance review
- [ ] Revenue analysis
- [ ] User growth analysis
- [ ] System health check

---

## 🔑 ADMIN FILES & ROUTES

### Frontend Admin Files
```
client/src/pages/admin.tsx
client/src/pages/shop/admin-moderation.tsx          - Product moderation
client/src/pages/shop/admin-commission.tsx         - Commission settings
client/src/pages/shop/admin-review-moderation.tsx  - Review moderation
client/src/components/admin/AdminLayout.tsx        - Admin sidebar
client/src/components/admin/AdminProfilePage.tsx   - Admin profile
client/src/modules/admin-panel/                    - Admin panel module
```

### Backend Admin Routes
```bash
# In server/routes.ts and individual route files:

GET    /api/admin/products           - Pending products
POST   /api/admin/products/:id/approve
POST   /api/admin/products/:id/reject

GET    /api/admin/reviews            - Pending reviews
POST   /api/admin/reviews/:id/approve
POST   /api/admin/reviews/:id/reject

GET    /api/admin/commissions        - Commission settings
PATCH  /api/admin/commissions/*      - Update commissions

GET    /api/admin/inventory          - Inventory overview
PATCH  /api/admin/inventory/:id/stock

GET    /api/admin/orders             - All orders
PATCH  /api/admin/orders/:id/status

GET    /api/admin/users              - All users
PATCH  /api/admin/users/:id/role

GET    /api/admin/analytics          - Platform analytics
```

---

## 🧪 TEST ADMIN FEATURES (Complete Workflow)

### Test 1: Approve a Product (2 min)
1. Login as admin (http://localhost:5000/admin)
2. Go to Product Moderation
3. See pending products
4. Click "Approve" on first product
5. ✅ Product status changes to "Active"
6. ✅ Verify in product list it's now live

### Test 2: Moderate a Review (2 min)
1. Go to Review Moderation
2. See pending reviews
3. Click "Approve" or "Reject"
4. ✅ Review is processed
5. ✅ Check audit trail shows action

### Test 3: Update Commission Rates (2 min)
1. Go to Commission Settings
2. See current rates: 50/30/20
3. Change global seller rate to 55%
4. Click Save
5. ✅ Rates updated
6. ✅ Next order uses new rates

### Test 4: Check Low Stock Inventory (2 min)
1. Go to Inventory
2. See all products with quantities
3. Find product with quantity < threshold
4. Update quantity to higher number
5. ✅ Stock updated
6. ✅ No longer shows as low stock

### Test 5: View Platform Analytics (2 min)
1. Go to Analytics Dashboard
2. See total revenue chart
3. See top-selling products
4. See top sellers
5. ✅ All numbers display correctly

### Test 6: Manage Users (2 min)
1. Go to User Management
2. See all users listed
3. Click on a user
4. See their details and activity
5. ✅ Can view user info

---

## 🚀 COMPLETE ADMIN VERIFICATION (10 min)

**Phase 1: Navigation (1 min)**
- [ ] Login as admin
- [ ] See admin dashboard
- [ ] Navigate all menu items
- [ ] Confirm all sections load

**Phase 2: Product Management (2 min)**
- [ ] View pending products
- [ ] Approve a product
- [ ] Reject a product
- [ ] See status updates

**Phase 3: Moderation (2 min)**
- [ ] View pending reviews
- [ ] Approve a review
- [ ] Check audit trail

**Phase 4: Commission Control (2 min)**
- [ ] View commission settings
- [ ] Update global rates
- [ ] Update category rates
- [ ] Save changes

**Phase 5: Inventory (2 min)**
- [ ] View all inventory
- [ ] See low-stock items
- [ ] Update stock levels
- [ ] Verify changes

**Phase 6: Analytics (1 min)**
- [ ] View dashboard stats
- [ ] Check revenue charts
- [ ] See top products
- [ ] View top sellers

---

## 🔗 ADMIN API ENDPOINTS (All Routes)

### Product Management
```bash
GET    /api/shop/admin/products
POST   /api/shop/admin/products/:id/approve
POST   /api/shop/admin/products/:id/reject
```

### Review Management
```bash
GET    /api/admin/reviews/pending
POST   /api/admin/reviews/:id/approve
POST   /api/admin/reviews/:id/reject
GET    /api/admin/reviews/audit
```

### Commission Management
```bash
GET    /api/admin/commissions
PATCH  /api/admin/commissions/global
PATCH  /api/admin/commissions/category/:catId
PATCH  /api/admin/commissions/promotional
```

### Inventory Management
```bash
GET    /api/admin/inventory
PATCH  /api/admin/inventory/:productId/stock
GET    /api/admin/inventory/low-stock
```

### Order Management
```bash
GET    /api/admin/orders
GET    /api/admin/orders/:id
PATCH  /api/admin/orders/:id/status
```

### User Management
```bash
GET    /api/admin/users
PATCH  /api/admin/users/:id/role
PATCH  /api/admin/users/:id/status
```

### Analytics
```bash
GET    /api/admin/analytics
GET    /api/admin/analytics/revenue
GET    /api/admin/analytics/orders
GET    /api/admin/analytics/top-products
GET    /api/admin/analytics/top-sellers
```

### Settings
```bash
GET    /api/features/settings/:key
POST   /api/features/settings
GET    /api/admin/settings
PATCH  /api/admin/settings/:key
```

---

## 🔑 ADMIN ROLES

### Super Admin (Full Access)
- Approve/reject products
- Moderate reviews
- Update commission rates
- Manage all users
- View all analytics
- Update platform settings
- Manage sellers
- Suspend users

### Admin (Limited Access)
- Approve/reject products
- Moderate reviews
- View analytics
- Cannot change commission rates
- Cannot suspend users

### Seller Admin (Own Store)
- Manage own products
- See own analytics
- Respond to own reviews
- Process own orders
- View own inventory
- Request payouts

---

## 💡 QUICK TROUBLESHOOTING

### Can't Access Admin Panel?
```
1. Check if logged in as admin
2. Verify user role = 'admin' or 'super_admin' in database
3. Check URL: http://localhost:5000/admin
```

### Products Not Showing in Moderation?
```
1. Check if products submitted with status='pending'
2. View database: SELECT * FROM digital_products WHERE status='pending'
3. Check if admin is super_admin role
```

### Commission Rates Not Updating?
```
1. Verify change was saved
2. Check new order uses new rates
3. Verify commission_settings table was updated
```

### Low Stock Alerts Not Working?
```
1. Set inventory threshold
2. Reduce stock below threshold
3. Check product_inventory table for is_low_stock flag
```

---

## 📊 ADMIN DASHBOARD SUMMARY

| Feature | Access Path | Status |
|---------|------------|--------|
| Product Moderation | `/admin/shop/moderation` | ✅ |
| Review Moderation | `/admin/shop/reviews` | ✅ |
| Commission Settings | `/admin/shop/commission` | ✅ |
| Inventory Management | `/admin/inventory` | ✅ |
| Order Management | `/admin/orders` | ✅ |
| User Management | `/admin/users` | ✅ |
| Analytics Dashboard | `/admin/analytics` | ✅ |
| Settings | `/admin/settings` | ✅ |
| Seller Management | `/admin/sellers` | ✅ |
| Refund Management | `/admin/refunds` | ✅ |

**All admin features are implemented and ready to test!** ✅
