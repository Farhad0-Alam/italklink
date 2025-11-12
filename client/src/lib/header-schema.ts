import { z } from "zod";

// Header element types
export const headerElementTypeSchema = z.enum([
  "profile", "logo", "header", "name", "title", "company"
]);

// Background types
export const backgroundTypeSchema = z.enum(["solid", "gradient", "image"]);

// Shape divider presets - Elementor shapes
export const shapeDividerPresetSchema = z.enum([
  "valley", "triangle", "triangle-asymmetrical", "curve", "curve-asymmetrical",
  "waves", "wave-brush", "waves-pattern", "tilt", "opacity-tilt", 
  "arrow", "arrow-negative", "clouds", "clouds-negative", "mountains", "mountains-2", "mountains-3",
  "split", "split-negative", "pyramids", "pyramids-negative", "drops", "drops-negative",
  "book", "book-negative", "custom"
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
  preset: shapeDividerPresetSchema.default("valley"),
  customPath: z.string().optional(), // SVG path for custom shapes
  color: z.string().default("#ffffff"),
  height: z.number().default(100),
  width: z.number().default(100), // Width percentage (100-300)
  flip: z.boolean().default(false), // Vertical flip (invert)
  flipHorizontal: z.boolean().default(false), // Horizontal flip
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

// Shape divider presets - All Elementor shapes with viewBox 0 0 1000 100
export const SHAPE_PRESETS: Record<string, string> = {
  // Valley (Triangle Negative) - inverted V shape
  valley: "M500.2,94.7L0,0v100h1000V0L500.2,94.7z",
  
  // Triangle - upward point
  triangle: "M500,98.9L0,6.1V0h1000v6.1L500,98.9z",
  
  // Triangle Asymmetrical - off-center point
  "triangle-asymmetrical": "M0,320L1440,320L960,32L0,320Z",
  
  // Curve - smooth arc
  curve: "M1000,4.3V0H0v4.3C0.9,23.1,126.7,99.2,500,100S1000,22.7,1000,4.3z",
  
  // Curve Asymmetrical - off-center arc
  "curve-asymmetrical": "M615.2,96.7C240.2,97.8,0,18.9,0,0v100h1000V0C1000,19.2,989.8,96,615.2,96.7z",
  
  // Waves - smooth wave pattern
  waves: "M0,0v3c0,0,393.8,0,483.4,0c9.2,0,16.6,7.4,16.6,16.6c0-9.1,7.4-16.6,16.6-16.6C606.2,3,1000,3,1000,3V0H0z",
  
  // Wave Brush - artistic wave
  "wave-brush": "M0,224L34.3,213.3C68.6,203,137,181,206,176C274.3,171,343,181,411,197.3C480,213,549,235,617,229.3C685.7,224,754,192,823,181.3C891.4,171,960,181,1029,192C1097.1,203,1166,213,1234,202.7C1302.9,192,1371,160,1406,144L1440,128L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z",
  
  // Waves Pattern - repeating wave
  "waves-pattern": "M0,224L34.3,213.3C68.6,203,137,181,206,176C274.3,171,343,181,411,197.3C480,213,549,235,617,229.3C685.7,224,754,192,823,181.3C891.4,171,960,181,1029,192C1097.1,203,1166,213,1234,202.7C1302.9,192,1371,160,1406,144L1440,128L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z",
  
  // Tilt - diagonal
  tilt: "M0,6V0h1000v100L0,6z",
  
  // Opacity Tilt - layered diagonal
  "opacity-tilt": "M0,320L1440,64L1440,320Z",
  
  // Arrow - chevron
  arrow: "M350,10L340,0h20L350,10z",
  
  // Arrow Negative - inverted chevron
  "arrow-negative": "M360 0L350 9.9 340 0 0 0 0 10 700 10 700 0",
  
  // Clouds - fluffy cloud shapes
  clouds: "M0 0v6.7c1.9-.8 4.7-1.4 8.5-1 9.5 1.1 11.1 6 11.1 6s2.1-.7 4.3-.2c2.1.5 2.8 2.6 2.8 2.6s.2-.5 1.4-.7c1.2-.2 1.7.2 1.7.2s0-2.1 1.9-2.8c1.9-.7 3.6.7 3.6.7s.7-2.9 3.1-4.1 4.7 0 4.7 0 1.2-.5 2.4 0 1.7 1.4 1.7 1.4h1.4c.7 0 1.2.7 1.2.7s.8-1.8 4-2.2c3.5-.4 5.3 2.4 6.2 4.4.4-.4 1-.7 1.8-.9 2.8-.7 4 .7 4 .7s1.7-5 11.1-6c9.5-1.1 12.3 3.9 12.3 3.9s1.2-4.8 5.7-5.7c4.5-.9 6.8 1.8 6.8 1.8s.6-.6 1.5-.9c.9-.2 1.9-.2 1.9-.2s5.2-6.4 12.6-3.3c7.3 3.1 4.7 9 4.7 9s1.9-.9 4 0 2.8 2.4 2.8 2.4 1.9-1.2 4.5-1.2 4.3 1.2 4.3 1.2.2-1 1.4-1.7 2.1-.7 2.1-.7-.5-3.1 2.1-5.5 5.7-1.4 5.7-1.4 1.5-2.3 4.2-1.1c2.7 1.2 1.7 5.2 1.7 5.2s.3-.1 1.3.5c.5.4.8.8.9 1.1.5-1.4 2.4-5.8 8.4-4 7.1 2.1 3.5 8.9 3.5 8.9s.8-.4 2 0 1.1 1.1 1.1 1.1 1.1-1.1 2.3-1.1 2.1.5 2.1.5 1.9-3.6 6.2-1.2 1.9 6.4 1.9 6.4 2.6-2.4 7.4 0c3.4 1.7 3.9 4.9 3.9 4.9s3.3-6.9 10.4-7.9 11.5 2.6 11.5 2.6.8 0 1.2.2c.4.2.9.9.9.9s4.4-3.1 8.3.2c1.9 1.7 1.5 5 1.5 5s.3-1.1 1.6-1.4c1.3-.3 2.3.2 2.3.2s-.1-1.2.5-1.9 1.9-.9 1.9-.9-4.7-9.3 4.4-13.4c5.6-2.5 9.2.9 9.2.9s5-6.2 15.9-6.2 16.1 8.1 16.1 8.1.7-.2 1.6-.4V0H0z",
  
  // Clouds Negative - inverted clouds
  "clouds-negative": "M265.8 3.5c-10.9 0-15.9 6.2-15.9 6.2s-3.6-3.5-9.2-.9c-9.1 4.1-4.4 13.4-4.4 13.4s-1.2.2-1.9.9c-.6.7-.5 1.9-.5 1.9s-1-.5-2.3-.2c-1.3.3-1.6 1.4-1.6 1.4s.4-3.4-1.5-5c-3.9-3.4-8.3-.2-8.3-.2s-.6-.7-.9-.9c-.4-.2-1.2-.2-1.2-.2s-4.4-3.6-11.5-2.6-10.4 7.9-10.4 7.9-.5-3.3-3.9-4.9c-4.8-2.4-7.4 0-7.4 0s2.4-4.1-1.9-6.4-6.2 1.2-6.2 1.2-.9-.5-2.1-.5-2.3 1.1-2.3 1.1.1-.7-1.1-1.1c-1.2-.4-2 0-2 0s3.6-6.8-3.5-8.9c-6-1.8-7.9 2.6-8.4 4-.1-.3-.4-.7-.9-1.1-1-.7-1.3-.5-1.3-.5s1-4-1.7-5.2c-2.7-1.2-4.2 1.1-4.2 1.1s-3.1-1-5.7 1.4-2.1 5.5-2.1 5.5-.9 0-2.1.7-1.4 1.7-1.4 1.7-1.7-1.2-4.3-1.2c-2.6 0-4.5 1.2-4.5 1.2s-.7-1.5-2.8-2.4c-2.1-.9-4 0-4 0s2.6-5.9-4.7-9c-7.3-3.1-12.6 3.3-12.6 3.3s-.9 0-1.9.2c-.9.2-1.5.9-1.5.9S99.4 3 94.9 3.9c-4.5.9-5.7 5.7-5.7 5.7s-2.8-5-12.3-3.9-11.1 6-11.1 6-1.2-1.4-4-.7c-.8.2-1.3.5-1.8.9-.9-2.1-2.7-4.9-6.2-4.4-3.2.4-4 2.2-4 2.2s-.5-.7-1.2-.7h-1.4s-.5-.9-1.7-1.4-2.4 0-2.4 0-2.4-1.2-4.7 0-3.1 4.1-3.1 4.1-1.7-1.4-3.6-.7c-1.9.7-1.9 2.8-1.9 2.8s-.5-.5-1.7-.2c-1.2.2-1.4.7-1.4.7s-.7-2.3-2.8-2.8c-2.1-.5-4.3.2-4.3.2s-1.7-5-11.1-6c-3.8-.4-6.6.2-8.5 1v21.2h283.5V11.1c-.9.2-1.6.4-1.6.4s-5.2-8-16.1-8z",
  
  // Mountains - variation 1
  mountains: "M473,67.3c-203.9,88.3-263.1-34-320.3,0C66,119.1,0,59.7,0,59.7V0h1000v59.7 c0,0-62.1,26.1-94.9,29.3c-32.8,3.3-62.8-12.3-75.8-22.1C806,49.6,745.3,8.7,694.9,4.7S492.4,59,473,67.3z",
  
  // Mountains - variation 2
  "mountains-2": "M734,67.3c-45.5,0-77.2-23.2-129.1-39.1c-28.6-8.7-150.3-10.1-254,39.1 s-91.7-34.4-149.2,0C115.7,118.3,0,39.8,0,39.8V0h1000v36.5c0,0-28.2-18.5-92.1-18.5C810.2,18.1,775.7,67.3,734,67.3z",
  
  // Mountains - variation 3
  "mountains-3": "M766.1,28.9c-200-57.5-266,65.5-395.1,19.5C242,1.8,242,5.4,184.8,20.6C128,35.8,132.3,44.9,89.9,52.5C28.6,63.7,0,0,0,0 h1000c0,0-9.9,40.9-83.6,48.1S829.6,47,766.1,28.9z",
  
  // Split - dual diagonal
  split: "M0,0v3c0,0,393.8,0,483.4,0c9.2,0,16.6,7.4,16.6,16.6c0-9.1,7.4-16.6,16.6-16.6C606.2,3,1000,3,1000,3V0H0z",
  
  // Split Negative - inverted dual diagonal
  "split-negative": "M519.8,0.2c-11,0-19.8,8.5-19.8,19c0-10.4-8.8-19-19.8-19L0,0v20h1000V0.2H519.8z",
  
  // Pyramids - layered triangles
  pyramids: "M761.9,44.1L643.1,27.2L333.8,98L0,3.8V0l1000,0v3.9",
  
  // Pyramids Negative - inverted layered triangles
  "pyramids-negative": "M761.9,40.6L643.1,24L333.9,93.8L0.1,1H0v99h1000V1",
  
  // Drops - water drop effect
  drops: "M282.7 3.4c-2 3.8-2.2 6.6-1.8 10.8.3 3.3 2 8.5.4 11.6-1.4 2.6-4 2.5-5-.2-1.2-3.4.3-7.6.5-11.1.3-4.3-2.9-6.9-7.4-5.8-3.1.7-4.1 3.3-4.3 6.2-.2 2 1.2 8-.1 9.6-3.1 4.3-2.5-4.5-2.5-5.2.1-4-.1-9.6-4.1-11.6-4.5-2.3-6.1 1-5.5 5 .2 1.4 1.5 10.2-2.7 6.9-2.5-1.9.4-7.5-.9-10.3-.8-1.8-2.6-4.2-4.8-4.1-2.4.1-2.7 2.2-4 3.7-3.3 3.8-2.2-1.2-4.8-2.7-5.5-3.1-2 5.6-2.9 7.3-1.4 2.4-3.1.6-3.3-1.3-.1-1.5.5-3.1.4-4.6-.3-4.3-2.9-5.3-5.2-1.2-3.7 6.7-2.8-1.9-6.5-.4-3 1.1-.9 9.2-.6 11.1.7 4.1-2.2 5.2-2.7.8-.4-3.6 2.8-10.2.8-13.4-2.1-3.3-6.7-.1-7.9 2.4-2.1 4.2-.4 8.7 0 13.1.2 2-.8 8.9-3.8 4.8-3.1-4.3 2.5-11.6.2-16.3-1.1-2.2-5.8-3.5-7.2-1-.8 1.4 1 3.4.3 4.8s-2.2 1.2-2.8-.3c-.8-2.1 2.2-4.8-.1-6.5-1.3-.9-3.5.3-4.9.5-2.4-.1-3.3 0-4.5 2-.7 1.2-.4 3-2.3 2.1-1.9-.8-1.7-4.3-4.1-4.9-2.1-.6-4 1.3-5.1 2.9-.9 1.4-1.3 3-1.3 4.6 0 1.9 1.4 4.2.3 6-2.4 4.2-4.2-2.2-3.8-4.4.5-2.9 2-7.7-2.7-7.5-5.2.3-6.1 5.8-6.4 9.8-.1 1.3 1.5 10.4-2 8.4-1.8-1-.5-7.5-.6-9.1-.1-3.5-1.6-8.3-6.3-7.1-7.6 1.9 2.1 18.2-4.8 18.7-3.7.3-2.3-6.2-2-8.1.5-3.1.5-11.4-5.5-8.5-2.2 1.1-1 2.3-1.3 4.3-.2 1.8-1.3 3.2-2.3.8-1.1-2.5.8-6.7-3.9-6.6-8 .1-.7 16.4-4.8 15.8-2.8-.4-1-9.3-1.3-11.3-.6-3.5-3.5-7.8-7.8-6.9-4.4.9-1.4 6.5-1.4 9.1 0 3.1-3.4 5.9-4.4 1.7-.5-2.2.9-4.4.6-6.6-.3-1.9-1.5-4.1-3.2-5.2-5.3-3.4-4.9 5.2-8.1 4.5-1.4-.3-3-8.1-6.1-4.1-.7.9 2 10.3-2.2 8-2-1.1-.1-6.7-.7-8.9-1.8-6.2-4.7 2.3-6.1 3.1-2.9 1.7-4.6-6.2-6.3-.6-.5 1.7-.4 3.7-.2 5.4.2 1.6 1.5 4.6 1 6.1-.6 1.8-1.7 1.7-2.6.3-1-1.6-.4-4.5-.2-6.2.3-2.5 2.4-8.4-.2-10.3-3.1-2.1-6.8 2.1-7.7 4.5-1.5 4.3.3 8.7.5 13 .1 3.2-3 7.5-4.3 2.4-.6-2.4.2-5.1.6-7.4.4-2.3 1.2-6-.1-8.1-1.2-1.9-5.8-2.7-7-.5-.9 1.6 1.2 5.2-.6 5.6-2.4.6-2-2.3-1.8-3.4.3-1.5 1.1-3.2-.4-4.3-1.2-.9-4.7.3-5.9.5-2.4.5-2.5 1.4-3.6 3.3-1.2 2.1-1.4 1.7-3-.1-1.3-1.5-1.7-3.6-4-3.7-1.8-.1-3.4 1.7-4.2 3-1.4 2.2-1.3 4.1-1 6.5.2 1.4 1 3.8-.5 4.9-3.9 2.9-3.2-4.6-2.9-6.3.8-3.9-.4-8.1-5.4-5.6-3.8 1.9-4.1 6.7-4.1 10.5 0 1.6 1.2 5.8-.1 6.9-.8.7-1.8.3-2.4-.5-1.1-1.5.1-6.7 0-8.5-.1-3.5-.9-6.9-4.9-7.4-3.6-.6-6.7 1.2-6.8 4.9-.1 3.9 2 8.2.6 12-.9 2.4-2.9 2.9-4.6.9-2.4-2.8-.4-9 0-12.3.4-4.2.2-7-1.8-10.8C1.1 2.8.6 2.1 0 1.4v26.4h283.5V2.2c-.3.4-.6.8-.8 1.2z",
  
  // Drops Negative - inverted water drops
  "drops-negative": "M282.7 3.4c-2 3.8-2.2 6.6-1.8 10.8.3 3.3 2 8.5.4 11.6-1.4 2.6-4 2.5-5-.2-1.2-3.4.3-7.6.5-11.1.3-4.3-2.9-6.9-7.4-5.8-3.1.7-4.1 3.3-4.3 6.2-.2 2 1.2 8-.1 9.6-3.1 4.3-2.5-4.5-2.5-5.2.1-4-.1-9.6-4.1-11.6-4.5-2.3-6.1 1-5.5 5 .2 1.4 1.5 10.2-2.7 6.9-2.5-1.9.4-7.5-.9-10.3-.8-1.8-2.6-4.2-4.8-4.1-2.4.1-2.7 2.2-4 3.7-3.3 3.8-2.2-1.2-4.8-2.7-5.5-3.1-2 5.6-2.9 7.3-1.4 2.4-3.1.6-3.3-1.3-.1-1.5.5-3.1.4-4.6-.3-4.3-2.9-5.3-5.2-1.2-3.7 6.7-2.8-1.9-6.5-.4-3 1.1-.9 9.2-.6 11.1.7 4.1-2.2 5.2-2.7.8-.4-3.6 2.8-10.2.8-13.4-2.1-3.3-6.7-.1-7.9 2.4-2.1 4.2-.4 8.7 0 13.1.2 2-.8 8.9-3.8 4.8-3.1-4.3 2.5-11.6.2-16.3-1.1-2.2-5.8-3.5-7.2-1-.8 1.4 1 3.4.3 4.8s-2.2 1.2-2.8-.3c-.8-2.1 2.2-4.8-.1-6.5-1.3-.9-3.5.3-4.9.5-2.4-.1-3.3 0-4.5 2-.7 1.2-.4 3-2.3 2.1-1.9-.8-1.7-4.3-4.1-4.9-2.1-.6-4 1.3-5.1 2.9-.9 1.4-1.3 3-1.3 4.6 0 1.9 1.4 4.2.3 6-2.4 4.2-4.2-2.2-3.8-4.4.5-2.9 2-7.7-2.7-7.5-5.2.3-6.1 5.8-6.4 9.8-.1 1.3 1.5 10.4-2 8.4-1.8-1-.5-7.5-.6-9.1-.1-3.5-1.6-8.3-6.3-7.1-7.6 1.9 2.1 18.2-4.8 18.7-3.7.3-2.3-6.2-2-8.1.5-3.1.5-11.4-5.5-8.5-2.2 1.1-1 2.3-1.3 4.3-.2 1.8-1.3 3.2-2.3.8-1.1-2.5.8-6.7-3.9-6.6-8 .1-.7 16.4-4.8 15.8-2.8-.4-1-9.3-1.3-11.3-.6-3.5-3.5-7.8-7.8-6.9-4.4.9-1.4 6.5-1.4 9.1 0 3.1-3.4 5.9-4.4 1.7-.5-2.2.9-4.4.6-6.6-.3-1.9-1.5-4.1-3.2-5.2-5.3-3.4-4.9 5.2-8.1 4.5-1.4-.3-3-8.1-6.1-4.1-.7.9 2 10.3-2.2 8-2-1.1-.1-6.7-.7-8.9-1.8-6.2-4.7 2.3-6.1 3.1-2.9 1.7-4.6-6.2-6.3-.6-.5 1.7-.4 3.7-.2 5.4.2 1.6 1.5 4.6 1 6.1-.6 1.8-1.7 1.7-2.6.3-1-1.6-.4-4.5-.2-6.2.3-2.5 2.4-8.4-.2-10.3-3.1-2.1-6.8 2.1-7.7 4.5-1.5 4.3.3 8.7.5 13 .1 3.2-3 7.5-4.3 2.4-.6-2.4.2-5.1.6-7.4.4-2.3 1.2-6-.1-8.1-1.2-1.9-5.8-2.7-7-.5-.9 1.6 1.2 5.2-.6 5.6-2.4.6-2-2.3-1.8-3.4.3-1.5 1.1-3.2-.4-4.3-1.2-.9-4.7.3-5.9.5-2.4.5-2.5 1.4-3.6 3.3-1.2 2.1-1.4 1.7-3-.1-1.3-1.5-1.7-3.6-4-3.7-1.8-.1-3.4 1.7-4.2 3-1.4 2.2-1.3 4.1-1 6.5.2 1.4 1 3.8-.5 4.9-3.9 2.9-3.2-4.6-2.9-6.3.8-3.9-.4-8.1-5.4-5.6-3.8 1.9-4.1 6.7-4.1 10.5 0 1.6 1.2 5.8-.1 6.9-.8.7-1.8.3-2.4-.5-1.1-1.5.1-6.7 0-8.5-.1-3.5-.9-6.9-4.9-7.4-3.6-.6-6.7 1.2-6.8 4.9-.1 3.9 2 8.2.6 12-.9 2.4-2.9 2.9-4.6.9-2.4-2.8-.4-9 0-12.3.4-4.2.2-7-1.8-10.8C1.1 2.8.6 2.1 0 1.4v26.4h283.5V2.2c-.3.4-.6.8-.8 1.2z",
  
  // Book - open book pages
  book: "M806,94.7C619.5,90,500,20.3,500,1.7c-1,18.6-117.5,88.3-306,93C92,97.2,0,97.9,0,97.9v-0l0,0v2.3h1000v-2.3 C1000,97.7,920.3,97.6,806,94.7z M350,65.1L350,65.1L350,65.1L350,65.1z",
  
  // Book Negative - inverted book pages
  "book-negative": "M806,94.7C619.5,90,500,20.3,500,1.7c-1,18.6-117.5,88.3-306,93C92,97.2,0,97.9,0,97.9v-0l0,0v2.3h1000v-2.3 C1000,97.7,920.3,97.6,806,94.7z M350,65.1L350,65.1L350,65.1L350,65.1z"
};