import { db } from './db';
import { 
  coupons, 
  affiliates, 
  conversions, 
  globalTemplates, 
  headerTemplates,
  users 
} from '@shared/schema';
import { sql } from 'drizzle-orm';

async function seedAdminData() {
  console.log('🌱 Starting admin data seeding...');

  try {
    // Get a sample user for affiliates
    const [sampleUser] = await db.select().from(users).limit(1);
    if (!sampleUser) {
      console.error('No users found in database. Please seed users first.');
      return;
    }

    // Seed Coupons
    console.log('Creating coupons...');
    const couponsData = [
      {
        id: sql`gen_random_uuid()`,
        code: 'WELCOME20',
        name: 'Welcome Discount',
        description: '20% off for new users',
        discountType: 'percentage' as const,
        discountValue: 20,
        usageLimit: 100,
        userUsageLimit: 1,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        minimumOrderAmount: 50,
        status: 'active' as const,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: sql`gen_random_uuid()`,
        code: 'SAVE50',
        name: 'Big Savings',
        description: '$50 off on pro plans',
        discountType: 'fixed_amount' as const,
        discountValue: 50,
        usageLimit: 50,
        userUsageLimit: 1,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        minimumOrderAmount: 200,
        status: 'active' as const,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: sql`gen_random_uuid()`,
        code: 'PREMIUM30',
        name: 'Premium Discount',
        description: '30% off enterprise plans',
        discountType: 'percentage' as const,
        discountValue: 30,
        maxDiscountAmount: 100,
        usageLimit: 25,
        userUsageLimit: 1,
        startsAt: new Date(),
        status: 'active' as const,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const coupon of couponsData) {
      try {
        await db.insert(coupons).values(coupon).onConflictDoNothing();
      } catch (e) {
        console.log(`Coupon ${coupon.code} may already exist, skipping...`);
      }
    }
    console.log('✅ Coupons created');

    // Seed Affiliates
    console.log('Creating affiliates...');
    const affiliatesData = [
      {
        id: sql`gen_random_uuid()`,
        userId: sampleUser.id,
        code: 'AFF001',
        name: 'John Marketing',
        email: 'john@marketing.com',
        country: 'United States',
        website: 'https://johnmarketing.com',
        status: 'approved' as const,
        kycStatus: 'approved' as const,
        commissionRate: '20',
        paymentMethod: 'paypal',
        paypalEmail: 'john@paypal.com',
        totalEarnings: 1250.00,
        totalConversions: 25,
        totalClicks: 500,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        approvedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: sql`gen_random_uuid()`,
        userId: sampleUser.id,
        code: 'AFF002',
        name: 'Sarah Blogger',
        email: 'sarah@blog.com',
        country: 'Canada',
        website: 'https://sarahblog.ca',
        status: 'approved' as const,
        kycStatus: 'approved' as const,
        commissionRate: '15',
        paymentMethod: 'bank',
        totalEarnings: 875.50,
        totalConversions: 18,
        totalClicks: 320,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: sql`gen_random_uuid()`,
        userId: sampleUser.id,
        code: 'AFF003',
        name: 'Tech Influencer',
        email: 'tech@influencer.com',
        country: 'United Kingdom',
        status: 'pending' as const,
        kycStatus: 'pending' as const,
        commissionRate: '25',
        totalEarnings: 0,
        totalConversions: 0,
        totalClicks: 45,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];

    const insertedAffiliates = [];
    for (const affiliate of affiliatesData) {
      try {
        const [inserted] = await db.insert(affiliates).values(affiliate).onConflictDoNothing().returning();
        if (inserted) {
          insertedAffiliates.push(inserted);
        }
      } catch (e) {
        console.log(`Affiliate ${affiliate.code} may already exist, skipping...`);
      }
    }
    console.log('✅ Affiliates created');

    // Seed Conversions (if affiliates were created)
    if (insertedAffiliates.length > 0) {
      console.log('Creating conversions...');
      const conversionsData = [
        {
          id: sql`gen_random_uuid()`,
          affiliateId: insertedAffiliates[0]?.id || affiliatesData[0].id,
          orderId: `ORD-${Date.now()}-001`,
          userId: sampleUser.id,
          planId: 2, // Pro plan
          amount: 99.00,
          currency: 'USD',
          commissionAmount: 19.80,
          commissionRate: '20',
          status: 'approved' as const,
          referrerUrl: 'https://johnmarketing.com/review',
          ipAddress: '192.168.1.1',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          approvedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          id: sql`gen_random_uuid()`,
          affiliateId: insertedAffiliates[0]?.id || affiliatesData[0].id,
          orderId: `ORD-${Date.now()}-002`,
          userId: sampleUser.id,
          planId: 3, // Enterprise plan
          amount: 299.00,
          currency: 'USD',
          commissionAmount: 59.80,
          commissionRate: '20',
          status: 'paid' as const,
          referrerUrl: 'https://johnmarketing.com/guide',
          ipAddress: '192.168.1.2',
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          approvedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          paidAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          id: sql`gen_random_uuid()`,
          affiliateId: insertedAffiliates[1]?.id || affiliatesData[1].id,
          orderId: `ORD-${Date.now()}-003`,
          userId: sampleUser.id,
          planId: 2, // Pro plan
          amount: 99.00,
          currency: 'USD',
          commissionAmount: 14.85,
          commissionRate: '15',
          status: 'pending' as const,
          referrerUrl: 'https://sarahblog.ca/deals',
          ipAddress: '192.168.2.1',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        }
      ];

      for (const conversion of conversionsData) {
        try {
          await db.insert(conversions).values(conversion).onConflictDoNothing();
        } catch (e) {
          console.log(`Conversion ${conversion.orderId} may already exist, skipping...`);
        }
      }
      console.log('✅ Conversions created');
    }

    // Seed Templates
    console.log('Creating templates...');
    const templatesData = [
      {
        id: sql`gen_random_uuid()`,
        name: 'Professional Business Card',
        description: 'Clean and modern business card template',
        category: 'business',
        isActive: true,
        previewImage: 'https://placeholder.com/template1.png',
        templateData: JSON.stringify({ layout: 'modern', colors: ['#000', '#fff'] }),
        settings: JSON.stringify({ customizable: true }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: sql`gen_random_uuid()`,
        name: 'Creative Designer Card',
        description: 'Vibrant template for creative professionals',
        category: 'creative',
        isActive: true,
        previewImage: 'https://placeholder.com/template2.png',
        templateData: JSON.stringify({ layout: 'artistic', colors: ['#ff6b6b', '#4ecdc4'] }),
        settings: JSON.stringify({ customizable: true }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: sql`gen_random_uuid()`,
        name: 'Minimal Contact Card',
        description: 'Simple and elegant contact card',
        category: 'minimal',
        isActive: true,
        previewImage: 'https://placeholder.com/template3.png',
        templateData: JSON.stringify({ layout: 'minimal', colors: ['#333'] }),
        settings: JSON.stringify({ customizable: false }),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const template of templatesData) {
      try {
        await db.insert(globalTemplates).values(template).onConflictDoNothing();
      } catch (e) {
        console.log(`Template ${template.name} may already exist, skipping...`);
      }
    }
    console.log('✅ Templates created');

    // Seed Header Templates
    console.log('Creating header templates...');
    const headerTemplatesData = [
      {
        id: sql`gen_random_uuid()`,
        name: 'Corporate Header',
        description: 'Professional header for corporate cards',
        category: 'business',
        isActive: true,
        previewImage: 'https://placeholder.com/header1.png',
        elements: JSON.stringify([
          { type: 'text', content: 'Company Name', position: { x: 10, y: 10 } },
          { type: 'logo', position: { x: 200, y: 10 } }
        ]),
        globalStyles: JSON.stringify({
          backgroundColor: '#1a1a1a',
          fontFamily: 'Arial',
          fontSize: '16px'
        }),
        layoutType: 'fixed',
        advancedLayout: JSON.stringify({ grid: true, columns: 3 }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: sql`gen_random_uuid()`,
        name: 'Gradient Banner',
        description: 'Eye-catching gradient header design',
        category: 'creative',
        isActive: true,
        previewImage: 'https://placeholder.com/header2.png',
        elements: JSON.stringify([
          { type: 'gradient', colors: ['#667eea', '#764ba2'], position: { x: 0, y: 0 } },
          { type: 'text', content: 'Your Name', position: { x: 50, y: 30 } }
        ]),
        globalStyles: JSON.stringify({
          backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontFamily: 'Poppins',
          fontSize: '20px',
          color: '#ffffff'
        }),
        layoutType: 'fluid',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: sql`gen_random_uuid()`,
        name: 'Minimalist Header',
        description: 'Clean minimal header design',
        category: 'minimal',
        isActive: true,
        previewImage: 'https://placeholder.com/header3.png',
        elements: JSON.stringify([
          { type: 'text', content: 'Name', position: { x: 20, y: 20 } },
          { type: 'line', position: { x: 20, y: 50, width: 200 } }
        ]),
        globalStyles: JSON.stringify({
          backgroundColor: '#ffffff',
          fontFamily: 'Helvetica',
          fontSize: '14px',
          color: '#333333'
        }),
        layoutType: 'centered',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const headerTemplate of headerTemplatesData) {
      try {
        await db.insert(headerTemplates).values(headerTemplate).onConflictDoNothing();
      } catch (e) {
        console.log(`Header template ${headerTemplate.name} may already exist, skipping...`);
      }
    }
    console.log('✅ Header templates created');

    console.log('🎉 Admin data seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding admin data:', error);
    throw error;
  }
}

// Run the seed function
seedAdminData().catch(console.error);