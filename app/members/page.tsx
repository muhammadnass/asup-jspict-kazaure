import { createClient } from "@/lib/supabase/server";
import MemberCard from "@/components/MemberCard";
import type { Member } from "@/lib/types";

export const revalidate = 60;

export default async function MembersPage() {
  const supabase = createClient();
  const { data: members } = await supabase
    .from("members")
    .select("*")
    .order("display_order", { ascending: true });

  const list = (members ?? []) as Member[];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-widest text-red font-semibold mb-2">
          Who we are
        </p>
        <h1 className="font-display text-3xl text-green">Chapter Members</h1>
        <div className="ledger-rule w-16 mt-4" />
      </header>

      {list.length === 0 ? (
        <p className="text-ink/60">
          Member profiles will appear here once the chapter secretary adds
          them from the admin dashboard.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((m) => (
            <MemberCard key={m.id} member={m} />
          ))}
        </div>
      )}
    </div>
  );
}
