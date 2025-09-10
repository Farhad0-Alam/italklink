import { Router } from "express";
import { Request, Response } from "express";
import { upload } from "./upload";
import { handleCompile } from "./compile";

const router = Router();

/**
 * POST /api/ar/compile
 * Compiles an uploaded image into an AR target (.mind file)
 */
router.post("/compile", upload.single("image"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        error: "No image file provided. Please upload an image file."
      });
    }

    const { buffer, originalname } = req.file;

    // Process the image through the AR compilation pipeline
    const result = await handleCompile(buffer, originalname || "card-front.jpg");

    if (!result.ok) {
      return res.status(result.status || 500).json(result);
    }

    res.json({
      ok: true,
      mindFileUrl: result.mindFileUrl,
      textureUrl: result.textureUrl
    });

  } catch (error: any) {
    console.error("AR compile route error:", error);
    res.status(500).json({
      ok: false,
      error: error.message || "Internal server error during AR compilation"
    });
  }
});

/**
 * GET /api/ar/status
 * Check AR compilation service status
 */
router.get("/status", (req: Request, res: Response) => {
  const hasCloudinary = !!process.env.CLOUDINARY_URL;
  const hasCompiler = !!process.env.AR_COMPILER_PROXY_URL;
  
  res.json({
    ok: true,
    services: {
      cloudinary: hasCloudinary,
      compiler: hasCompiler
    },
    message: hasCloudinary && hasCompiler 
      ? "AR services fully configured" 
      : "Some AR services not configured"
  });
});

export default router;