import { db } from './db';
import { digitalProducts, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function seedShopProducts() {
  try {
    // Find the user
    const [user] = await db.select().from(users).where(eq(users.email, 'design123abq@gmail.com'));
    
    if (!user) {
      console.log('[Shop Seed] User not found');
      return;
    }

    // Check if products already exist for this user
    const existingProducts = await db.select().from(digitalProducts).where(eq(digitalProducts.sellerId, user.id));
    
    if (existingProducts.length > 0) {
      console.log(`[Shop Seed] Products already exist for user (${existingProducts.length} products)`);
      return;
    }

    // Create sample products
    const sampleProducts = [
      {
        sellerId: user.id,
        title: 'Professional Business Card Template',
        slug: 'professional-business-card',
        shortDescription: 'Modern and professional business card design in PDF format',
        description: `This professional business card template includes:
- Modern minimalist design
- Print-ready PDF format
- Customizable colors and text
- High resolution (300 DPI)
- Standard US/EU card sizes
- Easy to edit in Canva or Adobe

Perfect for entrepreneurs, consultants, and professionals looking to make a great first impression.`,
        price: 999, // $9.99
        discountPrice: 799, // $7.99 on sale
        category: 'templates',
        filePath: '/uploads/business-card-template.pdf',
        fileSize: 2048000,
        fileType: 'pdf',
        status: 'active',
        commissionPercentage: 20,
        views: 45,
        purchases: 12,
        rating: 450, // 4.5 stars
        reviewCount: 8,
      },
      {
        sellerId: user.id,
        title: 'Email Signature Pack',
        slug: 'email-signature-pack',
        shortDescription: 'Professional email signature templates for corporate branding',
        description: `Complete email signature pack containing:
- 5 different professional designs
- HTML and CSS files
- Outlook compatible versions
- Mobile responsive
- Easy customization
- Brand guidelines included

These email signatures maintain your professional brand across all client communications.`,
        price: 1499, // $14.99
        discountPrice: null,
        category: 'templates',
        filePath: '/uploads/email-signatures.zip',
        fileSize: 5242880,
        fileType: 'zip',
        status: 'active',
        commissionPercentage: 20,
        views: 82,
        purchases: 28,
        rating: 480, // 4.8 stars
        reviewCount: 15,
      },
      {
        sellerId: user.id,
        title: 'LinkedIn Profile Optimization Guide',
        slug: 'linkedin-optimization-guide',
        shortDescription: 'Complete step-by-step guide to optimize your LinkedIn profile',
        description: `Learn how to maximize your LinkedIn presence:
- Profile optimization checklist
- Headline formulas that get results
- Photo tips for professional appearance
- Skills endorsement strategy
- Network growth tactics
- 50+ customizable templates
- Real examples from top profiles

This comprehensive guide has helped 1000+ professionals increase their LinkedIn visibility and attract opportunities.`,
        price: 2999, // $29.99
        discountPrice: 1999, // $19.99
        category: 'guides',
        filePath: '/uploads/linkedin-guide.pdf',
        fileSize: 8388608,
        fileType: 'pdf',
        status: 'active',
        commissionPercentage: 20,
        views: 156,
        purchases: 34,
        rating: 485, // 4.85 stars
        reviewCount: 22,
      },
      {
        sellerId: user.id,
        title: 'Resume Template Bundle',
        slug: 'resume-template-bundle',
        shortDescription: 'Modern resume templates with matching cover letters',
        description: `Professional resume bundle includes:
- 4 modern resume designs
- 4 matching cover letter templates
- Professional fonts included
- ATS-friendly formatting
- All formats: Word, PDF, Google Docs
- Customization guide included

Stand out to recruiters with these professionally designed resume templates used by top job seekers.`,
        price: 1799, // $17.99
        discountPrice: null,
        category: 'templates',
        filePath: '/uploads/resume-bundle.zip',
        fileSize: 15728640,
        fileType: 'zip',
        status: 'active',
        commissionPercentage: 20,
        views: 203,
        purchases: 67,
        rating: 470, // 4.7 stars
        reviewCount: 31,
      },
      {
        sellerId: user.id,
        title: 'Networking Success Strategy',
        slug: 'networking-success-strategy',
        shortDescription: 'Master the art of professional networking with proven strategies',
        description: `Transform your networking approach:
- Psychology of effective networking
- Conversation starters that work
- Follow-up email templates
- Virtual networking best practices
- Building authentic relationships
- Event strategy guide
- Cold outreach templates

Learn the strategies used by top entrepreneurs and executives to build powerful professional networks.`,
        price: 3499, // $34.99
        discountPrice: 2499, // $24.99
        category: 'courses',
        filePath: '/uploads/networking-strategy.pdf',
        fileSize: 12582912,
        fileType: 'pdf',
        status: 'active',
        commissionPercentage: 20,
        views: 289,
        purchases: 91,
        rating: 495, // 4.95 stars
        reviewCount: 44,
      },
    ];

    // Insert all products
    await db.insert(digitalProducts).values(sampleProducts);
    console.log(`[Shop Seed] ✅ Created ${sampleProducts.length} sample products for ${user.email}`);
  } catch (error) {
    console.error('[Shop Seed] Error:', error);
  }
}
