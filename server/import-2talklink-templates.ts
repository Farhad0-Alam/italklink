/**
 * Import 2TalkLink Templates into Database
 */
import { db } from './db.js';
import { globalTemplates } from '../shared/schema.js';
import fs from 'fs';

async function import2TalkLinkTemplates() {
  try {
    console.log('🚀 Starting 2TalkLink template import...');

    // Read the processed template data
    const importData = JSON.parse(fs.readFileSync('template-import-data.json', 'utf8'));
    
    console.log(`📥 Importing ${importData.templates.length} templates...`);

    // Clear existing sample templates first
    console.log('🗑️ Clearing existing sample templates...');
    await db.delete(globalTemplates);

    // Insert new 2TalkLink templates
    console.log('✨ Inserting 2TalkLink templates...');
    
    for (const template of importData.templates) {
      const result = await db.insert(globalTemplates).values({
        id: template.id,
        name: template.name,
        description: template.description,
        templateData: template.templateData,
        previewImage: template.previewImage,
        isActive: template.isActive,
        createdBy: null
      });
      
      console.log(`✅ Imported: ${template.name}`);
    }

    console.log(`\n🎉 SUCCESS! Imported ${importData.templates.length} templates:`);
    importData.templates.forEach((template, i) => {
      console.log(`  ${i + 1}. ${template.name}`);
    });

    console.log('\n🔄 Templates are now available in the admin dashboard!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}

// Run the import
import2TalkLinkTemplates()
  .then(() => {
    console.log('✅ Import completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  });