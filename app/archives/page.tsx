import { createClient } from "@/lib/supabase/server";
import type { ArchiveItem } from "@/lib/types";

export const revalidate = 60;

export default async function ArchivesPage() {
  const supabase = createClient();
  const { data: items } = await supabase
    .from("archive_items")
    .select("*")
    .order("record_date", { ascending: false, nullsFirst: false });

  const list = (items ?? []) as ArchiveItem[];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-widest text-red font-semibold mb-2">
          Preserved for the future
        </p>
        <h1 className="font-display text-3xl text-green">Archives</h1>
        <p className="text-ink/60 mt-3 max-w-2xl">
          Digitized copies of the chapter&apos;s hard-copy records — minutes,
          circulars, communiqués and photographs — preserved so they
          outlast the paper they were written on.
        </p>
        <div className="ledger-rule w-16 mt-4" />
      </header>

      {list.length === 0 ? (
        <p className="text-ink/60">
          Digitized records will appear here once the chapter secretary
          uploads them from the admin dashboard.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((item) => (
            <a
              key={item.id}
              href={item.document_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group border border-green/10 bg-white/70 rounded-md overflow-hidden hover:shadow-md hover:border-red/40 transition-all"
            >
              <div className="aspect-[3/4] bg-green/5 flex items-center justify-center overflow-hidden">
                {item.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-green/30 font-display text-3xl">
                    &#128220;
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-display text-base text-green group-hover:text-red transition-colors">
                  {item.title}
                </h3>
                {item.record_date && (
                  <p className="text-xs text-ink/50 mt-1">
                    {new Date(item.record_date).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
                {item.description && (
                  <p className="text-sm text-ink/70 mt-2 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
