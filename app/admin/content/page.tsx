import { createClient } from "@/lib/supabase/server";
import { createPost, updatePost, deletePost } from "@/lib/actions/content";
import type { ContentPost } from "@/lib/types";

export default async function AdminContentPage() {
  const supabase = createClient();
  const { data: posts } = await supabase
    .from("content_posts")
    .select("*")
    .order("created_at", { ascending: false });

  const list = (posts ?? []) as ContentPost[];

  return (
    <div className="space-y-12">
      <h1 className="font-display text-2xl text-green">
        History / Struggles / Publications
      </h1>

      {/* CREATE */}
      <section className="bg-white border border-green/10 rounded-md p-6">
        <h2 className="font-semibold text-green mb-4">Add a record</h2>
        <form action={createPost} className="grid gap-4 sm:grid-cols-2">
          <select name="category" required className="border border-green/20 rounded-sm px-3 py-2">
            <option value="history">Chapter History</option>
            <option value="struggles">Chapter Struggles</option>
            <option value="publications">Publications</option>
          </select>
          <input
            type="number"
            name="year"
            placeholder="Year (optional)"
            className="border border-green/20 rounded-sm px-3 py-2"
          />
          <input
            name="title"
            placeholder="Title"
            required
            className="border border-green/20 rounded-sm px-3 py-2 sm:col-span-2"
          />
          <textarea
            name="body"
            placeholder="Full text"
            rows={5}
            className="border border-green/20 rounded-sm px-3 py-2 sm:col-span-2"
          />
          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input type="checkbox" name="published" defaultChecked /> Publish immediately
          </label>
          <button
            type="submit"
            className="sm:col-span-2 justify-self-start bg-green text-cream font-semibold px-5 py-2 rounded-sm hover:bg-green-light"
          >
            Save record
          </button>
        </form>
      </section>

      {/* LIST + EDIT/DELETE */}
      <section className="space-y-4">
        <h2 className="font-semibold text-green">Existing records ({list.length})</h2>
        {list.map((p) => (
          <details key={p.id} className="bg-white border border-green/10 rounded-md p-5">
            <summary className="cursor-pointer font-medium text-green flex items-center justify-between">
              <span>
                [{p.category}] {p.title}{" "}
                {!p.published && (
                  <span className="text-xs text-red ml-2">(draft)</span>
                )}
              </span>
            </summary>

            <form
              action={updatePost.bind(null, p.id)}
              className="grid gap-4 sm:grid-cols-2 mt-4"
            >
              <select
                name="category"
                defaultValue={p.category}
                className="border border-green/20 rounded-sm px-3 py-2"
              >
                <option value="history">Chapter History</option>
                <option value="struggles">Chapter Struggles</option>
                <option value="publications">Publications</option>
              </select>
              <input
                type="number"
                name="year"
                defaultValue={p.year ?? ""}
                className="border border-green/20 rounded-sm px-3 py-2"
              />
              <input
                name="title"
                defaultValue={p.title}
                className="border border-green/20 rounded-sm px-3 py-2 sm:col-span-2"
              />
              <textarea
                name="body"
                defaultValue={p.body}
                rows={5}
                className="border border-green/20 rounded-sm px-3 py-2 sm:col-span-2"
              />
              <label className="flex items-center gap-2 text-sm text-ink/70">
                <input type="checkbox" name="published" defaultChecked={p.published} /> Published
              </label>
              <button
                type="submit"
                className="bg-gold text-green-deep font-semibold px-5 py-2 rounded-sm hover:bg-gold-light"
              >
                Update
              </button>
            </form>

            <form action={deletePost.bind(null, p.id, p.category)} className="mt-3">
              <button type="submit" className="text-sm text-red hover:underline">
                Delete this record
              </button>
            </form>
          </details>
        ))}
      </section>
    </div>
  );
}
