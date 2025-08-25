/**
 * Update Template Preview Images with Real 2TalkLink Images
 */
import { db } from './db.js';
import { globalTemplates } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

async function updateTemplatePreviewImages() {
  try {
    console.log('🖼️ Updating template preview images with real 2TalkLink images...');

    // Mapping of template names to their preview images
    const templatePreviewMap = [
      { name: 'Erasmus Theme', image: 'Modern Digital Business Card Template for Professionals.jpg' },
      { name: 'Cosmos Theme', image: 'Corporate Smart Business Card Template with NFC Features.jpg' },
      { name: 'Tokyo Theme', image: 'Sleek NFC Digital Business Card for Networking Events.jpg' },
      { name: 'Icarus Theme', image: 'Creative Business Card Template for Designers and Developers.jpg' },
      { name: 'Perseus Theme', image: 'Dynamic Online Business Card for Sales and Marketing Experts.jpg' },
      { name: 'Azul Marino Theme', image: 'Professional Online Contact Card Template with Email & Phone Links.jpg' },
      { name: 'Erika Theme', image: 'Clean and Elegant Virtual Business Card for Business Owners.jpg' },
      { name: 'Emerald Theme', image: 'Eco-Friendly Digital Business Card for Entrepreneurs.jpg' },
      { name: 'Cyan Theme', image: 'High-Converting Digital Business Card for LinkedIn Sharing.jpg' },
      { name: 'Tibet Theme', image: 'Interactive Digital Visiting Card for Coaches and Consultants.jpg' },
      { name: 'PentaJaze Theme', image: 'Minimalist Virtual Business Card Design with QR Code.jpg' },
      { name: 'Gaudi Theme', image: 'Mobile Friendly Digital Business Card Template for Consultants.jpg' },
      { name: 'Genesis Theme', image: 'Online Business Card Template with Social Media Integration.jpg' },
      { name: 'Canarias Theme', image: 'Personal Branding Digital Contact Card for Freelancers.jpg' },
      { name: 'Eldorado Theme', image: 'Smart Virtual Business Card for Startup Founders.jpg' },
      { name: 'Argo Theme', image: 'Stylish and Professional Digital Business Card Layout.jpg' },
      { name: 'Angel Theme', image: 'Virtual Business Card with Social Profile Links.jpg' },
      { name: 'Mars Theme', image: 'Branded Digital Business Card Design for Agencies.jpg' },
      { name: 'Rabia Theme', image: 'Clickable Digital Profile Card for Personal Websites.jpg' },
      { name: 'Twister Theme', image: 'Custom QR Code Business Card Template with Profile Photo.jpg' },
      { name: 'Orchid Theme', image: 'Digital Business Identity Card for Real Estate Professionals.jpg' },
      { name: 'Miedo Theme', image: 'Fully Customizable Mobile Business Card Design.jpg' },
      { name: 'Furia Theme', image: 'Modern Web-Based Business Card for Remote Workers.jpg' },
      { name: 'Estima Theme', image: 'Simple and Functional Virtual Business Card for Educators.jpg' },
    ];

    // Update each template with its unique preview image
    for (const mapping of templatePreviewMap) {
      const previewImageUrl = `/template-previews/${mapping.image}`;
      
      const result = await db
        .update(globalTemplates)
        .set({ 
          previewImage: previewImageUrl,
          updatedAt: new Date()
        })
        .where(eq(globalTemplates.name, mapping.name));

      console.log(`✅ Updated ${mapping.name} with preview: ${mapping.image}`);
    }

    console.log('\n🎉 Successfully updated all template preview images!');
    console.log('🖼️ Templates now show unique, professional preview images from your 2TalkLink project');

  } catch (error) {
    console.error('❌ Failed to update template preview images:', error);
    throw error;
  }
}

// Run the update
updateTemplatePreviewImages()
  .then(() => {
    console.log('✅ Template preview update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Template preview update failed:', error);
    process.exit(1);
  });