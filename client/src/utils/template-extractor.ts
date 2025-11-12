// Extract valuable styling and icon data from TalkLink templates
// This utility processes the imported templates and extracts reusable components

interface ExtractedIcon {
  id: string;
  name: string;
  svgCode: string;
  defaultColor?: string;
  category?: string;
}

interface ExtractedColorScheme {
  id: string;
  name: string;
  primary: string;
  secondary?: string;
  accent?: string;
  background?: string;
  text?: string;
  heading?: string;
}

interface ExtractedStyle {
  id: string;
  templateName: string;
  fonts?: {
    primary?: string;
    heading?: string;
  };
  spacing?: {
    padding?: string;
    margin?: string;
    gap?: string;
  };
  borderRadius?: string;
  shadows?: string;
}

export class TemplateExtractor {
  private icons: Map<string, ExtractedIcon> = new Map();
  private colorSchemes: Map<string, ExtractedColorScheme> = new Map();
  private styles: Map<string, ExtractedStyle> = new Map();

  // Process a single TalkLink template
  processTemplate(templateData: any): void {
    if (!templateData) return;

    // Extract social icons
    if (templateData.socialIcons && Array.isArray(templateData.socialIcons)) {
      templateData.socialIcons.forEach((icon: any) => {
        if (icon.svg_code && !this.icons.has(icon.id)) {
          this.icons.set(icon.id, {
            id: icon.id,
            name: icon.name,
            svgCode: this.cleanSvgCode(icon.svg_code),
            defaultColor: this.extractColorFromSvg(icon.svg_code),
            category: 'social'
          });
        }
      });
    }

    // Extract template style/colors
    if (templateData.templateStyle) {
      const style = templateData.templateStyle;
      const schemeId = `${templateData.id}_colors`;
      
      this.colorSchemes.set(schemeId, {
        id: schemeId,
        name: templateData.title || 'Template Colors',
        primary: style.primary_color || '#3b82f6',
        secondary: style.secondary_color || '#e5e7eb',
        accent: style.accent_color || style.primary_color || '#3b82f6',
        background: style.bgcolor || '#ffffff',
        text: style.textcolor || '#1a1a1a',
        heading: style.headingcolor || '#000000'
      });

      // Extract additional styling
      this.styles.set(templateData.id, {
        id: templateData.id,
        templateName: templateData.title || 'Unknown',
        fonts: {
          primary: style.fontfamily || 'Inter, sans-serif',
          heading: style.headingfont || style.fontfamily
        },
        spacing: {
          padding: style.padding || '1rem',
          margin: style.margin || '0',
          gap: style.gap || '1rem'
        },
        borderRadius: style.borderradius || '0.5rem',
        shadows: style.shadow || 'none'
      });
    }
  }

  // Clean SVG code for proper rendering
  private cleanSvgCode(svgCode: string): string {
    // Remove escaped characters
    let cleaned = svgCode.replace(/\\/g, '');
    
    // Ensure proper SVG structure
    if (!cleaned.startsWith('<svg')) {
      cleaned = `<svg>${cleaned}</svg>`;
    }
    
    // Add viewBox if missing
    if (!cleaned.includes('viewBox')) {
      cleaned = cleaned.replace('<svg', '<svg viewBox="0 0 24 24"');
    }
    
    // Add default width/height if missing
    if (!cleaned.includes('width=')) {
      cleaned = cleaned.replace('<svg', '<svg width="24" height="24"');
    }
    
    return cleaned;
  }

  // Extract primary color from SVG
  private extractColorFromSvg(svgCode: string): string | undefined {
    const fillMatch = svgCode.match(/fill=["']([^"']+)["']/);
    if (fillMatch && fillMatch[1] !== 'none') {
      return fillMatch[1];
    }
    
    const strokeMatch = svgCode.match(/stroke=["']([^"']+)["']/);
    if (strokeMatch && strokeMatch[1] !== 'none') {
      return strokeMatch[1];
    }
    
    return undefined;
  }

  // Process all templates from import data
  processAllTemplates(importData: any): void {
    if (importData.templates && Array.isArray(importData.templates)) {
      importData.templates.forEach((template: any) => {
        if (template.templateData) {
          try {
            const data = typeof template.templateData === 'string' 
              ? JSON.parse(template.templateData)
              : template.templateData;
            this.processTemplate(data);
          } catch (error) {
            console.error(`Failed to process template ${template.id}:`, error);
          }
        }
      });
    }
  }

  // Get all extracted icons
  getIcons(): ExtractedIcon[] {
    return Array.from(this.icons.values());
  }

  // Get all extracted color schemes
  getColorSchemes(): ExtractedColorScheme[] {
    return Array.from(this.colorSchemes.values());
  }

  // Get all extracted styles
  getStyles(): ExtractedStyle[] {
    return Array.from(this.styles.values());
  }

  // Get unique social icon types
  getUniqueIconTypes(): string[] {
    const types = new Set<string>();
    this.icons.forEach(icon => {
      types.add(icon.name.toLowerCase());
    });
    return Array.from(types);
  }

  // Get a specific color scheme
  getColorScheme(id: string): ExtractedColorScheme | undefined {
    return this.colorSchemes.get(id);
  }

  // Get icons by category
  getIconsByCategory(category: string): ExtractedIcon[] {
    return Array.from(this.icons.values()).filter(icon => icon.category === category);
  }

  // Convert to format compatible with our system
  convertToOurFormat(templateData: any): any {
    return {
      profile: {
        name: templateData.profile?.name || '',
        tagline: templateData.profile?.tagline || '',
        image: templateData.profile?.image || ''
      },
      theme: {
        colors: this.getColorScheme(`${templateData.id}_colors`),
        style: this.styles.get(templateData.id)
      },
      socialLinks: this.convertSocialIcons(templateData.socialIcons || [])
    };
  }

  // Convert social icons to our format
  private convertSocialIcons(icons: any[]): any[] {
    return icons.map(icon => ({
      platform: icon.name.toLowerCase(),
      url: icon.value || '',
      icon: this.icons.get(icon.id) || null,
      enabled: icon.status === 1
    }));
  }

  // Export all extracted data as JSON
  exportData(): string {
    return JSON.stringify({
      icons: this.getIcons(),
      colorSchemes: this.getColorSchemes(),
      styles: this.getStyles(),
      metadata: {
        totalIcons: this.icons.size,
        totalColorSchemes: this.colorSchemes.size,
        totalStyles: this.styles.size,
        extractedAt: new Date().toISOString()
      }
    }, null, 2);
  }
}

// Singleton instance for easy access
export const templateExtractor = new TemplateExtractor();