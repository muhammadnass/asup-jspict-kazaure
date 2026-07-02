import Link from "next/link";
import { signOut } from "@/lib/actions/auth";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/content", label: "History / Struggles / Publications" },
  { href: "/admin/archives", label: "Archives" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-green-deep text-cream">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <span className="font-display text-gold">ASUP Admin</span>
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-cream/70 hover:text-cream">
                {l.label}
              </Link>
            ))}
          </div>
          <form action={signOut}>
            <button className="text-cream/70 hover:text-cream" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">{children}</div>
    </div>
  );
}
