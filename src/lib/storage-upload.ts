import { supabase } from "@/integrations/supabase/client";

const BUCKET = "category-images";
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10; // 10 years

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

/**
 * Uploads an image to storage under the given folder and returns a long-lived
 * signed URL that can be stored in the database.
 */
export async function uploadImageToStorage(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "31536000", upsert: false });
  if (uploadError) throw uploadError;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
  if (error || !data?.signedUrl) throw error ?? new Error("Could not create image URL");
  return data.signedUrl;
}
