import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProgrammePage({ params }: { params: { code: string } }) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/e-learning");

  const userId = session.user.id;
  const userEmail = session.user.email ?? "";

  const { data: member } = await supabase.from("members").select("id,full_name,is_approved").eq("user_id", userId).single();
  const { data: student } = await supabase.from("students").select("id,full_name,is_approved").eq("email", userEmail).single();

  if (!member?.is_approved && !student?.is_approved) redirect("/e-learning");

  const { data: programme } = await supabase
    .from("programmes").select("*").eq("code", params.code).single();

  if (!programme) notFound();

  const { data: courses } = await supabase
    .from("ln_courses")
    .select("*")
    .eq("programme_id", programme.id)
    .order("year").order("semester").order("code");

  // Get note counts per course
  const { data: noteData } = await supabase
    .from("lecture_notes")
    .select("course_id");

  const noteCounts: Record<string, number> = {};
  (noteData ?? []).forEach((n: any) => {
    noteCounts[n.course_id] = (noteCounts[n.course_id] ?? 0) + 1;
  });

  // Get student progress if student
  let completedNotes: Set<string> = new Set();
  if (student?.id) {
    const { data: progress } = await supabase
      .from("student_progress")
      .select("note_id,course_id,completed")
      .eq("student_id", student.id)
      .eq("completed", true);
    (progress ?? []).forEach((p: any) => completedNotes.add(p.note_id));
  }

  // Group by year and semester
  const grouped: Record<string, Record<string, any[]>> = {};
  (courses ?? []).forEach((c: any) => {
    const yk = `Year ${c.year}`;
    const sk = `Semester ${c.semester}`;
    if (!grouped[yk]) grouped[yk] = {};
    if (!grouped[yk][sk]) grouped[yk][sk] = [];
    grouped[yk][sk].push(c);
  });

  const levelColour = programme.level === "ND" ? "#2E8B57" : "#00214D";

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${levelColour}, #003d99)`, padding: "clamp(28px,5vw,52px) 24px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <Link href="/e-learning/programmes" style={{ color: "#FFB81C", fontSize: "12px", fontWeight: "600", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "16px" }}>
            ← All Programmes
          </Link>
          <span style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white", fontSize: "10px", fontWeight: "700", padding: "3px 10px", borderRadius: "99px", textTransform: "uppercase", marginLeft: "10px" }}>
            {programme.level}
          </span>
          <h1 style={{ color: "white", fontSize: "clamp(20px,5vw,32px)", fontWeight: "800", margin: "12px 0 8px" }}>
            {programme.title}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px", maxWidth: "600px", margin: 0 }}>
            {programme.description}
          </p>
        </div>
      </div>

      {/* Courses by Year/Semester */}
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "clamp(24px,5vw,48px) 24px" }}>
        {Object.entries(grouped).map(([year, semesters]) => (
          <div key={year} style={{ marginBottom: "40px" }}>
            <h2 style={{ color: "#00214D", fontSize: "20px", fontWeight: "800", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ backgroundColor: levelColour, color: "white", fontSize: "12px", padding: "4px 12px", borderRadius: "99px" }}>{year}</span>
            </h2>

            {Object.entries(semesters).map(([sem, semCourses]) => (
              <div key={sem} style={{ marginBottom: "24px" }}>
                <h3 style={{ color: "#6b7280", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
                  {sem}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
                  {semCourses.map((course: any) => {
                    const noteCount = noteCounts[course.id] ?? 0;
                    const hasNotes = noteCount > 0;

                    return (
                      <div key={course.id}>
                        {hasNotes ? (
                          <Link href={`/e-learning/programmes/${programme.code}/${course.id}`}
                            style={{ textDecoration: "none", display: "block" }}>
                            <div style={{ backgroundColor: "white", borderRadius: "10px", padding: "18px", border: "1px solid #e5e7eb", borderLeft: `3px solid ${levelColour}`, cursor: "pointer" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                                <span style={{ color: levelColour, fontSize: "11px", fontWeight: "700" }}>{course.code}</span>
                                <span style={{ color: "#9ca3af", fontSize: "11px" }}>{course.credit_units} units</span>
                              </div>
                              <h4 style={{ color: "#00214D", fontSize: "14px", fontWeight: "700", margin: "0 0 6px", lineHeight: "1.4" }}>{course.title}</h4>
                              <p style={{ color: "#6b7280", fontSize: "12px", margin: "0 0 12px", lineHeight: "1.5" }}>{course.description}</p>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ backgroundColor: "#f0fdf4", color: "#166534", fontSize: "11px", fontWeight: "600", padding: "3px 8px", borderRadius: "6px" }}>
                                  {noteCount} topic{noteCount !== 1 ? "s" : ""} available
                                </span>
                                <span style={{ color: levelColour, fontSize: "12px", fontWeight: "600" }}>Read →</span>
                              </div>
                            </div>
                          </Link>
                        ) : (
                          <div style={{ backgroundColor: "white", borderRadius: "10px", padding: "18px", border: "1px solid #e5e7eb", borderLeft: "3px solid #e5e7eb", opacity: 0.7 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                              <span style={{ color: "#9ca3af", fontSize: "11px", fontWeight: "700" }}>{course.code}</span>
                              <span style={{ color: "#9ca3af", fontSize: "11px" }}>{course.credit_units} units</span>
                            </div>
                            <h4 style={{ color: "#6b7280", fontSize: "14px", fontWeight: "700", margin: "0 0 6px" }}>{course.title}</h4>
                            <span style={{ backgroundColor: "#f9fafb", color: "#9ca3af", fontSize: "11px", fontWeight: "600", padding: "3px 8px", borderRadius: "6px" }}>
                              Notes coming soon
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
