import { supabase } from "./supabase";

const imageExtensions: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif",
};

export async function uploadChatImage(file: File, userId: string): Promise<string> {
  const extension = imageExtensions[file.type];
  if (!extension) throw new Error("Choose a JPG, PNG, WebP, or GIF image.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Please choose an image smaller than 10 MB.");
  if (!userId) throw new Error("Please log in before attaching an image.");

  // Reuse the public bucket and products upload folder already used by listings.
  const path = `products/chat_${userId}_${crypto.randomUUID()}.${extension}`;
  const bucket = supabase.storage.from("campus-images");
  const { error } = await bucket.upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(`Image upload failed: ${error.message}`);
  return bucket.getPublicUrl(path).data.publicUrl;
}
