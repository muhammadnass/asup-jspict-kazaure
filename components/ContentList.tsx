import { createClient } from "@/lib/supabase/server";
import type { ContentCategory, ContentPost } from "@/lib/types";

const COPY: Record<ContentCategory, { eyebrow: string; title: string; empty: string }> = {
  history: {
    eyebrow: "The record",
    title: "Chapter History",
    empty: "Chapter history entries will appear here once added by the admin.",
  },
  struggles: {
    eyebrow: "In defence of members",
    title: "Chapter Struggles",
    empty: "Accounts of the chapter's struggles will appear here once added by the admin.",
  },
  publications: {
    eyebrow: "In print",
    title: "Publication Records",
    empty: "Communiqués and publications will appear here once added by the admin.",
  },
};

export default async function ContentList({ category }: { category: ContentCategory }) {
  const supabase = createClient();
  const { data: posts } = await supabase
    .from("content_posts")
    .select("*")
    .eq("category", category)
    .eq("published", true)
    .order("year", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const list = (posts ?? []) as ContentPost[];
  const copy = COPY[category];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-widest text-red font-semibold mb-2">
          {copy.eyebrow}
        </p>
        <h1 className="font-display text-3xl text-green">{copy.title}</h1>
        <div className="ledger-rule w-16 mt-4" />
      </header>

      {list.length === 0 ? (
        <p className="text-ink/60">{copy.empty}</p>
      ) : (
        <ol className="relative border-l border-green/15 space-y-10 pl-8">
          {list.map((post) => (
            <li key={post.id} className="relative">
              <span className="absolute -left-[38px] top-1 chapter-seal h-6 w-6 text-gold bg-cream text-[10px] font-semibold">
                {post.year ?? "•"}
              </span>
              <h2 className="font-display text-xl text-green">{post.title}</h2>
              <p className="text-ink/70 mt-2 leading-relaxed whitespace-pre-line">
                {post.body}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
