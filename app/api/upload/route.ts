import { env } from "cloudflare:workers";

export async function POST(request: Request) {
  try {
    const cloudName = (env as any).CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = (env as any).CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY;
    const apiSecret = (env as any).CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = (env as any).CLOUDINARY_UPLOAD_PRESET || process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName) {
      return Response.json(
        { error: "Cloudinary is not configured. Missing CLOUDINARY_CLOUD_NAME." },
        { status: 500 }
      );
    }

    const data = await request.formData();
    const file = data.get("file") as File;
    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const cloudinaryForm = new FormData();
    cloudinaryForm.append("file", file);
    
    if (uploadPreset) {
      cloudinaryForm.append("upload_preset", uploadPreset);
    } else if (apiKey && apiSecret) {
      const timestamp = Math.round(new Date().getTime() / 1000).toString();
      cloudinaryForm.append("timestamp", timestamp);
      cloudinaryForm.append("api_key", apiKey);
      
      const signatureStr = `timestamp=${timestamp}${apiSecret}`;
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(signatureStr);
      const hashBuffer = await crypto.subtle.digest("SHA-1", encodedData);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      
      cloudinaryForm.append("signature", signature);
    } else {
      return Response.json(
        { error: "Cloudinary configuration requires either CLOUDINARY_UPLOAD_PRESET or CLOUDINARY_API_KEY & CLOUDINARY_API_SECRET." },
        { status: 500 }
      );
    }

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: cloudinaryForm,
    });

    const result: any = await response.json();
    if (!response.ok) {
      return Response.json(
        { error: result.error?.message || "Cloudinary upload failed" },
        { status: response.status }
      );
    }

    return Response.json({ url: result.secure_url, publicId: result.public_id });
  } catch (error: any) {
    return Response.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
