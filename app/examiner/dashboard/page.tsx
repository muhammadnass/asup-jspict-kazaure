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

export default async function ExaminerDashboard() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/examiner/login");

  const { data: examiner } = await supabase.from("examiner_users").select("*").eq("email", session.user.email).single();
  if (!examiner || !examiner.approved) redirect("/examiner/login");

  // All assessments (examiners see everything for compilation)
  const { data: assessments } = await supabase
    .from("assessments")
    .select("*, members(full_name, title, department)")
    .order("created_at", { ascending: false });

  const { data: attempts } = await supabase
    .from("assessment_attempts")
    .select("*, students(full_name, reg_number, department), assessments(title, course_code, type, weight_pct, department)")
    .in("status", ["submitted", "timed_out"])
    .order("submitted_at", { ascending: false });

  const totalSat = attempts?.length ?? 0;
  const passCount = attempts?.filter((a: any) => a.grade && a.grade !== "F").length ?? 0;
  const avgPct = totalSat > 0
    ? ((attempts ?? []).reduce((s: number, a: any) => s + (a.percentage ?? 0), 0) / totalSat).toFixed(1)
    : "—";

  // Group by assessment for compilation view
  const byAssessment: Record<string, any[]> = {};
  for (const a of (attempts ?? [])) {
    const id = a.assessment_id;
    if (!byAssessment[id]) byAssessment[id] = [];
    byAssessment[id].push(a);
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f4f8" }}>
      <div style={{ backgroundColor: "#1e3a5f", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ color: "white", fontSize: "20px", fontWeight: "800" }}>🔍 Examiner Dashboard</h1>
          <p style={{ color: "#93c5fd", fontSize: "13px" }}>Result Compilation · {examiner.full_name}</p>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button type="submit" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white", padding: "8px 16px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}>
            Sign Out
          </button>
        </form>
      </div>

      <div style={{ padding: "28px 32px", maxWidth: "1100px", margin: "0 auto" }}>
        {/* Summary stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
          {[
            { label: "Total Assessments", value: assessments?.length ?? 0, icon: "📋" },
            { label: "Total Students Sat", value: totalSat, icon: "👨‍🎓" },
            { label: "Overall Pass Rate", value: totalSat > 0 ? `${((passCount / totalSat) * 100).toFixed(0)}%` : "—", icon: "✅" },
            { label: "Average Score", value: `${avgPct}%`, icon: "📊" },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>{s.icon}</div>
              <div style={{ fontSize: "26px", fontWeight: "800", color: "#1e3a5f" }}>{s.value}</div>
              <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Export all section */}
        <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "20px 24px", marginBottom: "24px" }}>
          <h2 style={{ color: "#1e3a5f", fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>📥 Export Results by Assessment</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {(assessments ?? []).filter((a: any) => a.status === "closed" || a.status === "open").map((a: any) => {
              const count = byAssessment[a.id]?.length ?? 0;
              return (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", backgroundColor: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: "700", color: "#1e3a5f", fontSize: "14px" }}>{a.course_code}</span>
                    <span style={{ color: "#6b7280", fontSize: "13px" }}> — {a.title}</span>
                    <span style={{ color: "#9ca3af", fontSize: "12px", marginLeft: "8px" }}>({count} student{count !== 1 ? "s" : ""})</span>
                  </div>
                  <span style={{ backgroundColor: a.type === "ca" ? "#dbeafe" : "#fef3c7", color: a.type === "ca" ? "#1d4ed8" : "#92400e", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "99px" }}>
                    {a.type === "ca" ? "CA 40%" : "EXAM 60%"}
                  </span>
                  <a href={`/api/assessment/export?id=${a.id}&format=excel`} style={{ color: "#166534", fontSize: "12px", fontWeight: "600", textDecoration: "none", backgroundColor: "#f0fdf4", padding: "6px 12px", borderRadius: "6px", border: "1px solid #86efac" }}>📊 Excel</a>
                  <a href={`/api/assessment/export?id=${a.id}&format=pdf`} target="_blank" style={{ color: "#dc2626", fontSize: "12px", fontWeight: "600", textDecoration: "none", backgroundColor: "#fef2f2", padding: "6px 12px", borderRadius: "6px", border: "1px solid #fca5a5" }}>📄 PDF</a>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full results table */}
        <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid #e5e7eb" }}>
            <h2 style={{ color: "#1e3a5f", fontSize: "16px", fontWeight: "700" }}>All Student Results</h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb" }}>
                  {["S/N", "Student", "Reg. No.", "Dept.", "Course", "Type", "Score", "%", "Grade", "Weighted", "Flags"].map(h => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "#6b7280", fontWeight: "600", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(attempts ?? []).slice(0, 100).map((a: any, i: number) => {
                  const weighted = ((a.percentage ?? 0) / 100 * (a.assessments?.weight_pct ?? 0)).toFixed(1);
                  return (
                    <tr key={a.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "10px 12px", color: "#9ca3af" }}>{i + 1}</td>
                      <td style={{ padding: "10px 12px", fontWeight: "600", color: "#1e3a5f" }}>{a.students?.full_name}</td>
                      <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: "12px", color: "#6b7280" }}>{a.students?.reg_number}</td>
                      <td style={{ padding: "10px 12px", color: "#6b7280", fontSize: "12px" }}>{a.students?.department}</td>
                      <td style={{ padding: "10px 12px", color: "#374151" }}>{a.assessments?.course_code}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ backgroundColor: a.assessments?.type === "ca" ? "#dbeafe" : "#fef3c7", color: a.assessments?.type === "ca" ? "#1d4ed8" : "#92400e", fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "99px" }}>
                          {a.assessments?.type?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", fontWeight: "600" }}>{a.score}/{a.total_marks}</td>
                      <td style={{ padding: "10px 12px", fontWeight: "600" }}>{a.percentage}%</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ color: getGradeColor(a.grade), fontWeight: "800", fontSize: "15px" }}>{a.grade}</span>
                      </td>
                      <td style={{ padding: "10px 12px", color: "#374151" }}>{weighted}/{a.assessments?.weight_pct}</td>
                      <td style={{ padding: "10px 12px", color: a.tab_switches > 2 ? "#dc2626" : "#9ca3af", fontWeight: a.tab_switches > 2 ? "700" : "400", fontSize: "12px" }}>
                        {a.tab_switches > 2 ? `⚠️ ${a.tab_switches}` : a.tab_switches ?? 0}
                      </td>
                    </tr>
                  );
                })}
                {(attempts ?? []).length === 0 && (
                  <tr><td colSpan={11} style={{ padding: "32px", textAlign: "center", color: "#9ca3af" }}>No results yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
