import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RectorDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/rector/login");

  const { data: rector } = await supabase
    .from("rector_users")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!rector) redirect("/rector/login");

  // Fetch stats
  const [
    { count: membersCount },
    { count: approvedCount },
    { count: pendingCount },
    { count: coursesCount },
    { count: eventsCount },
    { data: recentMembers },
    { data: recentEvents },
    { data: courses },
  ] = await Promise.all([
    supabase.from("members").select("*", { count: "exact", head: true }),
    supabase.from("members").select("*", { count: "exact", head: true }).eq("is_approved", true),
    supabase.from("members").select("*", { count: "exact", head: true }).eq("is_approved", false),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("archive_items").select("*", { count: "exact", head: true }),
    supabase.from("members").select("full_name, role, department, title, is_approved, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("archive_items").select("title, record_date, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("courses").select("title, description, member_id, created_at, members(full_name, department)").order("created_at", { ascending: false }).limit(6),
  ]);

  const stats = [
    { label: "Total Staff Members", value: membersCount ?? 0, color: "#00214D", icon: "👥" },
    { label: "Approved Profiles", value: approvedCount ?? 0, color: "#2E8B57", icon: "✅" },
    { label: "Pending Approval", value: pendingCount ?? 0, color: "#f59e0b", icon: "⏳" },
    { label: "Active Courses", value: coursesCount ?? 0, color: "#7c3aed", icon: "📚" },
    { label: "Events / Records", value: eventsCount ?? 0, color: "#0891b2", icon: "🗂️" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", fontFamily: "system-ui, sans-serif" }}>
      {/* Top Bar */}
      <div style={{ backgroundColor: "#1e293b", borderBottom: "2px solid #FFB81C", padding: "0 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "20px" }}>🏛️</span>
            <div>
              <div style={{ color: "#FFB81C", fontWeight: "800", fontSize: "14px" }}>RECTOR DASHBOARD</div>
              <div style={{ color: "#94a3b8", fontSize: "11px" }}>JSPICT Kazaure — Administrative Overview</div>
            </div>
          </div>
          <form action="/api/auth/signout" method="POST">
            <a href="/" style={{ color: "#94a3b8", fontSize: "13px", textDecoration: "none" }}>← Public Site</a>
          </form>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Welcome */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ color: "white", fontSize: "24px", fontWeight: "700", marginBottom: "4px" }}>
            Welcome, {rector.name ?? "Rector"}
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>
            Here is your administrative overview for JSPICT Kazaure — {new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          {stats.map(s => (
            <div key={s.label} style={{ backgroundColor: "#1e293b", borderRadius: "10px", padding: "20px", borderLeft: `4px solid ${s.color}` }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>{s.icon}</div>
              <div style={{ color: "white", fontSize: "28px", fontWeight: "800", lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
          {/* Recent Staff */}
          <div style={{ backgroundColor: "#1e293b", borderRadius: "10px", padding: "20px" }}>
            <h2 style={{ color: "#FFB81C", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>
              Recent Staff Registrations
            </h2>
            {(recentMembers ?? []).map((m: any) => (
              <div key={m.full_name + m.created_at} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #334155" }}>
                <div>
                  <p style={{ color: "white", fontSize: "13px", fontWeight: "600", margin: 0 }}>{m.title ? `${m.title} ${m.full_name}` : m.full_name}</p>
                  <p style={{ color: "#64748b", fontSize: "11px", margin: "2px 0 0" }}>{m.role} · {m.department}</p>
                </div>
                <span style={{
                  display: "inline-block",
                  backgroundColor: m.is_approved ? "#064e3b" : "#451a03",
                  color: m.is_approved ? "#6ee7b7" : "#fcd34d",
                  fontSize: "10px",
                  fontWeight: "700",
                  padding: "2px 8px",
                  borderRadius: "10px"
                }}>
                  {m.is_approved ? "Active" : "Pending"}
                </span>
              </div>
            ))}
          </div>

          {/* Recent Events */}
          <div style={{ backgroundColor: "#1e293b", borderRadius: "10px", padding: "20px" }}>
            <h2 style={{ color: "#FFB81C", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>
              Recent Events & Records
            </h2>
            {(recentEvents ?? []).map((ev: any) => (
              <div key={ev.title + ev.created_at} style={{ padding: "10px 0", borderBottom: "1px solid #334155" }}>
                <p style={{ color: "white", fontSize: "13px", fontWeight: "600", margin: 0 }}>{ev.title}</p>
                <p style={{ color: "#64748b", fontSize: "11px", margin: "2px 0 0" }}>
                  {ev.record_date ? new Date(ev.record_date).toLocaleDateString("en-NG") : "No date"}
                </p>
              </div>
            ))}
            {(recentEvents ?? []).length === 0 && (
              <p style={{ color: "#475569", fontSize: "13px" }}>No events recorded yet.</p>
            )}
          </div>
        </div>

        {/* Courses */}
        <div style={{ backgroundColor: "#1e293b", borderRadius: "10px", padding: "20px", marginBottom: "32px" }}>
          <h2 style={{ color: "#FFB81C", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>
            Active E-Learning Courses
          </h2>
          {(courses ?? []).length === 0 ? (
            <p style={{ color: "#475569", fontSize: "13px" }}>No courses created yet.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
              {(courses ?? []).map((c: any) => (
                <div key={c.title} style={{ backgroundColor: "#0f172a", borderRadius: "8px", padding: "14px", border: "1px solid #334155" }}>
                  <p style={{ color: "white", fontSize: "13px", fontWeight: "700", margin: "0 0 4px" }}>{c.title}</p>
                  <p style={{ color: "#94a3b8", fontSize: "11px", margin: "0 0 6px" }}>{c.description}</p>
                  <p style={{ color: "#64748b", fontSize: "11px", margin: 0 }}>
                    {(c.members as any)?.full_name} · {(c.members as any)?.department}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div style={{ backgroundColor: "#1e293b", borderRadius: "10px", padding: "20px" }}>
          <h2 style={{ color: "#FFB81C", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>
            Quick Links
          </h2>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {[
              { label: "ASUP Members", href: "/members" },
              { label: "Research Outputs", href: "/research-outputs" },
              { label: "Events", href: "/events" },
              { label: "E-Learning", href: "/e-learning" },
              { label: "JSPICT Website", href: "https://www.jspict.edu.ng", external: true },
            ].map(l => (
              <a key={l.label} href={l.href} target={l.external ? "_blank" : "_self"} rel={l.external ? "noopener noreferrer" : ""}
                style={{ backgroundColor: "#0f172a", color: "#cbd5e1", padding: "10px 16px", borderRadius: "6px", textDecoration: "none", fontSize: "13px", fontWeight: "600", border: "1px solid #334155" }}>
                {l.label} {l.external ? "↗" : "→"}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
