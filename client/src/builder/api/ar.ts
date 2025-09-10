export async function compileMind(file: File): Promise<{
  ok: true;
  mindFileUrl: string;
  textureUrl?: string;
}> {
  const formData = new FormData();
  formData.append("image", file);
  
  const response = await fetch("/api/ar/compile", { 
    method: "POST", 
    body: formData 
  });
  
  const data = await response.json();
  
  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Failed to compile AR target");
  }
  
  return data as { ok: true; mindFileUrl: string; textureUrl?: string };
}