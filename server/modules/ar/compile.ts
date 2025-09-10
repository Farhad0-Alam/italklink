import fetch from "node-fetch";
import { uploadImageToCloudinary, uploadRawToCloudinary } from "./cloudinary";

const AR_COMPILER_PROXY_URL = process.env.AR_COMPILER_PROXY_URL;

interface CompileResult {
  ok: boolean;
  status?: number;
  error?: string;
  mindFileUrl?: string;
  textureUrl?: string;
}

export async function handleCompile(
  imageBuffer: Buffer, 
  originalName: string
): Promise<CompileResult> {
  try {
    // 1) Upload the original image to Cloudinary (for planeTextureUrl)
    const textureUrl = await uploadImageToCloudinary(
      originalName || "card-front.jpg", 
      imageBuffer
    );

    // 2) Check if AR compiler proxy is configured
    if (!AR_COMPILER_PROXY_URL) {
      return {
        ok: false,
        status: 501,
        error: "Auto-compile not configured. Set AR_COMPILER_PROXY_URL environment variable or paste a .mind URL manually.",
        textureUrl
      };
    }

    // 3) Send image to external AR compiler proxy
    const formData = new FormData();
    formData.append("image", new Blob([imageBuffer]), originalName || "card-front.jpg");

    const response = await fetch(AR_COMPILER_PROXY_URL, {
      method: "POST",
      body: formData as any
    });

    const data = await response.json().catch(() => ({})) as any;

    if (!response.ok || !data?.ok) {
      return {
        ok: false,
        status: 502,
        error: data?.error || "AR compiler service failed",
        textureUrl
      };
    }

    // 4) Handle different response formats from compiler
    if (data.mindUrl) {
      // Compiler already hosted the .mind file
      return {
        ok: true,
        mindFileUrl: data.mindUrl as string,
        textureUrl
      };
    }

    if (data.mindBufferBase64) {
      // 5) Upload compiled .mind file to Cloudinary as raw file
      const mindBuffer = Buffer.from(data.mindBufferBase64, "base64");
      const mindFileUrl = await uploadRawToCloudinary("targets.mind", mindBuffer);
      
      return {
        ok: true,
        mindFileUrl,
        textureUrl
      };
    }

    return {
      ok: false,
      status: 500,
      error: "Invalid response from AR compiler service",
      textureUrl
    };

  } catch (error: any) {
    console.error("AR compile error:", error);
    
    // Try to still return the texture URL even if compilation failed
    let textureUrl: string | undefined;
    try {
      textureUrl = await uploadImageToCloudinary(
        originalName || "card-front.jpg", 
        imageBuffer
      );
    } catch (uploadError) {
      console.error("Failed to upload texture:", uploadError);
    }

    return {
      ok: false,
      status: 500,
      error: error.message || "AR compilation failed",
      textureUrl
    };
  }
}