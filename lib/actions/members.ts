"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function uploadPhotoIfPresent(
  supabase: ReturnType<typeof createClient>,
  formData: FormData
): Promise<string | null> {
  const file = formData.get("photo") as File | null;
  if (!file || file.size === 0) return null;

  const ext = file.name.split(".").pop();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("member-photos")
    .upload(path, file, { upsert: true });

  if (error) throw new Error(`Photo upload failed: ${error.message}`);

  const { data } = supabase.storage.from("member-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function createMember(formData: FormData) {
  const supabase = createClient();
  const photo_url = await uploadPhotoIfPresent(supabase, formData);

  const { error } = await supabase.from("members").insert({
    full_name: String(formData.get("full_name")),
    role: String(formData.get("role") || "Member"),
    bio: String(formData.get("bio") || ""),
    display_order: Number(formData.get("display_order") || 0),
    photo_url,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/members");
  revalidatePath("/members");
  revalidatePath("/");
}

export async function updateMember(id: string, formData: FormData) {
  const supabase = createClient();
  const photo_url = await uploadPhotoIfPresent(supabase, formData);

  const update: Record<string, unknown> = {
    full_name: String(formData.get("full_name")),
    role: String(formData.get("role") || "Member"),
    bio: String(formData.get("bio") || ""),
    display_order: Number(formData.get("display_order") || 0),
  };
  if (photo_url) update.photo_url = photo_url;

  const { error } = await supabase.from("members").update(update).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/members");
  revalidatePath("/members");
  revalidatePath("/");
}

export async function deleteMember(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("members").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/members");
  revalidatePath("/members");
  revalidatePath("/");
}
