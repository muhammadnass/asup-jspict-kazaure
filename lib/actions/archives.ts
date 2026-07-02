"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function uploadIfPresent(
  supabase: ReturnType<typeof createClient>,
  formData: FormData,
  field: string,
  bucket: string
): Promise<string | null> {
  const file = formData.get(field) as File | null;
  if (!file || file.size === 0) return null;

  const ext = file.name.split(".").pop();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function createArchiveItem(formData: FormData) {
  const supabase = createClient();
  const document_url = await uploadIfPresent(
    supabase,
    formData,
    "document",
    "archive-documents"
  );
  const thumbnail_url = await uploadIfPresent(
    supabase,
    formData,
    "thumbnail",
    "archive-documents"
  );

  if (!document_url) throw new Error("A scanned document or photo is required.");

  const { error } = await supabase.from("archive_items").insert({
    title: String(formData.get("title")),
    description: String(formData.get("description") || ""),
    record_date: formData.get("record_date") || null,
    document_url,
    thumbnail_url,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/archives");
  revalidatePath("/archives");
}

export async function deleteArchiveItem(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("archive_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/archives");
  revalidatePath("/archives");
}
