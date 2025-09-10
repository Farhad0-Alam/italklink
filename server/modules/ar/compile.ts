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
    // 1) Try to create a local data URL for the texture (fallback when Cloudinary not available)
    let textureUrl: string | undefined;
    try {
      textureUrl = await uploadImageToCloudinary(
        originalName || "card-front.jpg", 
        imageBuffer
      );
    } catch (cloudinaryError) {
      console.warn("Cloudinary upload failed, using local data URL:", cloudinaryError);
      // Create a base64 data URL as fallback
      const base64 = imageBuffer.toString('base64');
      const mimeType = originalName?.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
      textureUrl = `data:${mimeType};base64,${base64}`;
    }

    // 2) Check if AR compiler proxy is configured
    if (!AR_COMPILER_PROXY_URL) {
      return {
        ok: true, // Changed to true to indicate partial success
        status: 200,
        error: "Auto-compile not available. Please manually enter a .mind file URL below. You can use MindAR's online compiler to generate one from your image.",
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
      // 5) Try to upload compiled .mind file to Cloudinary as raw file
      let mindFileUrl: string | undefined;
      try {
        const mindBuffer = Buffer.from(data.mindBufferBase64, "base64");
        mindFileUrl = await uploadRawToCloudinary("targets.mind", mindBuffer);
      } catch (cloudinaryError) {
        console.warn("Cloudinary .mind upload failed:", cloudinaryError);
        return {
          ok: false,
          status: 502,
          error: "AR target compiled but upload failed. Configure CLOUDINARY_URL to enable file hosting.",
          textureUrl
        };
      }
      
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
      console.warn("Failed to upload texture during error handling:", uploadError);
    }

    return {
      ok: false,
      status: 500,
      error: error.message || "AR compilation failed",
      textureUrl
    };
  }
}