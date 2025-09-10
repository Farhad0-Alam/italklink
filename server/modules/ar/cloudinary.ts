import fetch from "node-fetch";
import crypto from "crypto";

const CLOUDINARY_URL = process.env.CLOUDINARY_URL;

function parseCloudinaryUrl() {
  if (!CLOUDINARY_URL) {
    throw new Error("CLOUDINARY_URL not configured. Please set up Cloudinary integration for file hosting.");
  }
  
  const match = CLOUDINARY_URL.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/]+)$/);
  if (!match) {
    throw new Error("Invalid CLOUDINARY_URL format");
  }
  
  return { 
    key: match[1], 
    secret: match[2], 
    cloud: match[3] 
  };
}

export async function uploadImageToCloudinary(filename: string, buffer: Buffer): Promise<string> {
  const { key, secret, cloud } = parseCloudinaryUrl();
  const url = `https://api.cloudinary.com/v1_1/${cloud}/image/upload`;
  const timestamp = Math.floor(Date.now() / 1000);
  
  const formData = new FormData();
  formData.append("file", new Blob([buffer]), filename);
  formData.append("timestamp", String(timestamp));
  formData.append("api_key", key);
  
  // Create signature for authenticated upload
  const paramsToSign = `timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + secret)
    .digest("hex");
  
  formData.append("signature", signature);
  
  const response = await fetch(url, { 
    method: "POST", 
    body: formData as any 
  });
  
  const data = await response.json() as any;
  
  if (!response.ok) {
    throw new Error(data?.error?.message || "Failed to upload image to Cloudinary");
  }
  
  return data.secure_url as string;
}

export async function uploadRawToCloudinary(filename: string, buffer: Buffer): Promise<string> {
  const { key, secret, cloud } = parseCloudinaryUrl();
  const url = `https://api.cloudinary.com/v1_1/${cloud}/raw/upload`;
  const timestamp = Math.floor(Date.now() / 1000);
  
  const formData = new FormData();
  formData.append("file", new Blob([buffer]), filename);
  formData.append("timestamp", String(timestamp));
  formData.append("api_key", key);
  
  // Create signature for authenticated upload
  const paramsToSign = `timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + secret)
    .digest("hex");
  
  formData.append("signature", signature);
  
  const response = await fetch(url, { 
    method: "POST", 
    body: formData as any 
  });
  
  const data = await response.json() as any;
  
  if (!response.ok) {
    throw new Error(data?.error?.message || "Failed to upload raw file to Cloudinary");
  }
  
  return data.secure_url as string;
}