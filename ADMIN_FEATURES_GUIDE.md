# TalkLink - Plan Features & Admin Controls Guide

## 📋 Subscription Plan Types

### 1. **FREE Plan**
- **Business Cards Limit**: 1 card only
- **Default**: All new users start here
- **Feature Access**: Basic features only

### 2. **PAID/PRO Plan**
- **Business Cards Limit**: Unlimited or custom limit (configurable by admin)
- **Advanced Features**: All features available
- **For**: Professional users and teams

### 3. **ENTERPRISE Plan**
- **Business Cards Limit**: Unlimited
- **All Features**: Complete access
- **For**: Large organizations and agencies

---

## 🛠️ ADMIN CONTROL PANEL - Available Pages

### **1. Plans Management** (`/admin/plans`)
**What Admin Can Do:**
- ✅ Create new subscription plans
- ✅ Edit existing plans
- ✅ Delete plans
- ✅ Set pricing (monthly/yearly with discounts)
- ✅ Control business card limits per plan
- ✅ Enable/disable plans
- ✅ Add custom pricing features (displayed on pricing page)
- ✅ Set trial days for each plan
- ✅ Manage Stripe integration

**Features Per Plan:**
- Assign which features are available for each plan
- Features are stored in database and can be toggled per plan

---

### **2. Users Management** (`/admin/users`)
**What Admin Can Do:**
- ✅ View all registered users
- ✅ Add new users manually
- ✅ Edit user details (name, email)
- ✅ **Assign plans to users** (Free → Pro → Enterprise)
- ✅ Set plan validity dates
- ✅ Add notes to plan assignments
- ✅ Search and filter users by status/plan
- ✅ **Impersonate users** (view as that user to debug issues)
- ✅ Deactivate/activate user accounts
- ✅ View user business card count and limits

**Key Control:** When admin assigns a plan to a user, system updates:
- User's `planType` (free, pro, enterprise)
- User's `businessCardsLimit`
- Subscription status and end date

---

### **3. Elements Management** (`/admin/elements`)
**What Admin Can Do:**
- ✅ Add new element types (Heading, Paragraph, Form, etc.)
- ✅ Edit element type descriptions
- ✅ Enable/disable element types
- ✅ Control which element types are available to users

**Current Elements Available:**
- Paragraph, Heading, Link, Image, Video, Custom HTML
- Contact Section, Social Links
- Contact Form, Subscribe Form
- Accordion, Image Slider, Testimonials, PDF Viewer, Navigation Menu
- Google Maps, Digital Wallet, AR Preview, QR Code
- Document Manager, URL Manager
- And many more...

---

### **4. Icons Management** (`/admin/icons`)
**What Admin Can Do:**
- ✅ Add new social/contact icons
- ✅ Edit icon details
- ✅ Upload/manage icon images
- ✅ Enable/disable icons
- ✅ Control icon availability

**Current Icons:** 24 built-in icons (phone, email, LinkedIn, Facebook, Twitter, Instagram, YouTube, WhatsApp, Telegram, etc.)

---

### **5. Templates Management** (`/admin/templates`)
**What Admin Can Do:**
- ✅ Create/edit business card templates
- ✅ Set template defaults (default name, title)
- ✅ Enable/disable templates per plan
- ✅ Set template limits per subscription plan
- ✅ Manage template active status
- ✅ Control template visibility to users

---

### **6. Coupons Management** (`/admin/coupons`)
**What Admin Can Do:**
- ✅ Create discount coupons
- ✅ Set discount percentage
- ✅ Assign coupons to specific plans
- ✅ Set coupon validity dates
- ✅ Set usage limits
- ✅ Enable/disable coupons
- ✅ View coupon usage stats

---

### **7. Affiliates Management** (`/admin/affiliates`)
**What Admin Can Do:**
- ✅ View all affiliate accounts
- ✅ Approve/reject affiliate applications
- ✅ Suspend affiliate accounts
- ✅ View conversion tracking
- ✅ Manage affiliate payouts
- ✅ Set commission rates

---

## 🔒 Feature Enforcement - How It Works

### **Business Card Limit Enforcement**
```
User creates new business card:

1. System checks user's planType:
   - FREE users: Limited to 1 card
   - PRO users: Unlimited cards
   - ENTERPRISE users: Unlimited cards

2. If FREE user tries to create card #2:
   - API returns 403 error
   - Message: "You have reached your business card limit (1). Upgrade to Pro for unlimited cards."
   - User cannot create card

3. When admin assigns new plan:
   - User's businessCardsLimit is updated
   - User now has access to new limit
   - Feature gates re-evaluate
```

### **Feature List Enforcement**
- Each plan has a `features` array in database
- Features like AI Chatbot, RAG Knowledge Base, etc. are tied to plans
- Frontend can check user's plan features before showing options
- Admin controls which features appear in each plan

---

## 📊 Available Features for Admin Control (40+ Features)

### **Page Elements (Basic)**
- Heading, Paragraph, Link, Image, Video, Custom HTML

### **Contact & Social**
- Contact Section, Social Links

### **Forms**
- Contact Form, Subscribe Form

### **Interactive Elements**
- Accordion, Image Slider, Testimonials, PDF Viewer, Navigation Menu

### **Advanced Features**
- Google Maps, Digital Wallet (Apple/Google), AR Preview, QR Code Generator

### **Content Management**
- Document Manager, URL Manager

### **AI Features**
- AI Chatbot, RAG Knowledge Base

### **Appointments & Booking**
- Book Appointment, Schedule Call, Meeting Request, Availability Display

### **Tools & Enterprise**
- CRM (Customer Management)
- Analytics Dashboard
- QR Codes Management
- Email Signature Generator
- Automation & Workflows
- Team Collaboration
- Affiliate System
- Bulk Card Generation
- Custom Domain
- API Access

---

## 🎯 Plan Assignment Workflow (Admin)

1. Go to **Users Management** page
2. Find the user to upgrade
3. Click "Assign Plan" button
4. Select new plan (Free → Pro → Enterprise)
5. Set plan end date (or leave blank for indefinite)
6. Add optional notes
7. Submit
8. User now has access to new plan features ✅

---

## 📈 Feature Gating Logic

### **Current Implementation:**
- ✅ Business card limits ARE enforced (free users max 1 card)
- ✅ Plan type IS checked on card creation
- ✅ Admin CAN assign plans to users
- ⚠️ Feature-level gating (which elements/tools per plan) is configured but may need UI enforcement in editor

### **Recommendation:**
To fully activate feature gating, you can:
1. Go to Plans page → Select a plan
2. Check the "Features" section
3. Toggle features ON/OFF for each plan
4. Save changes

The system will respect these settings at the data level. UI enforcement in the card editor can be added if needed.

---

## 🔧 Testing Plan Features

1. **Create test users** with different plans
2. **Assign FREE plan** - verify: Can only create 1 business card
3. **Assign PRO plan** - verify: Can create unlimited cards
4. **Assign ENTERPRISE plan** - verify: Full access to all features
5. **Check admin panel** - All pages and controls working ✅

---

## 📝 Summary

**Admin Controls Available:**
- Plans (pricing, limits, features) ✅
- Users (create, edit, assign plans, impersonate) ✅
- Elements (add/enable/disable element types) ✅
- Icons (manage social/contact icons) ✅
- Templates (control template availability per plan) ✅
- Coupons (discount management) ✅
- Affiliates (affiliate program management) ✅

**Feature Enforcement:**
- ✅ Business card creation limits enforced
- ✅ Plan assignment working
- ✅ Feature system ready for activation

**Next Step:** Test by assigning plans to users and verifying they can only create the allowed number of business cards.
