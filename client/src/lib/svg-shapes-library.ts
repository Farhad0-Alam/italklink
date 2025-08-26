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
  },
  {
    id: 'lightning_bolt',
    name: 'Lightning Bolt',
    category: 'creative',
    description: 'Dynamic lightning bolt shape',
    svgCode: `<polygon points="120,10 80,90 100,90 60,180 100,100 80,100" fill="{color1}"/>`,
    viewBox: "0 0 180 190",
    customizableProps: {
      colors: ['color1'],
      fillable: true,
      strokeable: true,
      scalable: true,
      rotatable: true
    },
    tags: ['lightning', 'bolt', 'energy', 'power', 'electric'],
    difficulty: 'easy'
  },
  {
    id: 'spiral_galaxy',
    name: 'Spiral Galaxy',
    category: 'creative',
    description: 'Cosmic spiral pattern',
    svgCode: `<g transform="translate(100,100)">
      <path d="M0,0 Q-20,-40 -60,-30 Q-80,10 -40,50 Q20,60 50,20 Q40,-30 0,-40 Q-30,-20 -20,20 Q10,30 20,0" fill="{color1}" opacity="0.8"/>
      <circle cx="0" cy="0" r="8" fill="{color2}"/>
    </g>`,
    viewBox: "0 0 200 200",
    customizableProps: {
      colors: ['color1', 'color2'],
      fillable: true,
      strokeable: true,
      scalable: true,
      rotatable: true
    },
    tags: ['spiral', 'galaxy', 'space', 'cosmic', 'abstract'],
    difficulty: 'advanced'
  },

  // === MORE GEOMETRIC SHAPES ===
  {
    id: 'pentagon_regular',
    name: 'Pentagon',
    category: 'geometric',
    description: 'Regular pentagon shape',
    svgCode: `<polygon points="100,20 150,60 130,120 70,120 50,60" fill="{color1}"/>`,
    viewBox: "0 0 200 140",
    customizableProps: {
      colors: ['color1'],
      fillable: true,
      strokeable: true,
      scalable: true,
      rotatable: true
    },
    tags: ['pentagon', 'geometric', 'polygon', 'shape'],
    difficulty: 'easy'
  },
  {
    id: 'octagon_regular',
    name: 'Octagon',
    category: 'geometric',
    description: 'Regular octagon shape',
    svgCode: `<polygon points="100,30 140,30 170,60 170,100 140,130 100,130 70,100 70,60" fill="{color1}"/>`,
    viewBox: "0 0 240 160",
    customizableProps: {
      colors: ['color1'],
      fillable: true,
      strokeable: true,
      scalable: true,
      rotatable: true
    },
    tags: ['octagon', 'geometric', 'polygon', 'eight-sided'],
    difficulty: 'easy'
  },
  {
    id: 'star_five_point',
    name: 'Five Point Star',
    category: 'geometric',
    description: 'Classic five-pointed star',
    svgCode: `<polygon points="100,10 120,70 180,70 135,110 155,170 100,135 45,170 65,110 20,70 80,70" fill="{color1}"/>`,
    viewBox: "0 0 200 180",
    customizableProps: {
      colors: ['color1'],
      fillable: true,
      strokeable: true,
      scalable: true,
      rotatable: true
    },
    tags: ['star', 'five-point', 'classic', 'geometric'],
    difficulty: 'easy'
  },
  {
    id: 'heart_shape',
    name: 'Heart',
    category: 'creative',
    description: 'Classic heart shape',
    svgCode: `<path d="M100,180 C100,180 20,120 20,80 C20,40 50,20 80,40 C90,30 110,30 120,40 C150,20 180,40 180,80 C180,120 100,180 100,180 Z" fill="{color1}"/>`,
    viewBox: "0 0 200 190",
    customizableProps: {
      colors: ['color1'],
      fillable: true,
      strokeable: true,
      scalable: true,
      rotatable: true
    },
    tags: ['heart', 'love', 'romantic', 'classic'],
    difficulty: 'medium'
  },
  {
    id: 'infinity_symbol',
    name: 'Infinity',
    category: 'abstract',
    description: 'Infinity symbol shape',
    svgCode: `<path d="M60,100 C20,60 20,40 60,40 C100,40 140,60 180,60 C220,60 220,80 180,80 C140,80 100,100 60,100 C20,100 20,120 60,120 C100,120 140,100 180,100 C220,100 220,140 180,140 C140,140 100,120 60,120 C20,120 20,100 60,100" fill="{color1}"/>`,
    viewBox: "0 0 240 180",
    customizableProps: {
      colors: ['color1'],
      fillable: true,
      strokeable: true,
      scalable: true,
      rotatable: true
    },
    tags: ['infinity', 'symbol', 'endless', 'loop'],
    difficulty: 'medium'
  },

  // === MORE WAVE VARIATIONS ===
  {
    id: 'wave_sharp',
    name: 'Sharp Wave',
    category: 'waves',
    description: 'Angular wave with sharp peaks',
    svgCode: `<polygon points="0,100 100,50 200,100 300,50 400,100 500,50 600,100 600,150 0,150" fill="{color1}"/>`,
    viewBox: "0 0 600 150",
    customizableProps: {
      colors: ['color1'],
      fillable: true,
      strokeable: true,
      scalable: true,
      rotatable: true
    },
    tags: ['wave', 'sharp', 'angular', 'zigzag'],
    difficulty: 'easy'
  },
  {
    id: 'wave_curves',
    name: 'Curved Waves',
    category: 'waves',
    description: 'Smooth curved wave pattern',
    svgCode: `<path d="M0,80 Q150,20 300,80 T600,80 L600,150 L0,150 Z" fill="{color1}"/>`,
    viewBox: "0 0 600 150",
    customizableProps: {
      colors: ['color1'],
      fillable: true,
      strokeable: true,
      scalable: true,
      rotatable: true
    },
    tags: ['wave', 'curved', 'smooth', 'flowing'],
    difficulty: 'medium'
  },

  // === BUSINESS/PROFESSIONAL SHAPES ===
  {
    id: 'shield_badge',
    name: 'Shield Badge',
    category: 'professional',
    description: 'Professional shield emblem',
    svgCode: `<path d="M100,20 L160,40 L160,100 Q160,140 100,160 Q40,140 40,100 L40,40 Z" fill="{color1}" stroke="{color2}" stroke-width="2"/>`,
    viewBox: "0 0 200 180",
    customizableProps: {
      colors: ['color1', 'color2'],
      fillable: true,
      strokeable: true,
      scalable: true,
      rotatable: true
    },
    tags: ['shield', 'badge', 'security', 'protection', 'professional'],
    difficulty: 'medium'
  },
  {
    id: 'gear_cog',
    name: 'Gear Cog',
    category: 'professional',
    description: 'Technical gear wheel',
    svgCode: `<g transform="translate(100,100)">
      <polygon points="-60,-10 -60,10 -80,15 -80,35 -60,40 -60,60 -40,60 -35,80 -15,80 -10,60 10,60 15,80 35,80 40,60 60,60 60,40 80,35 80,15 60,10 60,-10 40,-10 35,-30 15,-30 10,-10 -10,-10 -15,-30 -35,-30 -40,-10" fill="{color1}"/>
      <circle cx="0" cy="0" r="25" fill="{color2}"/>
    </g>`,
    viewBox: "0 0 200 200",
    customizableProps: {
      colors: ['color1', 'color2'],
      fillable: true,
      strokeable: true,
      scalable: true,
      rotatable: true
    },
    tags: ['gear', 'cog', 'mechanical', 'technical', 'industry'],
    difficulty: 'advanced'
  },
  {
    id: 'trophy_cup',
    name: 'Trophy Cup',
    category: 'professional',
    description: 'Achievement trophy shape',
    svgCode: `<g>
      <ellipse cx="100" cy="40" rx="40" ry="20" fill="{color1}"/>
      <rect x="70" y="40" width="60" height="60" fill="{color1}"/>
      <ellipse cx="100" cy="100" rx="30" ry="15" fill="{color1}"/>
      <rect x="90" y="100" width="20" height="30" fill="{color2}"/>
      <rect x="70" y="130" width="60" height="10" fill="{color2}"/>
    </g>`,
    viewBox: "0 0 200 150",
    customizableProps: {
      colors: ['color1', 'color2'],
      fillable: true,
      strokeable: true,
      scalable: true,
      rotatable: true
    },
    tags: ['trophy', 'award', 'achievement', 'winner', 'success'],
    difficulty: 'medium'
  },

  // === NATURE ADDITIONS ===
  {
    id: 'sun_rays',
    name: 'Sun with Rays',
    category: 'nature',
    description: 'Bright sun with radiating rays',
    svgCode: `<g transform="translate(100,100)">
      <circle cx="0" cy="0" r="30" fill="{color1}"/>
      <g stroke="{color2}" stroke-width="4" stroke-linecap="round">
        <line x1="0" y1="-55" x2="0" y2="-40"/>
        <line x1="39" y1="-39" x2="28" y2="-28"/>
        <line x1="55" y1="0" x2="40" y2="0"/>
        <line x1="39" y1="39" x2="28" y2="28"/>
        <line x1="0" y1="55" x2="0" y2="40"/>
        <line x1="-39" y1="39" x2="-28" y2="28"/>
        <line x1="-55" y1="0" x2="-40" y2="0"/>
        <line x1="-39" y1="-39" x2="-28" y2="-28"/>
      </g>
    </g>`,
    viewBox: "0 0 200 200",
    customizableProps: {
      colors: ['color1', 'color2'],
      fillable: true,
      strokeable: true,
      scalable: true,
      rotatable: true
    },
    tags: ['sun', 'rays', 'sunshine', 'bright', 'energy'],
    difficulty: 'medium'
  },
  {
    id: 'cloud_fluffy',
    name: 'Fluffy Cloud',
    category: 'nature',
    description: 'Soft fluffy cloud shape',
    svgCode: `<path d="M60,80 Q40,60 60,40 Q80,20 120,30 Q160,20 180,40 Q200,50 190,70 Q200,90 170,90 L70,90 Q40,90 60,80 Z" fill="{color1}"/>`,
    viewBox: "0 0 240 110",
    customizableProps: {
      colors: ['color1'],
      fillable: true,
      strokeable: true,
      scalable: true,
      rotatable: true
    },
    tags: ['cloud', 'fluffy', 'sky', 'weather', 'soft'],
    difficulty: 'medium'
  },
  {
    id: 'tree_simple',
    name: 'Simple Tree',
    category: 'nature',
    description: 'Minimalist tree silhouette',
    svgCode: `<g>
      <rect x="95" y="120" width="10" height="40" fill="{color2}"/>
      <circle cx="100" cy="100" r="30" fill="{color1}"/>
      <circle cx="85" cy="85" r="20" fill="{color1}"/>
      <circle cx="115" cy="85" r="20" fill="{color1}"/>
    </g>`,
    viewBox: "0 0 200 170",
    customizableProps: {
      colors: ['color1', 'color2'],
      fillable: true,
      strokeable: true,
      scalable: true,
      rotatable: true
    },
    tags: ['tree', 'nature', 'plant', 'green', 'environment'],
    difficulty: 'easy'
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