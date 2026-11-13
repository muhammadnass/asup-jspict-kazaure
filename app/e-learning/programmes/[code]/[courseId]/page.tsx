import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: { code: string; courseId: string } }) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/e-learning");

  const userId = session.user.id;
  const userEmail = session.user.email ?? "";

  const { data: member } = await supabase.from("members").select("id,full_name,is_approved").eq("user_id", userId).single();
  const { data: student } = await supabase.from("students").select("id,full_name,is_approved").eq("email", userEmail).single();

  if (!member?.is_approved && !student?.is_approved) redirect("/e-learning");

  const { data: course } = await supabase.from("ln_courses").select("*").eq("id", params.courseId).single();
  if (!course) notFound();

  const { data: programme } = await supabase.from("programmes").select("*").eq("id", course.programme_id).single();
  if (!programme) notFound();

  const { data: notes } = await supabase
    .from("lecture_notes")
    .select("id,topic_number,title")
    .eq("course_id", course.id)
    .order("topic_number");

  // Get student progress
  let completedSet: Set<string> = new Set();
  if (student?.id) {
    const { data: progress } = await supabase
      .from("student_progress")
      .select("note_id")
      .eq("student_id", student.id)
      .eq("completed", true);
    (progress ?? []).forEach((p: any) => completedSet.add(p.note_id));
  }

  const noteList = notes ?? [];
  const completedCount = noteList.filter((n: any) => completedSet.has(n.id)).length;
  const progressPct = noteList.length > 0 ? Math.round((completedCount / noteList.length) * 100) : 0;
  const levelColour = programme.level === "ND" ? "#2E8B57" : "#00214D";

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${levelColour}, #003d99)`, padding: "clamp(28px,5vw,52px) 24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <Link href={`/e-learning/programmes/${programme.code}`} style={{ color: "#FFB81C", fontSize: "12px", fontWeight: "600", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "16px" }}>
            ← {programme.title}
          </Link>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <span style={{ color: "#FFB81C", fontSize: "12px", fontWeight: "700" }}>{course.code} · Year {course.year}, Semester {course.semester}</span>
              <h1 style={{ color: "white", fontSize: "clamp(18px,4vw,28px)", fontWeight: "800", margin: "8px 0 8px" }}>
                {course.title}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", margin: 0 }}>{course.description}</p>
            </div>
            <div style={{ backgroundColor: "rgba(255,255,255,0.12)", borderRadius: "12px", padding: "14px 20px", textAlign: "center", minWidth: "120px" }}>
              <div style={{ color: "#FFB81C", fontSize: "24px", fontWeight: "900" }}>{progressPct}%</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px" }}>{completedCount}/{noteList.length} topics done</div>
            </div>
          </div>

          {/* Progress bar */}
          {student?.is_approved && (
            <div style={{ marginTop: "20px" }}>
              <div style={{ height: "6px", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progressPct}%`, backgroundColor: "#FFB81C", borderRadius: "3px", transition: "width 0.5s" }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes list */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "clamp(24px,5vw,48px) 24px" }}>
        {noteList.length === 0 ? (
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "60px 24px", textAlign: "center" }}>
            <p style={{ fontSize: "48px", marginBottom: "12px" }}>📝</p>
            <h2 style={{ color: "#00214D", fontSize: "18px", fontWeight: "700" }}>Lecture notes coming soon!</h2>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>The notes for this course are being prepared. Check back soon.</p>
          </div>
        ) : (
          <div>
            <h2 style={{ color: "#00214D", fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>
              📖 {noteList.length} Topics
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {noteList.map((note: any, idx: number) => {
                const done = completedSet.has(note.id);
                return (
                  <Link key={note.id}
                    href={`/e-learning/programmes/${programme.code}/${course.id}/${note.id}`}
                    style={{ textDecoration: "none" }}>
                    <div style={{ backgroundColor: "white", borderRadius: "10px", padding: "18px 20px", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "16px", borderLeft: done ? `3px solid ${levelColour}` : "3px solid #e5e7eb" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: done ? levelColour : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {done
                          ? <span style={{ color: "white", fontSize: "16px" }}>✓</span>
                          : <span style={{ color: "#6b7280", fontSize: "14px", fontWeight: "700" }}>{idx + 1}</span>
                        }
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: "#9ca3af", fontSize: "11px", fontWeight: "600", margin: "0 0 2px" }}>Topic {note.topic_number}</p>
                        <h3 style={{ color: "#00214D", fontSize: "14px", fontWeight: "700", margin: 0 }}>{note.title}</h3>
                      </div>
                      <span style={{ color: done ? levelColour : "#9ca3af", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap" }}>
                        {done ? "✓ Done" : "Read →"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
