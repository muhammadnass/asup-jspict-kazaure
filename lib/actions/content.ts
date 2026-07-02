"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ContentCategory } from "@/lib/types";

export async function createPost(formData: FormData) {
  const supabase = createClient();
  const category = String(formData.get("category")) as ContentCategory;

  const { error } = await supabase.from("content_posts").insert({
    category,
    title: String(formData.get("title")),
    body: String(formData.get("body") || ""),
    year: formData.get("year") ? Number(formData.get("year")) : null,
    published: formData.get("published") === "on",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/content");
  revalidatePath(`/${category}`);
  revalidatePath("/");
}

export async function updatePost(id: string, formData: FormData) {
  const supabase = createClient();
  const category = String(formData.get("category")) as ContentCategory;

  const { error } = await supabase
    .from("content_posts")
    .update({
      category,
      title: String(formData.get("title")),
      body: String(formData.get("body") || ""),
      year: formData.get("year") ? Number(formData.get("year")) : null,
      published: formData.get("published") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/content");
  revalidatePath(`/${category}`);
  revalidatePath("/");
}

export async function deletePost(id: string, category: ContentCategory) {
  const supabase = createClient();
  const { error } = await supabase.from("content_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/content");
  revalidatePath(`/${category}`);
  revalidatePath("/");
}
