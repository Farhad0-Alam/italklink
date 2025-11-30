import { db } from './db';
import { digitalProducts, users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function seedShopProducts() {
  try {
    const userList = await db.select().from(users).where(eq(users.email, 'design123abq@gmail.com'));
    const user = userList[0];
    
    if (!user) {
      console.log('[Shop Seed] User not found');
      return;
    }

    const existingProducts = await db.select().from(digitalProducts).where(eq(digitalProducts.sellerId, user.id));
    
    if (existingProducts.length > 0) {
      console.log(`[Shop Seed] Products already exist for user (${existingProducts.length} products)`);
      return;
    }

    console.log('[Shop Seed] Seeding shop products for user:', user.email);

    const sampleProducts = [
      {
        id: nanoid(),
        sellerId: user.id,
        title: 'Professional Business Card Template',
        slug: 'professional-business-card',
        shortDescription: 'Modern and professional business card design in PDF format',
        description: 'This professional business card template includes modern minimalist design, print-ready PDF format, customizable colors and text, high resolution (300 DPI), and standard US/EU card sizes.',
        price: 999,
        discountPrice: 799,
        category: 'templates',
        filePath: '/uploads/business-card-template.pdf',
        fileSize: 2048000,
        fileType: 'pdf',
        status: 'active' as const,
        ownerCommission: 50,
        sellerCommission: 30,
        platformCommission: 20,
        views: 45,
        purchases: 12,
        rating: 450,
        reviewCount: 8,
      },
      {
        id: nanoid(),
        sellerId: user.id,
        title: 'Email Signature Pack',
        slug: 'email-signature-pack',
        shortDescription: 'Professional email signature templates for corporate branding',
        description: 'Complete email signature pack containing 5 different professional designs, HTML and CSS files, Outlook compatible versions, mobile responsive, and easy customization.',
        price: 1499,
        discountPrice: null,
        category: 'templates',
        filePath: '/uploads/email-signatures.zip',
        fileSize: 5242880,
        fileType: 'zip',
        status: 'active' as const,
        ownerCommission: 50,
        sellerCommission: 30,
        platformCommission: 20,
        views: 82,
        purchases: 28,
        rating: 480,
        reviewCount: 15,
      },
      {
        id: nanoid(),
        sellerId: user.id,
        title: 'Complete Networking Guide',
        slug: 'complete-networking-guide',
        shortDescription: 'Ultimate guide to professional networking and personal branding',
        description: 'A comprehensive 50-page guide covering networking strategies, personal branding, social media optimization, and building lasting professional relationships.',
        price: 2499,
        discountPrice: 1999,
        category: 'ebooks',
        filePath: '/uploads/networking-guide.pdf',
        fileSize: 8192000,
        fileType: 'pdf',
        status: 'active' as const,
        ownerCommission: 50,
        sellerCommission: 30,
        platformCommission: 20,
        views: 156,
        purchases: 42,
        rating: 490,
        reviewCount: 24,
      },
      {
        id: nanoid(),
        sellerId: user.id,
        title: 'Social Media Icon Pack',
        slug: 'social-media-icon-pack',
        shortDescription: '200+ custom social media icons for digital cards',
        description: 'Premium icon pack with 200+ social media icons in SVG and PNG formats. Multiple color variations, perfect for digital business cards and websites.',
        price: 799,
        discountPrice: null,
        category: 'graphics',
        filePath: '/uploads/icon-pack.zip',
        fileSize: 12582912,
        fileType: 'zip',
        status: 'active' as const,
        ownerCommission: 50,
        sellerCommission: 30,
        platformCommission: 20,
        views: 234,
        purchases: 67,
        rating: 470,
        reviewCount: 31,
      },
      {
        id: nanoid(),
        sellerId: user.id,
        title: 'LinkedIn Optimization Checklist',
        slug: 'linkedin-optimization-checklist',
        shortDescription: 'Step-by-step checklist to optimize your LinkedIn profile',
        description: 'Comprehensive checklist with 50+ actionable items to improve your LinkedIn profile visibility, engagement, and professional appeal.',
        price: 499,
        discountPrice: 299,
        category: 'guides',
        filePath: '/uploads/linkedin-checklist.pdf',
        fileSize: 1048576,
        fileType: 'pdf',
        status: 'active' as const,
        ownerCommission: 50,
        sellerCommission: 30,
        platformCommission: 20,
        views: 89,
        purchases: 35,
        rating: 460,
        reviewCount: 18,
      },
    ];

    for (const product of sampleProducts) {
      await db.insert(digitalProducts).values(product);
    }

    console.log(`[Shop Seed] Created ${sampleProducts.length} sample products`);
  } catch (error) {
    console.error('[Shop Seed] Error:', error);
  }
}
