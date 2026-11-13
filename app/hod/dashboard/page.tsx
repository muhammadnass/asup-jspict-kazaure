import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function getGradeColor(grade: string) {
  if (grade === "A") return "#166534";
  if (grade === "B") return "#1d4ed8";
  if (grade === "C") return "#92400e";
  if (grade === "D") return "#b45309";
  return "#dc2626";
}

export default async function HodDashboard() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/hod/login");

  const { data: hod } = await supabase.from("hod_users").select("*").eq("email", session.user.email).single();
  if (!hod || !hod.approved) redirect("/hod/login");

  // All assessments for HOD's department
  const { data: assessments } = await supabase
    .from("assessments")
    .select("*, members(full_name, title)")
    .eq("department", hod.department)
    .order("created_at", { ascending: false });

  // All attempts for those assessments
  const assessmentIds = (assessments ?? []).map((a: any) => a.id);
  const { data: attempts } = assessmentIds.length > 0 ? await supabase
    .from("assessment_attempts")
    .select("*, students(full_name, reg_number), assessments(title, course_code, type, weight_pct)")
    .in("assessment_id", assessmentIds)
    .in("status", ["submitted", "timed_out"])
    .order("submitted_at", { ascending: false }) : { data: [] };

  const totalAssessments = assessments?.length ?? 0;
  const openAssessments = assessments?.filter((a: any) => a.status === "open").length ?? 0;
  const totalAttempts = attempts?.length ?? 0;
  const passCount = attempts?.filter((a: any) => a.grade && a.grade !== "F").length ?? 0;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f4f8" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#00214D", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ color: "white", fontSize: "20px", fontWeight: "800" }}>🏛️ HOD Dashboard</h1>
          <p style={{ color: "#93c5fd", fontSize: "13px" }}>{hod.department} · {hod.full_name}</p>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button type="submit" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white", padding: "8px 16px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>
            Sign Out
          </button>
        </form>
      </div>

      <div style={{ padding: "28px 32px", maxWidth: "1100px", margin: "0 auto" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
          {[
            { label: "Total Assessments", value: totalAssessments, icon: "📋", color: "#dbeafe" },
            { label: "Open Now", value: openAssessments, icon: "🟢", color: "#dcfce7" },
            { label: "Students Sat", value: totalAttempts, icon: "👨‍🎓", color: "#fef3c7" },
            { label: "Pass Rate", value: totalAttempts > 0 ? `${((passCount / totalAttempts) * 100).toFixed(0)}%` : "—", icon: "📊", color: "#f3e8ff" },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>{s.icon}</div>
              <div style={{ fontSize: "26px", fontWeight: "800", color: "#00214D" }}>{s.value}</div>
              <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Assessments table */}
        <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e5e7eb", marginBottom: "24px" }}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ color: "#00214D", fontSize: "16px", fontWeight: "700" }}>All Assessments — {hod.department}</h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb" }}>
                  {["Course", "Title", "Type", "Lecturer", "Status", "Export"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#6b7280", fontWeight: "600", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(assessments ?? []).map((a: any) => (
                  <tr key={a.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 14px", fontWeight: "600", color: "#00214D" }}>{a.course_code}</td>
                    <td style={{ padding: "12px 14px", color: "#374151" }}>{a.title}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ backgroundColor: a.type === "ca" ? "#dbeafe" : "#fef3c7", color: a.type === "ca" ? "#1d4ed8" : "#92400e", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "99px" }}>
                        {a.type === "ca" ? "CA 40%" : "EXAM 60%"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", color: "#374151" }}>{a.members?.title} {a.members?.full_name}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ backgroundColor: a.status === "open" ? "#dcfce7" : a.status === "closed" ? "#fee2e2" : "#f3f4f6", color: a.status === "open" ? "#166534" : a.status === "closed" ? "#dc2626" : "#6b7280", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "99px", textTransform: "uppercase" }}>
                        {a.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <a href={`/api/assessment/export?id=${a.id}&format=excel`} style={{ color: "#166534", fontSize: "12px", fontWeight: "600", textDecoration: "none", backgroundColor: "#f0fdf4", padding: "4px 10px", borderRadius: "5px" }}>📊 Excel</a>
                        <a href={`/api/assessment/export?id=${a.id}&format=pdf`} target="_blank" style={{ color: "#dc2626", fontSize: "12px", fontWeight: "600", textDecoration: "none", backgroundColor: "#fef2f2", padding: "4px 10px", borderRadius: "5px" }}>📄 PDF</a>
                      </div>
                    </td>
                  </tr>
                ))}
                {(assessments ?? []).length === 0 && (
                  <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>No assessments found for this department.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent results */}
        <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid #e5e7eb" }}>
            <h2 style={{ color: "#00214D", fontSize: "16px", fontWeight: "700" }}>Recent Student Results</h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb" }}>
                  {["Student", "Reg. No.", "Assessment", "Score", "%", "Grade", "Flags"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#6b7280", fontWeight: "600", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(attempts ?? []).slice(0, 50).map((a: any) => (
                  <tr key={a.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "11px 14px", color: "#374151" }}>{a.students?.full_name}</td>
                    <td style={{ padding: "11px 14px", fontFamily: "monospace", color: "#6b7280", fontSize: "12px" }}>{a.students?.reg_number}</td>
                    <td style={{ padding: "11px 14px", color: "#374151" }}>{a.assessments?.course_code} — {a.assessments?.title}</td>
                    <td style={{ padding: "11px 14px", fontWeight: "600" }}>{a.score}/{a.total_marks}</td>
                    <td style={{ padding: "11px 14px", fontWeight: "600" }}>{a.percentage}%</td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ color: getGradeColor(a.grade), fontWeight: "800", fontSize: "14px" }}>{a.grade}</span>
                    </td>
                    <td style={{ padding: "11px 14px", color: a.tab_switches > 2 ? "#dc2626" : "#9ca3af", fontWeight: a.tab_switches > 2 ? "700" : "400" }}>
                      {a.tab_switches > 2 ? `⚠️ ${a.tab_switches}` : a.tab_switches ?? 0}
                    </td>
                  </tr>
                ))}
                {(attempts ?? []).length === 0 && (
                  <tr><td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>No results yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
