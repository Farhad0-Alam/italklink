// Process 2TalkLink templates and extract icons/colors
import { templateExtractor } from '../client/src/utils/template-extractor';
import templateData from '../template-import-data.json';
import fs from 'fs';
import path from 'path';

function processTemplates() {
  console.log('🎨 Processing 2TalkLink templates...');
  
  // Process all templates
  templateExtractor.processAllTemplates(templateData);
  
  // Get extracted data
  const icons = templateExtractor.getIcons();
  const colorSchemes = templateExtractor.getColorSchemes();
  const styles = templateExtractor.getStyles();
  
  console.log(`✅ Extracted ${icons.length} icons`);
  console.log(`✅ Extracted ${colorSchemes.length} color schemes`);
  console.log(`✅ Extracted ${styles.length} styles`);
  
  // Save extracted data
  const outputPath = './client/public/extracted-template-assets.json';
  fs.writeFileSync(outputPath, templateExtractor.exportData());
  
  console.log(`📁 Saved extracted data to ${outputPath}`);
  
  // Sample output
  console.log('\n📌 Sample extracted icons:');
  icons.slice(0, 3).forEach(icon => {
    console.log(`  - ${icon.name}: ${icon.svgCode.substring(0, 50)}...`);
  });
  
  console.log('\n🎨 Sample color schemes:');
  colorSchemes.slice(0, 3).forEach(scheme => {
    console.log(`  - ${scheme.name}: Primary=${scheme.primary}, BG=${scheme.background}`);
  });
}

// Run directly
processTemplates();

export { processTemplates };