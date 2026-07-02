export type ContentCategory = "history" | "struggles" | "publications";

export interface Member {
  id: string;
  full_name: string;
  role: string; // e.g. "Chapter Chairman", "Financial Secretary"
  bio: string;
  photo_url: string | null;
  display_order: number;
  created_at: string;
}

export interface ContentPost {
  id: string;
  category: ContentCategory;
  title: string;
  body: string;
  year: number | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ArchiveItem {
  id: string;
  title: string;
  description: string | null;
  document_url: string; // scanned copy in Supabase Storage
  thumbnail_url: string | null;
  record_date: string | null; // original date of the hard-copy record
  created_at: string;
}
