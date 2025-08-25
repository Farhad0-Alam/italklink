/**
 * Import 2TalkLink Templates Script
 * This script imports the best 24 templates from 2TalkLink into our admin dashboard
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Read the template data
const templatesPath = '2talklink-main/2talklink-main/collection/ecardurl.ecard_templates.json';
const categoriesPath = '2talklink-main/2talklink-main/collection/ecardurl.ecard_templatecategories.json';

console.log('🔍 Reading 2TalkLink templates...');

// Parse JSON files
const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

// Create category map
const categoryMap = {};
categories.forEach(cat => {
  categoryMap[cat._id.$oid] = cat.title;
});

console.log(`📊 Found ${templates.length} total templates`);
console.log(`📁 Found ${categories.length} categories`);

// Filter active templates and get best 24
const activeTemplates = templates
  .filter(t => t.status === 1) // Only active templates
  .slice(0, 24); // Take first 24

console.log(`✅ Selected ${activeTemplates.length} templates for import`);

// Generate SQL insert statements
const sqlStatements = [];
const templateInserts = [];

activeTemplates.forEach((template, index) => {
  const templateId = `template_${index + 1}_${template.slug}`;
  const categoryName = template.catId ? categoryMap[template.catId.$oid] || 'Business' : 'Business';
  
  // Create preview image URL (placeholder for now, we'll set up proper images later)
  const previewImage = `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop&auto=format`;
  
  // Template data structure matching our current schema
  const templateData = {
    id: templateId,
    title: template.title,
    slug: template.slug,
    category: categoryName,
    htmlThemeId: template.html_theme_id || "1",
    profile: template.profile,
    socialIcons: template.SocialIconData || [],
    templateStyle: template.templateStyle || {},
    isCustomTheme: template.isCustomTheme || 0,
    status: template.status
  };

  templateInserts.push({
    id: templateId,
    name: template.title,
    description: `Professional ${categoryName} template with modern design`,
    templateData: JSON.stringify(templateData),
    previewImage: previewImage,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

// Write the import data to a JSON file
const importData = {
  templates: templateInserts,
  categories: categories.map(cat => ({
    id: cat._id.$oid,
    name: cat.title,
    status: cat.status
  })),
  totalImported: templateInserts.length
};

fs.writeFileSync('template-import-data.json', JSON.stringify(importData, null, 2));

console.log('📝 Generated template import data');
console.log(`🎯 Ready to import ${templateInserts.length} templates:`);

templateInserts.slice(0, 10).forEach((template, i) => {
  console.log(`  ${i + 1}. ${template.name}`);
});

if (templateInserts.length > 10) {
  console.log(`  ... and ${templateInserts.length - 10} more templates`);
}

console.log('\n✅ Import data ready! Next step: Insert into database');