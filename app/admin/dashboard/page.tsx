import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = createClient();

  const [{ count: members }, { count: posts }, { count: archives }] =
    await Promise.all([
      supabase.from("members").select("*", { count: "exact", head: true }),
      supabase.from("content_posts").select("*", { count: "exact", head: true }),
      supabase.from("archive_items").select("*", { count: "exact", head: true }),
    ]);

  const cards = [
    { label: "Members", count: members ?? 0, href: "/admin/members" },
    { label: "Content posts", count: posts ?? 0, href: "/admin/content" },
    { label: "Archive records", count: archives ?? 0, href: "/admin/archives" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl text-green mb-8">Dashboard</h1>
      <div className="grid gap-6 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="border border-green/10 bg-white rounded-md p-6 hover:border-red/40 hover:shadow-sm transition-all"
          >
            <p className="text-3xl font-display text-green">{c.count}</p>
            <p className="text-sm text-ink/60 mt-1">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
