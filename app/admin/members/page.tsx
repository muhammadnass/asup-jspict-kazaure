import { createClient } from "@/lib/supabase/server";
import { createMember, updateMember, deleteMember } from "@/lib/actions/members";
import type { Member } from "@/lib/types";

export default async function AdminMembersPage() {
  const supabase = createClient();
  const { data: members } = await supabase
    .from("members")
    .select("*")
    .order("display_order", { ascending: true });

  const list = (members ?? []) as Member[];

  return (
    <div className="space-y-12">
      <h1 className="font-display text-2xl text-green">Members</h1>

      {/* CREATE */}
      <section className="bg-white border border-green/10 rounded-md p-6">
        <h2 className="font-semibold text-green mb-4">Add a member</h2>
        <form action={createMember} className="grid gap-4 sm:grid-cols-2">
          <input
            name="full_name"
            placeholder="Full name"
            required
            className="border border-green/20 rounded-sm px-3 py-2"
          />
          <input
            name="role"
            placeholder="Role (e.g. Chapter Chairman)"
            className="border border-green/20 rounded-sm px-3 py-2"
          />
          <input
            type="number"
            name="display_order"
            placeholder="Display order (0 = first)"
            className="border border-green/20 rounded-sm px-3 py-2"
          />
          <input
            type="file"
            name="photo"
            accept="image/*"
            className="border border-green/20 rounded-sm px-3 py-2 bg-cream"
          />
          <textarea
            name="bio"
            placeholder="Short biography"
            rows={3}
            className="border border-green/20 rounded-sm px-3 py-2 sm:col-span-2"
          />
          <button
            type="submit"
            className="sm:col-span-2 justify-self-start bg-green text-cream font-semibold px-5 py-2 rounded-sm hover:bg-green-light"
          >
            Save member
          </button>
        </form>
      </section>

      {/* LIST + EDIT/DELETE */}
      <section className="space-y-4">
        <h2 className="font-semibold text-green">Existing members ({list.length})</h2>
        {list.map((m) => (
          <details key={m.id} className="bg-white border border-green/10 rounded-md p-5">
            <summary className="cursor-pointer font-medium text-green flex items-center justify-between">
              <span>
                {m.full_name} <span className="text-ink/50 font-normal">— {m.role}</span>
              </span>
            </summary>

            <form
              action={updateMember.bind(null, m.id)}
              className="grid gap-4 sm:grid-cols-2 mt-4"
            >
              <input
                name="full_name"
                defaultValue={m.full_name}
                className="border border-green/20 rounded-sm px-3 py-2"
              />
              <input
                name="role"
                defaultValue={m.role}
                className="border border-green/20 rounded-sm px-3 py-2"
              />
              <input
                type="number"
                name="display_order"
                defaultValue={m.display_order}
                className="border border-green/20 rounded-sm px-3 py-2"
              />
              <input
                type="file"
                name="photo"
                accept="image/*"
                className="border border-green/20 rounded-sm px-3 py-2 bg-cream"
              />
              <textarea
                name="bio"
                defaultValue={m.bio}
                rows={3}
                className="border border-green/20 rounded-sm px-3 py-2 sm:col-span-2"
              />
              <div className="sm:col-span-2 flex gap-3">
                <button
                  type="submit"
                  className="bg-gold text-green-deep font-semibold px-5 py-2 rounded-sm hover:bg-gold-light"
                >
                  Update
                </button>
              </div>
            </form>

            <form action={deleteMember.bind(null, m.id)} className="mt-3">
              <button
                type="submit"
                className="text-sm text-red hover:underline"
              >
                Delete this member
              </button>
            </form>
          </details>
        ))}
      </section>
    </div>
  );
}
