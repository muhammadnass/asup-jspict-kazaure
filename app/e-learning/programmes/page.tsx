import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProgrammesPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/e-learning");

  const userId = session.user.id;
  const userEmail = session.user.email ?? "";

  const { data: member } = await supabase.from("members").select("id,full_name,is_approved").eq("user_id", userId).single();
  const { data: student } = await supabase.from("students").select("id,full_name,is_approved").eq("email", userEmail).single();

  if (!member?.is_approved && !student?.is_approved) redirect("/e-learning");

  const { data: programmes } = await supabase.from("programmes").select("*").order("created_at");
  const { data: allCourses } = await supabase.from("ln_courses").select("id,programme_id");

  const courseCount: Record<string, number> = {};
  (allCourses ?? []).forEach((c: any) => {
    courseCount[c.programme_id] = (courseCount[c.programme_id] ?? 0) + 1;
  });

  const displayName = member?.full_name ?? student?.full_name ?? "there";
  const isStudent = !!student?.is_approved;

  const levelColour: Record<string, string> = {
    ND: "#2E8B57",
    HND: "#00214D",
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #00214D, #003d99)", padding: "clamp(28px,5vw,52px) 24px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <Link href="/e-learning" style={{ color: "#FFB81C", fontSize: "12px", fontWeight: "600", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "16px" }}>
            ← Back to E-Learning
          </Link>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <p style={{ color: "#FFB81C", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>
                JSPICT E-Learning
              </p>
              <h1 style={{ color: "white", fontSize: "clamp(20px,5vw,32px)", fontWeight: "800", margin: "0 0 6px" }}>
                📚 Lecture Notes
              </h1>
              <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0 }}>
                Welcome back, {displayName.split(" ")[0]} — choose your programme to start learning
              </p>
            </div>
            {isStudent && (
              <Link href="/student/dashboard" style={{ backgroundColor: "#FFB81C", color: "#00214D", padding: "10px 18px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", textDecoration: "none" }}>
                📊 My Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Programme cards */}
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "clamp(24px,5vw,48px) 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {(programmes ?? []).map((prog: any) => {
            const isComingSoon = prog.status === "coming_soon";
            const count = courseCount[prog.id] ?? 0;
            const colour = levelColour[prog.level] ?? "#00214D";

            return (
              <div key={prog.id} style={{ position: "relative" }}>
                {isComingSoon ? (
                  <div style={{ backgroundColor: "white", borderRadius: "14px", padding: "28px", border: "1px solid #e5e7eb", borderTop: `4px solid #9ca3af`, opacity: 0.75 }}>
                    <span style={{ position: "absolute", top: "16px", right: "16px", backgroundColor: "#fef3c7", color: "#92400e", fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "99px", textTransform: "uppercase" }}>
                      Coming Soon
                    </span>
                    <div style={{ fontSize: "36px", marginBottom: "12px" }}>🤖</div>
                    <h2 style={{ color: "#6b7280", fontSize: "17px", fontWeight: "800", marginBottom: "8px" }}>{prog.title}</h2>
                    <p style={{ color: "#9ca3af", fontSize: "13px", lineHeight: "1.6", margin: "0 0 16px" }}>{prog.description}</p>
                    <div style={{ color: "#9ca3af", fontSize: "12px" }}>Available next semester</div>
                  </div>
                ) : (
                  <Link href={`/e-learning/programmes/${prog.code}`} style={{ textDecoration: "none", display: "block" }}>
                    <div style={{ backgroundColor: "white", borderRadius: "14px", padding: "28px", border: "1px solid #e5e7eb", borderTop: `4px solid ${colour}`, transition: "box-shadow 0.2s", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                        <span style={{ backgroundColor: colour, color: "white", fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "99px", textTransform: "uppercase" }}>
                          {prog.level}
                        </span>
                        <span style={{ color: "#9ca3af", fontSize: "12px" }}>{count} courses</span>
                      </div>
                      <div style={{ fontSize: "36px", marginBottom: "12px" }}>
                        {prog.level === "ND" ? "🎓" : "🏆"}
                      </div>
                      <h2 style={{ color: "#00214D", fontSize: "17px", fontWeight: "800", marginBottom: "8px", lineHeight: "1.3" }}>{prog.title}</h2>
                      <p style={{ color: "#6b7280", fontSize: "13px", lineHeight: "1.6", margin: "0 0 20px" }}>{prog.description}</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ color: colour, fontSize: "13px", fontWeight: "700" }}>Start Learning →</span>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
