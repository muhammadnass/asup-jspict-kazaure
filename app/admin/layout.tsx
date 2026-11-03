import Link from "next/link";
import { signOut } from "@/lib/actions/auth";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/content", label: "Struggles / History" },
  { href: "/admin/departments", label: "Departments" },
  { href: "/admin/events", label: "Events" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <div style={{ backgroundColor: "#00214D", borderBottom: "3px solid #2E8B57" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <span style={{ color: "#FFB81C", fontWeight: "800", fontSize: "14px", letterSpacing: "0.05em" }}>
              ASUP ADMIN
            </span>
            {links.map(l => (
              <Link key={l.href} href={l.href}
                style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "13px", fontWeight: "500", whiteSpace: "nowrap" }}
                {l.label}
              </Link>
            ))}
          </div>
          <form action={signOut}>
            <button type="submit"
              style={{ background: "none", border: "1px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: "12px", padding: "6px 12px", borderRadius: "4px" }}>
              Sign out
            </button>
          </form>
        </div>
      </div>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 16px" }}>
        {children}
      </div>
    </div>
  );
}
