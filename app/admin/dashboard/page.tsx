import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = createClient();

  const [
    { count: totalMembers },
    { count: pendingMembers },
    { count: posts },
    { count: archives },
    { count: research },
  ] = await Promise.all([
    supabase.from("members").select("*", { count: "exact", head: true }),
    supabase.from("members").select("*", { count: "exact", head: true }).eq("is_approved", false),
    supabase.from("content_posts").select("*", { count: "exact", head: true }),
    supabase.from("archive_items").select("*", { count: "exact", head: true }),
    supabase.from("research_outputs").select("*", { count: "exact", head: true }),
  ]);

  const cards = [
    {
      label: "Total Members", count: totalMembers ?? 0, href: "/admin/members",
      badge: (pendingMembers ?? 0) > 0 ? `${pendingMembers} pending` : null,
      color: "#00214D",
    },
    { label: "Content Posts (Struggles / History)", count: posts ?? 0, href: "/admin/content", color: "#2E8B57" },
    { label: "Events / Archives", count: archives ?? 0, href: "/admin/events", color: "#2E8B57" },
    { label: "Research Outputs", count: (research as any) ?? 0, href: "/admin/members", color: "#2E8B57" },
  ];

  return (
    <div>
      <h1 style={{ color: "#00214D", fontSize: "24px", fontWeight: "800", margin: "0 0 6px" }}>Admin Dashboard</h1>
      <p style={{ color: "#555", fontSize: "14px", margin: "0 0 28px" }}>
        ASUP JSPICT Kazaure Chapter — Website Administration
      </p>

      {(pendingMembers ?? 0) > 0 && (
        <div style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "10px", padding: "14px 18px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
          <p style={{ margin: 0, color: "#9a3412", fontSize: "14px", fontWeight: "600" }}>
            ⏳ {pendingMembers} member profile{(pendingMembers ?? 0) !== 1 ? "s" : ""} awaiting your approval
          </p>
          <Link href="/admin/members"
            style={{ backgroundColor: "#c2410c", color: "white", padding: "8px 16px", borderRadius: "6px", textDecoration: "none", fontWeight: "700", fontSize: "13px" }}>
            Review Now →
          </Link>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
        {cards.map((c) => (
          <Link key={c.href + c.label} href={c.href} style={{ textDecoration: "none" }}>
            <div style={{
              backgroundColor: "white", borderRadius: "12px", padding: "20px 22px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; }}
            >
              <p style={{ fontSize: "36px", fontWeight: "800", color: c.color, margin: "0 0 4px" }}>{c.count}</p>
              <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>{c.label}</p>
              {c.badge && (
                <span style={{ display: "inline-block", marginTop: "8px", backgroundColor: "#fff7ed", color: "#c2410c", padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" }}>
                  {c.badge}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ marginTop: "32px", backgroundColor: "white", borderRadius: "12px", padding: "20px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <h2 style={{ color: "#00214D", fontSize: "16px", fontWeight: "700", margin: "0 0 16px" }}>Quick Actions</h2>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link href="/admin/members" style={{ backgroundColor: "#00214D", color: "white", padding: "10px 18px", borderRadius: "8px", textDecoration: "none", fontWeight: "700", fontSize: "13px" }}>
            Approve Members
          </Link>
          <Link href="/admin/departments" style={{ backgroundColor: "#2E8B57", color: "white", padding: "10px 18px", borderRadius: "8px", textDecoration: "none", fontWeight: "700", fontSize: "13px" }}>
            Manage Departments
          </Link>
          <Link href="/admin/content" style={{ backgroundColor: "#e5e7eb", color: "#374151", padding: "10px 18px", borderRadius: "8px", textDecoration: "none", fontWeight: "700", fontSize: "13px" }}>
            Edit Struggles / History
          </Link>
          <Link href="/admin/events" style={{ backgroundColor: "#e5e7eb", color: "#374151", padding: "10px 18px", borderRadius: "8px", textDecoration: "none", fontWeight: "700", fontSize: "13px" }}>
            Manage Events
          </Link>
        </div>
      </div>
    </div>
  );
}
