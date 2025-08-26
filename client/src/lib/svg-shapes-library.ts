// SVG Shapes Library for Advanced Header Designs
// Contains customizable SVG shapes organized by category

export interface SVGShapeDefinition {
  id: string;
  name: string;
  category: 'waves' | 'geometric' | 'abstract' | 'nature' | 'professional' | 'creative';
  description: string;
  svgCode: string;
  viewBox: string;
  customizableProps: {
    colors: string[];
    fillable: boolean;
    strokeable: boolean;
    scalable: boolean;
    rotatable: boolean;
  };
  tags: string[];
  difficulty: 'easy' | 'medium' | 'advanced';
}

export const SVG_SHAPES_LIBRARY: SVGShapeDefinition[] = [
  // === WAVES CATEGORY ===
  {
    id: 'wave_gentle',
    name: 'Gentle Wave',
    category: 'waves',
    description: 'Soft, flowing wave perfect for headers',
    svgCode: `<path d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,106.7C960,117,1056,139,1152,133.3C1248,128,1344,96,1392,80L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" fill="{color1}"/>`,
    viewBox: "0 0 1440 96",
    customizableProps: {
      colors: ['color1'],
      fillable: true,
      strokeable: false,
      scalable: true,
      rotatable: true
    },
    tags: ['wave', 'smooth', 'flow', 'water', 'calm'],
    difficulty: 'easy'
  },
  {
    id: 'wave_dynamic',
    name: 'Dynamic Wave',
    category: 'waves',
    description: 'Energetic wave with multiple curves',
    svgCode: `<path d="M0,64L40,74.7C80,85,160,107,240,112C320,117,400,107,480,90.7C560,75,640,53,720,58.7C800,64,880,96,960,106.7C1040,117,1120,107,1200,96C1280,85,1360,75,1400,69.3L1440,64L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z" fill="{color1}"/>`,
    viewBox: "0 0 1440 120",
    customizableProps: {
      colors: ['color1'],
      fillable: true,
      strokeable: false,
      scalable: true,
      rotatable: true
    },
    tags: ['wave', 'dynamic', 'energy', 'flow', 'motion'],
    difficulty: 'easy'
  },
  {
    id: 'wave_layered',
    name: 'Layered Waves',
    category: 'waves',
    description: 'Multiple wave layers for depth',
    svgCode: `<path d="M0,64L40,74.7C80,85,160,107,240,112C320,117,400,107,480,90.7C560,75,640,53,720,58.7C800,64,880,96,960,106.7C1040,117,1120,107,1200,96C1280,85,1360,75,1400,69.3L1440,64L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z" fill="{color1}" opacity="0.8"/>
    <path d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,106.7C960,117,1056,139,1152,133.3C1248,128,1344,96,1392,80L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" fill="{color2}" opacity="0.6"/>`,
    viewBox: "0 0 1440 160",
    customizableProps: {
      colors: ['color1', 'color2'],
      fillable: true,
      strokeable: false,
      scalable: true,
      rotatable: true
    },
    tags: ['wave', 'layered', 'depth', 'multiple', 'ocean'],
    difficulty: 'medium'
  },

  // === GEOMETRIC CATEGORY ===
  {
    id: 'triangle_modern',
    name: 'Modern Triangle',
    category: 'geometric',
    description: 'Clean geometric triangle design',
    svgCode: `<polygon points="0,0 720,0 360,200" fill="{color1}"/>`,
    viewBox: "0 0 720 200",
    customizableProps: {
      colors: ['color1'],
      fillable: true,
      strokeable: true,
      scalable: true,
      rotatable: true
    },
    tags: ['triangle', 'geometric', 'modern', 'clean', 'sharp'],
    difficulty: 'easy'
  },
  {
    id: 'hexagon_pattern',
    name: 'Hexagon Pattern',
    category: 'geometric',
    description: 'Stylish hexagonal pattern',
    svgCode: `<g>
      <polygon points="50,0 150,0 200,87 150,174 50,174 0,87" fill="{color1}" opacity="0.8"/>
      <polygon points="250,0 350,0 400,87 350,174 250,174 200,87" fill="{color2}" opacity="0.6"/>
      <polygon points="450,0 550,0 600,87 550,174 450,174 400,87" fill="{color1}" opacity="0.4"/>
    </g>`,
    viewBox: "0 0 600 174",
    customizableProps: {
      colors: ['color1', 'color2'],
      fillable: true,
      strokeable: true,
      scalable: true,
      rotatable: true
    },
    tags: ['hexagon', 'pattern', 'geometric', 'modern', 'tech'],
    difficulty: 'medium'
  },
  {
    id: 'diamond_split',
    name: 'Diamond Split',
    category: 'geometric',
    description: 'Split diamond design for modern headers',
    svgCode: `<g>
      <polygon points="0,100 200,0 400,100 200,150" fill="{color1}"/>
      <polygon points="200,150 400,100 600,200 400,250" fill="{color2}"/>
    </g>`,
    viewBox: "0 0 600 250",
    customizableProps: {
      colors: ['color1', 'color2'],
      fillable: true,
      strokeable: true,
      scalable: true,
      rotatable: true
    },
    tags: ['diamond', 'split', 'geometric', 'angular', 'modern'],
    difficulty: 'medium'
  },

  // === ABSTRACT CATEGORY ===
  {
    id: 'blob_organic',
    name: 'Organic Blob',
    category: 'abstract',
    description: 'Flowing organic shape for creative headers',
    svgCode: `<path d="M100,200 C150,50 250,80 350,120 C450,160 500,250 400,300 C300,350 200,320 100,280 C50,240 60,220 100,200 Z" fill="{color1}"/>`,
    viewBox: "0 0 500 350",
    customizableProps: {
      colors: ['color1'],
      fillable: true,
      strokeable: true,
      scalable: true,
      rotatable: true
    },
    tags: ['blob', 'organic', 'fluid', 'creative', 'modern'],
    difficulty: 'medium'
  },
  {
    id: 'splash_dynamic',
    name: 'Dynamic Splash',
    category: 'abstract',
    description: 'Dynamic splash effect for energetic designs',
    svgCode: `<g>
      <circle cx="100" cy="100" r="60" fill="{color1}" opacity="0.8"/>
      <ellipse cx="180" cy="80" rx="40" ry="60" fill="{color2}" opacity="0.6"/>
      <circle cx="250" cy="120" r="35" fill="{color1}" opacity="0.7"/>
      <ellipse cx="200" cy="180" rx="55" ry="25" fill="{color2}" opacity="0.5"/>
    </g>`,
    viewBox: "0 0 350 220",
    customizableProps: {
      colors: ['color1', 'color2'],
      fillable: true,
      strokeable: false,
      scalable: true,
      rotatable: true
    },
    tags: ['splash', 'dynamic', 'energy', 'circles', 'abstract'],
    difficulty: 'easy'
  },

  // === NATURE CATEGORY ===
  {
    id: 'mountain_range',
    name: 'Mountain Range',
    category: 'nature',
    description: 'Stylized mountain silhouette',
    svgCode: `<g>
      <polygon points="0,200 100,80 200,140 300,60 400,120 500,200" fill="{color1}" opacity="0.9"/>
      <polygon points="50,200 150,100 250,160 350,80 450,140 550,200" fill="{color2}" opacity="0.7"/>
    </g>`,
    viewBox: "0 0 550 200",
    customizableProps: {
      colors: ['color1', 'color2'],
      fillable: true,
      strokeable: false,
      scalable: true,
      rotatable: false
    },
    tags: ['mountain', 'nature', 'landscape', 'silhouette', 'outdoor'],
    difficulty: 'easy'
  },
  {
    id: 'leaf_pattern',
    name: 'Leaf Pattern',
    category: 'nature',
    description: 'Elegant leaf pattern for organic feel',
    svgCode: `<g>
      <path d="M50,100 Q75,50 100,100 Q75,150 50,100" fill="{color1}" opacity="0.8"/>
      <path d="M150,80 Q175,30 200,80 Q175,130 150,80" fill="{color2}" opacity="0.6"/>
      <path d="M250,120 Q275,70 300,120 Q275,170 250,120" fill="{color1}" opacity="0.7"/>
    </g>`,
    viewBox: "0 0 350 200",
    customizableProps: {
      colors: ['color1', 'color2'],
      fillable: true,
      strokeable: true,
      scalable: true,
      rotatable: true
    },
    tags: ['leaf', 'nature', 'organic', 'pattern', 'eco'],
    difficulty: 'medium'
  },

  // === PROFESSIONAL CATEGORY ===
  {
    id: 'corporate_arrow',
    name: 'Corporate Arrow',
    category: 'professional',
    description: 'Clean arrow design for business cards',
    svgCode: `<polygon points="0,50 200,50 180,30 240,75 180,120 200,100 0,100" fill="{color1}"/>`,
    viewBox: "0 0 240 150",
    customizableProps: {
      colors: ['color1'],
      fillable: true,
      strokeable: true,
      scalable: true,
      rotatable: true
    },
    tags: ['arrow', 'corporate', 'business', 'direction', 'professional'],
    difficulty: 'easy'
  },
  {
    id: 'grid_pattern',
    name: 'Grid Pattern',
    category: 'professional',
    description: 'Structured grid for professional designs',
    svgCode: `<g stroke="{color1}" stroke-width="2" fill="none">
      <line x1="0" y1="50" x2="300" y2="50"/>
      <line x1="0" y1="100" x2="300" y2="100"/>
      <line x1="50" y1="0" x2="50" y2="150"/>
      <line x1="100" y1="0" x2="100" y2="150"/>
      <line x1="150" y1="0" x2="150" y2="150"/>
      <line x1="200" y1="0" x2="200" y2="150"/>
      <line x1="250" y1="0" x2="250" y2="150"/>
    </g>`,
    viewBox: "0 0 300 150",
    customizableProps: {
      colors: ['color1'],
      fillable: false,
      strokeable: true,
      scalable: true,
      rotatable: true
    },
    tags: ['grid', 'structure', 'professional', 'organized', 'technical'],
    difficulty: 'easy'
  },

  // === CREATIVE CATEGORY ===
  {
    id: 'brush_stroke',
    name: 'Brush Stroke',
    category: 'creative',
    description: 'Artistic brush stroke effect',
    svgCode: `<path d="M10,80 Q50,20 120,60 Q200,100 280,40 Q350,80 400,120" stroke="{color1}" stroke-width="20" fill="none" stroke-linecap="round"/>`,
    viewBox: "0 0 420 140",
    customizableProps: {
      colors: ['color1'],
      fillable: false,
      strokeable: true,
      scalable: true,
      rotatable: true
    },
    tags: ['brush', 'artistic', 'creative', 'paint', 'stroke'],
    difficulty: 'medium'
  },
  {
    id: 'starburst',
    name: 'Starburst',
    category: 'creative',
    description: 'Energetic starburst pattern',
    svgCode: `<g transform="translate(150,75)">
      <line x1="0" y1="-60" x2="0" y2="-30" stroke="{color1}" stroke-width="3"/>
      <line x1="42" y1="-42" x2="21" y2="-21" stroke="{color1}" stroke-width="3"/>
      <line x1="60" y1="0" x2="30" y2="0" stroke="{color1}" stroke-width="3"/>
      <line x1="42" y1="42" x2="21" y2="21" stroke="{color1}" stroke-width="3"/>
      <line x1="0" y1="60" x2="0" y2="30" stroke="{color1}" stroke-width="3"/>
      <line x1="-42" y1="42" x2="-21" y2="21" stroke="{color1}" stroke-width="3"/>
      <line x1="-60" y1="0" x2="-30" y2="0" stroke="{color1}" stroke-width="3"/>
      <line x1="-42" y1="-42" x2="-21" y2="-21" stroke="{color1}" stroke-width="3"/>
      <circle cx="0" cy="0" r="8" fill="{color2}"/>
    </g>`,
    viewBox: "0 0 300 150",
    customizableProps: {
      colors: ['color1', 'color2'],
      fillable: true,
      strokeable: true,
      scalable: true,
      rotatable: true
    },
    tags: ['star', 'burst', 'energy', 'radial', 'creative'],
    difficulty: 'advanced'
  }
];

// Utility functions for working with SVG shapes
export const getSVGShapesByCategory = (category: SVGShapeDefinition['category']): SVGShapeDefinition[] => {
  return SVG_SHAPES_LIBRARY.filter(shape => shape.category === category);
};

export const getSVGShapeById = (id: string): SVGShapeDefinition | undefined => {
  return SVG_SHAPES_LIBRARY.find(shape => shape.id === id);
};

export const searchSVGShapes = (query: string): SVGShapeDefinition[] => {
  const lowerQuery = query.toLowerCase();
  return SVG_SHAPES_LIBRARY.filter(shape => 
    shape.name.toLowerCase().includes(lowerQuery) ||
    shape.description.toLowerCase().includes(lowerQuery) ||
    shape.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export const applySVGShapeColors = (svgCode: string, colors: Record<string, string>): string => {
  let result = svgCode;
  Object.entries(colors).forEach(([placeholder, color]) => {
    result = result.replace(new RegExp(`{${placeholder}}`, 'g'), color);
  });
  return result;
};

export const SVG_SHAPE_CATEGORIES = [
  { id: 'waves', name: 'Waves', description: 'Flowing wave patterns', icon: '🌊' },
  { id: 'geometric', name: 'Geometric', description: 'Clean geometric shapes', icon: '📐' },
  { id: 'abstract', name: 'Abstract', description: 'Creative abstract forms', icon: '🎨' },
  { id: 'nature', name: 'Nature', description: 'Natural elements', icon: '🌿' },
  { id: 'professional', name: 'Professional', description: 'Business-oriented shapes', icon: '💼' },
  { id: 'creative', name: 'Creative', description: 'Artistic and unique designs', icon: '✨' }
];