import { z } from "zod";

// Header element types
export const headerElementTypeSchema = z.enum([
  "profile", "logo", "header", "name", "title", "company"
]);

// Background types
export const backgroundTypeSchema = z.enum(["solid", "gradient", "image"]);

// Shape divider presets
export const shapeDividerPresetSchema = z.enum([
  "wave", "waves-brush", "clouds", "zigzag", "triangle", "triangle-negative", "triangle-asymmetrical", 
  "tilt", "tilt-opacity", "fan-opacity", "curve", "curve-asymmetrical", 
  "drop", "mountain", "opacity-fan-alt", "book", "custom"
]);

// Position schema
export const positionSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  width: z.number().default(100),
  height: z.number().default(50)
});

// Style schema
export const elementStyleSchema = z.object({
  fontSize: z.number().default(16),
  fontWeight: z.number().default(400),
  color: z.string().default("#ffffff"),
  fontFamily: z.string().default("Inter"),
  textAlign: z.enum(["left", "center", "right"]).default("center"),
  opacity: z.number().min(0).max(1).default(1)
});

// Header element schema
export const headerElementSchema = z.object({
  id: z.string(),
  type: headerElementTypeSchema,
  visible: z.boolean().default(true),
  order: z.number().default(0),
  position: positionSchema,
  style: elementStyleSchema,
  content: z.object({
    text: z.string().optional(),
    imageUrl: z.string().optional(),
    size: z.number().default(80), // for profile/logo
    borderRadius: z.number().default(50) // for profile
  }).default({})
});

// Background schema
export const backgroundSchema = z.object({
  type: backgroundTypeSchema,
  solid: z.object({
    color: z.string().default("#22c55e")
  }).optional(),
  gradient: z.object({
    type: z.enum(["linear", "radial"]).default("linear"),
    angle: z.number().default(45),
    stops: z.array(z.object({
      color: z.string(),
      position: z.number().min(0).max(100)
    })).default([
      { color: "#22c55e", position: 0 },
      { color: "#16a34a", position: 100 }
    ])
  }).optional(),
  image: z.object({
    url: z.string(),
    overlay: z.object({
      color: z.string().default("#000000"),
      opacity: z.number().min(0).max(1).default(0.3)
    }).optional()
  }).optional()
});

// Shape divider schema
export const shapeDividerSchema = z.object({
  enabled: z.boolean().default(false),
  preset: shapeDividerPresetSchema.default("wave"),
  customPath: z.string().optional(), // SVG path for custom shapes
  color: z.string().default("#ffffff"),
  height: z.number().default(100),
  flip: z.boolean().default(false),
  opacity: z.number().min(0).max(1).default(1)
});

// Main header preset schema
export const headerPresetSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  canvasHeight: z.number().default(200),
  background: backgroundSchema,
  topDivider: shapeDividerSchema.optional(),
  bottomDivider: shapeDividerSchema.optional(),
  elements: z.array(headerElementSchema).default([]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// Types
export type HeaderElementType = z.infer<typeof headerElementTypeSchema>;
export type BackgroundType = z.infer<typeof backgroundTypeSchema>;
export type ShapeDividerPreset = z.infer<typeof shapeDividerPresetSchema>;
export type Position = z.infer<typeof positionSchema>;
export type ElementStyle = z.infer<typeof elementStyleSchema>;
export type HeaderElement = z.infer<typeof headerElementSchema>;
export type Background = z.infer<typeof backgroundSchema>;
export type ShapeDivider = z.infer<typeof shapeDividerSchema>;
export type HeaderPreset = z.infer<typeof headerPresetSchema>;

// Default header preset
export const defaultHeaderPreset: HeaderPreset = {
  id: "default",
  name: "Default Header",
  canvasHeight: 200,
  background: {
    type: "solid",
    solid: { color: "#22c55e" }
  },
  elements: [
    {
      id: "profile-1",
      type: "profile",
      visible: true,
      order: 0,
      position: { x: 50, y: 30, width: 80, height: 80 },
      style: { fontSize: 16, fontWeight: 400, color: "#ffffff", fontFamily: "Inter", textAlign: "center", opacity: 1 },
      content: { size: 80, borderRadius: 50 }
    },
    {
      id: "name-1",
      type: "name",
      visible: true,
      order: 1,
      position: { x: 50, y: 120, width: 200, height: 30 },
      style: { fontSize: 24, fontWeight: 600, color: "#ffffff", fontFamily: "Inter", textAlign: "center", opacity: 1 },
      content: {}
    },
    {
      id: "title-1",
      type: "title",
      visible: true,
      order: 2,
      position: { x: 50, y: 150, width: 200, height: 20 },
      style: { fontSize: 16, fontWeight: 400, color: "#ffffff", fontFamily: "Inter", textAlign: "center", opacity: 1 },
      content: {}
    }
  ]
};

// Shape divider presets - All 15 Elementor Pro-style shapes
export const SHAPE_PRESETS: Record<string, string> = {
  // Basic Wave
  wave: "M0,192L48,208C96,224,192,256,288,245.3C384,235,480,181,576,181.3C672,181,768,235,864,218.7C960,203,1056,117,1152,117.3C1248,117,1344,203,1392,245.3L1440,288L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
  
  // Waves Brush - artistic brushed wave effect
  "waves-brush": "M0,224L34.3,213.3C68.6,203,137,181,206,176C274.3,171,343,181,411,197.3C480,213,549,235,617,229.3C685.7,224,754,192,823,181.3C891.4,171,960,181,1029,192C1097.1,203,1166,213,1234,202.7C1302.9,192,1371,160,1406,144L1440,128L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z",
  
  // Clouds - fluffy cloud-like shapes
  clouds: "M0,224L40,234.7C80,245,160,267,240,256C320,245,400,203,480,186.7C560,171,640,181,720,197.3C800,213,880,235,960,240C1040,245,1120,235,1200,218.7C1280,203,1360,181,1400,170.7L1440,160L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z",
  
  // Zigzag (Jagged)
  zigzag: "M0,160L60,120L120,160L180,120L240,160L300,120L360,160L420,120L480,160L540,120L600,160L660,120L720,160L780,120L840,160L900,120L960,160L1020,120L1080,160L1140,120L1200,160L1260,120L1320,160L1380,120L1440,160L1440,320L0,320Z",
  
  // Triangle
  triangle: "M0,320L1440,320L720,64L0,320Z",
  
  // Triangle Negative - upward pointing triangle (Elementor exact code)
  "triangle-negative": "M500.2,94.7L0,0v100h1000V0L500.2,94.7z",
  
  // Triangle Asymmetrical
  "triangle-asymmetrical": "M0,320L1440,320L960,32L0,320Z",
  
  // Tilt
  tilt: "M0,320L1440,32L1440,320Z",
  
  // Tilt Opacity - layered tilt effect
  "tilt-opacity": "M0,320L1440,64L1440,320Z",
  
  // Fan Opacity - radiating fan effect
  "fan-opacity": "M0,320L180,288C360,256,720,192,1080,160C1260,144,1440,160,1440,160L1440,320L0,320Z",
  
  // Curve
  curve: "M0,160L48,176C96,192,192,224,288,234.7C384,245,480,235,576,208C672,181,768,139,864,128C960,117,1056,139,1152,144C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
  
  // Curve Asymmetrical
  "curve-asymmetrical": "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,117.3C672,107,768,117,864,138.7C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
  
  // Drop (Drop Brush)
  drop: "M0,192L48,224C96,256,192,320,288,325.3C384,331,480,277,576,245.3C672,213,768,203,864,218.7C960,235,1056,277,1152,282.7C1248,288,1344,256,1392,240L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
  
  // Mountains
  mountain: "M0,320L144,288C288,256,576,192,864,186.7C1152,181,1440,235,1440,256L1440,320L0,320Z",
  
  // Opacity Fan Alt - alternative fan pattern
  "opacity-fan-alt": "M0,320L120,304C240,288,480,256,720,234.7C960,213,1200,203,1320,197.3L1440,192L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z",
  
  // Book - looks like two open pages
  book: "M0,192L240,160L480,192L720,160L960,192L1200,160L1440,192L1440,320L1200,320C960,320,720,320,480,320C240,320,120,320,60,320L0,320Z"
};