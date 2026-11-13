import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

function LoginWall({ message }: { message?: string }) {
  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <div style={{ background: "linear-gradient(135deg, #00214D, #003d99)", padding: "clamp(32px,6vw,60px) 24px" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ color: "#FFB81C", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
            JSPICT E-Learning Platform
          </p>
          <h1 style={{ color: "white", fontSize: "clamp(22px,5vw,34px)", fontWeight: "800", marginBottom: "12px" }}>
            Course Materials & Resources
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: "1.7", maxWidth: "480px", margin: "0 auto" }}>
            Access lecture notes, videos, PDF downloads, and quizzes — all from your JSPICT account.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "clamp(24px,5vw,48px) 20px" }}>
        {message && (
          <div style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "10px", padding: "14px 18px", marginBottom: "24px", color: "#9a3412", fontSize: "13px", fontWeight: "600", textAlign: "center" }}>
            ⚠️ {message}
          </div>
        )}

        {/* Student card */}
        <div style={{ backgroundColor: "white", borderRadius: "14px", padding: "clamp(20px,5vw,32px)", marginBottom: "20px", border: "1px solid #e5e7eb", borderTop: "4px solid #2E8B57", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
            <div style={{ fontSize: "36px" }}>🎓</div>
            <div>
              <h2 style={{ color: "#00214D", fontSize: "18px", fontWeight: "800", margin: "0 0 2px" }}>I am a Student</h2>
              <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>Access lecture notes, quizzes and track your progress</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link href="/student/login"
              style={{ flex: 1, minWidth: "140px", backgroundColor: "#2E8B57", color: "white", padding: "12px 20px", borderRadius: "8px", fontWeight: "700", fontSize: "14px", textDecoration: "none", textAlign: "center", display: "block" }}>
              Sign In
            </Link>
            <Link href="/student/register"
              style={{ flex: 1, minWidth: "140px", backgroundColor: "#f0fdf4", color: "#166534", padding: "12px 20px", borderRadius: "8px", fontWeight: "700", fontSize: "14px", textDecoration: "none", textAlign: "center", display: "block", border: "1px solid #86efac" }}>
              Create Account
            </Link>
          </div>
          <p style={{ color: "#9ca3af", fontSize: "11px", margin: "10px 0 0" }}>
            New student accounts are activated after admin approval.
          </p>
        </div>

        {/* Lecturer card */}
        <div style={{ backgroundColor: "white", borderRadius: "14px", padding: "clamp(20px,5vw,32px)", border: "1px solid #e5e7eb", borderTop: "4px solid #00214D", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
            <div style={{ fontSize: "36px" }}>👨‍🏫</div>
            <div>
              <h2 style={{ color: "#00214D", fontSize: "18px", fontWeight: "800", margin: "0 0 2px" }}>I am a Lecturer</h2>
              <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>Upload course materials, assignments and projects</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link href="/members/login"
              style={{ flex: 1, minWidth: "140px", backgroundColor: "#00214D", color: "white", padding: "12px 20px", borderRadius: "8px", fontWeight: "700", fontSize: "14px", textDecoration: "none", textAlign: "center", display: "block" }}>
              Sign In
            </Link>
            <Link href="/register"
              style={{ flex: 1, minWidth: "140px", backgroundColor: "#f0f4ff", color: "#00214D", padding: "12px 20px", borderRadius: "8px", fontWeight: "700", fontSize: "14px", textDecoration: "none", textAlign: "center", display: "block", border: "1px solid #c7d2fe" }}>
              Create Account
            </Link>
          </div>
          <p style={{ color: "#9ca3af", fontSize: "11px", margin: "10px 0 0" }}>
            Lecturer accounts require admin approval before you can upload materials.
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function ELearningPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return <LoginWall />;

  const userId = session.user.id;
  const userEmail = session.user.email ?? "";

  const { data: member } = await supabase.from("members").select("id,full_name,is_approved").eq("user_id", userId).single();
  const { data: student } = await supabase.from("students").select("id,full_name,is_approved").eq("email", userEmail).single();

  const isApprovedMember = member?.is_approved === true;
  const isApprovedStudent = student?.is_approved === true;

  if ((member && !isApprovedMember) || (student && !isApprovedStudent)) {
    return <LoginWall message="Your account is pending admin approval. You will be notified via WhatsApp once approved." />;
  }

  if (!isApprovedMember && !isApprovedStudent) {
    return <LoginWall message="Please sign in with your student or lecturer account to access course materials." />;
  }

  // ── Fetch lecturer-uploaded courses ──
  const { data: courses } = await supabase
    .from("courses")
    .select("*, members(full_name, photo_url, role, department, title)")
    .eq("published", true)
    .order("created_at", { ascending: false });

  const list = courses ?? [];
  const byDept: Record<string, typeof list> = {};
  list.forEach((c: any) => {
    const dept = (c.members as any)?.department ?? "General";
    if (!byDept[dept]) byDept[dept] = [];
    byDept[dept].push(c);
  });

  const displayName = member?.full_name ?? student?.full_name ?? "there";

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #00214D, #003d99)", padding: "40px 24px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <p style={{ color: "#FFB81C", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>
              JSPICT E-Learning Platform
            </p>
            <h1 style={{ color: "white", fontSize: "clamp(20px,5vw,28px)", fontWeight: "800", marginBottom: "4px" }}>
              Welcome back, {displayName.split(" ")[0]}! 👋
            </h1>
            <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0 }}>
              What would you like to do today?
            </p>
          </div>
          <form action={isApprovedStudent ? "/api/student/logout" : "/api/member/logout"} method="POST">
            <button type="submit" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", padding: "8px 16px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>
              Sign Out
            </button>
          </form>
        </div>
      </div>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Quick access cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px", marginBottom: "36px" }}>
          <Link href="/e-learning/programmes" style={{ textDecoration: "none" }}>
            <div style={{ backgroundColor: "#00214D", color: "white", borderRadius: "12px", padding: "24px 20px", cursor: "pointer" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>📚</div>
              <h3 style={{ color: "white", fontSize: "16px", fontWeight: "800", margin: "0 0 4px" }}>Lecture Notes</h3>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "12px", margin: 0 }}>
                AI-generated notes for all courses. Read, download & quiz yourself.
              </p>
            </div>
          </Link>

          {isApprovedStudent && (
            <Link href="/student/dashboard" style={{ textDecoration: "none" }}>
              <div style={{ backgroundColor: "#2E8B57", color: "white", borderRadius: "12px", padding: "24px 20px", cursor: "pointer" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>📊</div>
                <h3 style={{ color: "white", fontSize: "16px", fontWeight: "800", margin: "0 0 4px" }}>My Dashboard</h3>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "12px", margin: 0 }}>
                  Track progress, streaks, points and badges.
                </p>
              </div>
            </Link>
          )}

          <div style={{ backgroundColor: "#FFB81C", borderRadius: "12px", padding: "24px 20px" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🎥</div>
            <h3 style={{ color: "#00214D", fontSize: "16px", fontWeight: "800", margin: "0 0 4px" }}>Video Lectures</h3>
            <p style={{ color: "#92400e", fontSize: "12px", margin: 0 }}>
              Uploaded by your lecturers below.
            </p>
          </div>
        </div>

        {/* Lecturer-uploaded courses */}
        <h2 style={{ color: "#00214D", fontSize: "18px", fontWeight: "800", marginBottom: "16px" }}>
          🎥 Uploaded Course Materials
        </h2>
        {list.length === 0 ? (
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "60px 24px", textAlign: "center", border: "1px solid #e5e7eb" }}>
            <p style={{ fontSize: "48px", marginBottom: "12px" }}>📂</p>
            <h2 style={{ color: "#00214D", fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>No Uploaded Materials Yet</h2>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>Lecturers will upload videos, PDFs and slides here. Meanwhile, check out the Lecture Notes above!</p>
          </div>
        ) : (
          Object.entries(byDept).map(([dept, deptCourses]) => (
            <div key={dept} style={{ marginBottom: "36px" }}>
              <h2 style={{ color: "#00214D", fontSize: "16px", fontWeight: "700", marginBottom: "16px", paddingBottom: "8px", borderBottom: "2px solid #FFB81C", display: "inline-block" }}>
                {dept}
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                {deptCourses.map((course: any) => {
                  const lecturer = course.members as any;
                  return (
                    <Link key={course.id} href={`/e-learning/${course.id}`}
                      style={{ backgroundColor: "white", borderRadius: "10px", padding: "20px", textDecoration: "none", display: "block", border: "1px solid #e5e7eb", borderTop: "3px solid #2E8B57" }}>
                      <h3 style={{ color: "#00214D", fontSize: "14px", fontWeight: "700", marginBottom: "6px", lineHeight: "1.4" }}>{course.title}</h3>
                      {course.description && (
                        <p style={{ color: "#6b7280", fontSize: "12px", lineHeight: "1.6", marginBottom: "12px" }}>{course.description}</p>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "10px", borderTop: "1px solid #f3f4f6" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#dbeafe", overflow: "hidden", flexShrink: 0 }}>
                          {lecturer?.photo_url
                            ? <img src={lecturer.photo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "#00214D" }}>
                                {lecturer?.full_name?.charAt(0) ?? "L"}
                              </div>
                          }
                        </div>
                        <div>
                          <p style={{ fontSize: "11px", fontWeight: "600", color: "#374151", margin: 0 }}>
                            {lecturer?.title ? `${lecturer.title} ` : ""}{lecturer?.full_name ?? "Lecturer"}
                          </p>
                          <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>{lecturer?.role}</p>
                        </div>
                        <span style={{ marginLeft: "auto", color: "#2E8B57", fontSize: "12px", fontWeight: "700" }}>View →</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
