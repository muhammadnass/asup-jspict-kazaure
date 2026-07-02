import Link from "next/link";
import Logo from "./Logo";

const links = [
  { href: "/history", label: "Chapter History" },
  { href: "/struggles", label: "Chapter Struggles" },
  { href: "/publications", label: "Publications" },
  { href: "/archives", label: "Archives" },
  { href: "/members", label: "Members" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-green/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-20 flex items-center justify-between gap-6">
        <Logo />
        <nav className="hidden md:flex items-center gap-7 font-body text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-ink/80 hover:text-red transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/admin/login"
          className="hidden md:inline-block text-xs font-body uppercase tracking-wide text-green/50 hover:text-green border border-green/20 rounded-full px-3 py-1.5 transition-colors"
        >
          Admin
        </Link>
      </div>
      {/* Mobile nav */}
      <nav className="md:hidden flex overflow-x-auto gap-5 px-4 pb-3 font-body text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-ink/80 whitespace-nowrap"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
