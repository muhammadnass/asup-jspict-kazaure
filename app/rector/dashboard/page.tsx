import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RectorDashboard() {
  const supabase = createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/rector/login");

  const { data: rector } = await supabase
    .from("rector_users")
    .select("name, title")
    .eq("email", session.user.email)
    .single();

  if (!rector) redirect("/rector/login");

  const [
    { count: totalMembers },
    { count: approvedMembers },
    { count: pendingMembers },
    { count: totalCourses },
    { count: totalEvents },
    { data: recentMembers },
    { data: recentEvents },
    { data: courses },
  ] = await Promise.all([
    supabase.from("members").select("*", { count: "exact", head: true }),
    supabase.from("members").select("*", { count: "exact", head: true }).eq("is_approved", true),
    supabase.from("members").select("*", { count: "exact", head: true }).eq("is_approved", false),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("members").select("full_name, role, department, is_approved, created_at").order("created_at", { ascending: false }).limit(6),
    supabase.from("events").select("title, date, location").order("date", { ascending: false }).limit(4),
    supabase.from("courses").select("title, department, level").order("created_at", { ascending: false }).limit(6),
  ]);

  const displayName = rector.name ?? "Rector";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const statCards = [
    { label: "Total Members", value: totalMembers ?? 0, color: "#3b82f6", icon: "👥" },
    { label: "Approved", value: approvedMembers ?? 0, color: "#2E8B57", icon: "✅" },
    { label: "Pending", value: pendingMembers ?? 0, color: "#f59e0b", icon: "⏳" },
    { label: "Courses", value: totalCourses ?? 0, color: "#8b5cf6", icon: "📚" },
    { label: "Events", value: totalEvents ?? 0, color: "#ec4899", icon: "📅" },
    { label: "Active Rate", value: `${totalMembers ? Math.round(((approvedMembers ?? 0) / totalMembers) * 100) : 0}%`, color: "#00214D", icon: "📊" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", color: "white", padding: "0" }}>
      <nav style={{ backgroundColor: "#1e293b", borderBottom: "1px solid #334155", padding: "0 clamp(16px,4vw,32px)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#00214D", border: "2px solid #FFB81C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "800", color: "#FFB81C", flexShrink: 0 }}>
              {displayName.charAt(0)}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "clamp(12px,3vw,14px)", fontWeight: "700", color: "white", lineHeight: "1.2" }}>
                {rector.title ? `${rector.title} ` : ""}{displayName}
              </p>
              <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>Rector, JSPICT Kazaure</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <a href="/" target="_blank" style={{ fontSize: "12px", color: "#94a3b8", textDecoration: "none", padding: "6px 12px", borderRadius: "6px", border: "1px solid #334155", whiteSpace: "nowrap" }}>
              View Site ↗
            </a>
            <form action="/api/rector/logout" method="POST">
              <button type="submit" style={{ fontSize: "12px", color: "#94a3b8", background: "none", border: "1px solid #334155", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", whiteSpace: "nowrap" }}>
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "clamp(16px,4vw,32px)" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ color: "white", fontSize: "clamp(20px,5vw,28px)", fontWeight: "800", margin: "0 0 4px" }}>
            {greeting}, {rector.title ? `${rector.title} ` : ""}{displayName.split(" ")[0]} 👋
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>ASUP JSPICT Kazaure Chapter — Rector's Overview</p>
        </div>

        <div className="rector-stats" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "28px" }}>
          {statCards.map(card => (
            <div key={card.label} style={{ backgroundColor: "#1e293b", borderRadius: "12px", padding: "clamp(14px,3vw,20px)", borderLeft: `4px solid ${card.color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
              <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em" }}>{card.label}</p>
              <p style={{ margin: 0, fontSize: "clamp(22px,5vw,32px)", fontWeight: "800", color: card.color, lineHeight: "1" }}>{card.value}</p>
              <p style={{ margin: "4px 0 0", fontSize: "18px" }}>{card.icon}</p>
            </div>
          ))}
        </div>

        <div className="rector-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          <div style={{ backgroundColor: "#1e293b", borderRadius: "12px", padding: "20px" }}>
            <h2 style={{ color: "white", fontSize: "16px", fontWeight: "700", margin: "0 0 16px" }}>👥 Recent Registrations</h2>
            {(recentMembers ?? []).map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: i < (recentMembers?.length ?? 0) - 1 ? "1px solid #334155" : "none" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700", color: "#FFB81C", flexShrink: 0 }}>
                  {m.full_name?.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.full_name}</p>
                  <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.role}{m.department ? ` · ${m.department}` : ""}</p>
                </div>
                <span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: "700", flexShrink: 0, backgroundColor: m.is_approved ? "#1a4731" : "#432c0a", color: m.is_approved ? "#4ade80" : "#fbbf24" }}>
                  {m.is_approved ? "✓" : "⏳"}
                </span>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: "#1e293b", borderRadius: "12px", padding: "20px" }}>
            <h2 style={{ color: "white", fontSize: "16px", fontWeight: "700", margin: "0 0 16px" }}>📅 Events</h2>
            {(recentEvents ?? []).length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "13px" }}>No events yet.</p>
            ) : (recentEvents ?? []).map((ev, i) => (
              <div key={i} style={{ padding: "12px 0", borderBottom: i < (recentEvents?.length ?? 0) - 1 ? "1px solid #334155" : "none" }}>
                <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: "600", color: "white" }}>{ev.title}</p>
                <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
                  {ev.date ? new Date(ev.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "TBA"}
                  {ev.location ? ` · ${ev.location}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>

        {(courses ?? []).length > 0 && (
          <div style={{ backgroundColor: "#1e293b", borderRadius: "12px", padding: "20px" }}>
            <h2 style={{ color: "white", fontSize: "16px", fontWeight: "700", margin: "0 0 16px" }}>📚 E-Learning Courses ({totalCourses ?? 0} total)</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
              {(courses ?? []).map((c, i) => (
                <div key={i} style={{ backgroundColor: "#0f172a", borderRadius: "8px", padding: "12px", border: "1px solid #334155" }}>
                  <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: "600", color: "white", lineHeight: "1.3" }}>{c.title}</p>
                  <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>{c.department}{c.level ? ` · ${c.level}` : ""}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <p style={{ color: "#475569", fontSize: "12px", textAlign: "center", marginTop: "32px" }}>
          ASUP JSPICT Kazaure Chapter Platform · Rector's Dashboard
        </p>
      </main>
    </div>
  );
}
