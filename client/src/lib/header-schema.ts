import { z } from "zod";

// Header element types
export const headerElementTypeSchema = z.enum([
  "profile", "logo", "header", "name", "title", "company"
]);

// Background types
export const backgroundTypeSchema = z.enum(["solid", "gradient", "image"]);

// Shape divider presets
export const shapeDividerPresetSchema = z.enum([
  "wave", "curve", "tilt", "zigzag", "mountain", "custom"
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

// Shape divider presets
export const SHAPE_PRESETS = {
  wave: "M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,213.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
  curve: "M0,192L1440,64L1440,320L0,320Z",
  tilt: "M0,320L1440,96L1440,320Z",
  zigzag: "M0,192L80,160L160,192L240,160L320,192L400,160L480,192L560,160L640,192L720,160L800,192L880,160L960,192L1040,160L1120,192L1200,160L1280,192L1360,160L1440,192L1440,320L0,320Z",
  mountain: "M0,320L240,160L480,240L720,96L960,192L1200,128L1440,224L1440,320Z"
};