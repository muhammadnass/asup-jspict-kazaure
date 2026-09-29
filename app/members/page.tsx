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
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: "#FFB81C" }}>
            Who we are
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "#003366" }}>
            Chapter Members
          </h1>
          <div className="mt-3 h-1 w-16 rounded" style={{ backgroundColor: "#FFB81C" }} />
        </div>

        {list.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <p className="text-gray-400 text-4xl mb-3">👥</p>
            <p className="text-gray-500">No member profiles yet.</p>
          </div>
        ) : (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((m) => (
              <MemberCard key={m.id} member={m} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 rounded-xl p-6 text-center text-white" style={{ backgroundColor: "#003366" }}>
          <h3 className="font-bold text-base mb-1">Are you a staff member?</h3>
          <p className="text-gray-300 text-xs mb-4">
            Contact the chapter PRO to have your profile added to this page.
          </p>
          <a
            href="mailto:msnasir.international@jspict.edu.ng"
            className="inline-block px-5 py-2 rounded font-bold text-xs hover:opacity-90 transition"
            style={{ backgroundColor: "#FFB81C", color: "#003366" }}
          >
            Contact PRO
          </a>
        </div>
      </div>
    </div>
  );
}