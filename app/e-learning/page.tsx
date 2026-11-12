import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const revalidate = 60;

export default async function ELearningPage() {
  const supabase = createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*, members(full_name, photo_url, role, department, title)")
    .order("created_at", { ascending: false });

  const list = courses ?? [];

  // Group by department
  const byDept: Record<string, typeof list> = {};
  list.forEach((c: any) => {
    const dept = (c.members as any)?.department ?? "General";
    if (!byDept[dept]) byDept[dept] = [];
    byDept[dept].push(c);
  });

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #00214D, #003d99)", padding: "40px 24px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <p style={{ color: "#FFB81C", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>
            JSPICT E-Learning Platform
          </p>
          <h1 style={{ color: "white", fontSize: "26px", fontWeight: "800", marginBottom: "8px" }}>Course Materials</h1>
          <p style={{ color: "#9ca3af", fontSize: "14px", maxWidth: "500px" }}>
            Access lecture videos, PDF notes, and presentation slides uploaded by your lecturers. Sign in to view course content.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px" }}>
        {list.length === 0 ? (
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "60px 24px", textAlign: "center" }}>
            <p style={{ fontSize: "48px", marginBottom: "12px" }}>🎓</p>
            <h2 style={{ color: "#00214D", fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>No Courses Yet</h2>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>Lecturers will upload course materials soon. Check back later.</p>
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

        {/* Student login CTA */}
        <div style={{ backgroundColor: "#00214D", borderRadius: "10px", padding: "24px", textAlign: "center", marginTop: "32px" }}>
          <h3 style={{ color: "white", fontSize: "16px", fontWeight: "700", marginBottom: "8px" }}>Access Full Course Content</h3>
          <p style={{ color: "#9ca3af", fontSize: "13px", marginBottom: "16px" }}>
            Students must sign in to download materials and watch lecture videos.
          </p>
          <Link href="/student/login"
            style={{ display: "inline-block", backgroundColor: "#2E8B57", color: "white", padding: "10px 24px", borderRadius: "6px", fontWeight: "700", fontSize: "13px", textDecoration: "none" }}>
            Student Sign In →
          </Link>
        </div>
      </div>
    </div>
  );
}
