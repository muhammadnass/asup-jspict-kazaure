import { createClient } from "@/lib/supabase/server";
import { createArchiveItem, deleteArchiveItem } from "@/lib/actions/archives";
import type { ArchiveItem } from "@/lib/types";

export default async function AdminArchivesPage() {
  const supabase = createClient();
  const { data: items } = await supabase
    .from("archive_items")
    .select("*")
    .order("created_at", { ascending: false });

  const list = (items ?? []) as ArchiveItem[];

  return (
    <div className="space-y-12">
      <h1 className="font-display text-2xl text-green">Archives</h1>
      <p className="text-sm text-ink/60 -mt-8">
        Scan a hard-copy record (PDF or a clear photo) and upload it here.
        Add an optional thumbnail image for a nicer preview on the public
        Archives page.
      </p>

      {/* CREATE */}
      <section className="bg-white border border-green/10 rounded-md p-6">
        <h2 className="font-semibold text-green mb-4">Digitize a record</h2>
        <form action={createArchiveItem} className="grid gap-4 sm:grid-cols-2">
          <input
            name="title"
            placeholder="Title (e.g. 1998 Chapter Inauguration Minutes)"
            required
            className="border border-green/20 rounded-sm px-3 py-2 sm:col-span-2"
          />
          <input
            type="date"
            name="record_date"
            className="border border-green/20 rounded-sm px-3 py-2"
          />
          <div />
          <label className="text-sm text-ink/70 sm:col-span-2">
            Scanned document (PDF or image) *
            <input
              type="file"
              name="document"
              accept="application/pdf,image/*"
              required
              className="mt-1 w-full border border-green/20 rounded-sm px-3 py-2 bg-cream"
            />
          </label>
          <label className="text-sm text-ink/70 sm:col-span-2">
            Thumbnail image (optional)
            <input
              type="file"
              name="thumbnail"
              accept="image/*"
              className="mt-1 w-full border border-green/20 rounded-sm px-3 py-2 bg-cream"
            />
          </label>
          <textarea
            name="description"
            placeholder="Description / context"
            rows={3}
            className="border border-green/20 rounded-sm px-3 py-2 sm:col-span-2"
          />
          <button
            type="submit"
            className="sm:col-span-2 justify-self-start bg-green text-cream font-semibold px-5 py-2 rounded-sm hover:bg-green-light"
          >
            Upload record
          </button>
        </form>
      </section>

      {/* LIST + DELETE */}
      <section className="space-y-3">
        <h2 className="font-semibold text-green">Existing records ({list.length})</h2>
        {list.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-green/10 rounded-md p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-green">{item.title}</p>
              {item.record_date && (
                <p className="text-xs text-ink/50">{item.record_date}</p>
              )}
              <a
                href={item.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-red hover:underline"
              >
                View document
              </a>
            </div>
            <form action={deleteArchiveItem.bind(null, item.id)}>
              <button type="submit" className="text-sm text-red hover:underline">
                Delete
              </button>
            </form>
          </div>
        ))}
      </section>
    </div>
  );
}
