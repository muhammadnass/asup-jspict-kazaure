export type ContentCategory = "history" | "struggles" | "publications";

export interface Member {
  id: string;
  full_name: string;
  role: string;
  bio: string;
  photo_url: string | null;
  cv_url: string | null;
  email: string | null;
  department: string | null;
  is_approved: boolean;
  user_id: string | null;
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
  document_url: string;
  thumbnail_url: string | null;
  record_date: string | null;
  created_at: string;
}
