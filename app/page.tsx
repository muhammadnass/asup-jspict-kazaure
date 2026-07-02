import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { ContentPost, Member } from "@/lib/types";

export const revalidate = 60; // re-check content every minute

async function getHomeData() {
  const supabase = createClient();

  const [{ data: latestPost }, { data: members }] = await Promise.all([
    supabase
      .from("content_posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("members")
      .select("*")
      .order("display_order", { ascending: true })
      .limit(3),
  ]);

  return {
    latestPost: latestPost as ContentPost | null,
    members: (members ?? []) as Member[],
  };
}

export default async function HomePage() {
  const { latestPost, members } = await getHomeData();

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-green text-cream">
        <div className="absolute inset-0 bg-ledger-lines opacity-[0.08] pointer-events-none" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28 relative">
          <Image
            src="/logo.png"
            alt="ASUP logo"
            width={64}
            height={64}
            className="rounded-full mb-6"
          />
          <h1 className="font-display font-semibold text-4xl sm:text-5xl leading-tight max-w-3xl fade-up">
            Academic Staff Union of Polytechnics
            <span className="block text-gold">ICT Kazaure Chapter</span>
          </h1>
          <p className="mt-5 max-w-xl text-cream/80 text-lg fade-up">
            Preserving the record of every struggle, achievement and
            publication of the Academic Staff Union at Jigawa State
            Polytechnic, ICT Kazaure — for the members who lived it, and
            those who come after.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 fade-up">
            <Link
              href="/history"
              className="bg-gold text-green-deep font-semibold px-6 py-3 rounded-sm hover:bg-gold-light transition-colors"
            >
              Read Our History
            </Link>
            <Link
              href="/archives"
              className="border border-cream/40 px-6 py-3 rounded-sm hover:bg-cream/10 transition-colors"
            >
              Browse the Archives
            </Link>
          </div>
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/history", title: "Chapter History", desc: "How the chapter began and grew." },
          { href: "/struggles", title: "Chapter Struggles", desc: "The fights fought for members' welfare." },
          { href: "/publications", title: "Publications", desc: "Communiqués, circulars and press releases." },
          { href: "/archives", title: "Archives", desc: "Digitized hard-copy records and achievements." },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group border border-green/10 bg-white/60 rounded-md p-6 hover:border-red/40 hover:shadow-sm transition-all"
          >
            <div className="ledger-rule w-16 mb-4" />
            <h3 className="font-display text-lg text-green group-hover:text-red transition-colors">
              {card.title}
            </h3>
            <p className="text-sm text-ink/60 mt-2">{card.desc}</p>
          </Link>
        ))}
      </section>

      {/* LATEST RECORD */}
      {latestPost && (
        <section className="bg-white/60 border-y border-green/10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
            <p className="text-xs uppercase tracking-widest text-red font-semibold mb-3">
              Latest from the record
            </p>
            <h2 className="font-display text-2xl text-green mb-3">
              {latestPost.title}
            </h2>
            <p className="text-ink/70 max-w-2xl line-clamp-3">
              {latestPost.body}
            </p>
            <Link
              href={`/${latestPost.category}`}
              className="inline-block mt-4 text-sm text-red font-semibold hover:underline"
            >
              Read more &rarr;
            </Link>
          </div>
        </section>
      )}

      {/* MEMBERS PREVIEW */}
      {members.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl text-green">Chapter Members</h2>
            <Link href="/members" className="text-sm text-red font-semibold hover:underline">
              View all &rarr;
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {members.map((m) => (
              <div key={m.id} className="text-center">
                <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-2 border-gold bg-green/5">
                  {m.photo_url ? (
                    <Image src={m.photo_url} alt={m.full_name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-green/40 font-display text-2xl">
                      {m.full_name.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="mt-3 font-semibold text-green">{m.full_name}</p>
                <p className="text-xs text-ink/60 uppercase tracking-wide">{m.role}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
