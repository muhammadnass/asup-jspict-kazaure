import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const noteId = searchParams.get("noteId");
  const courseId = searchParams.get("courseId");
  const code = searchParams.get("code");

  if (!noteId || !courseId) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const userEmail = session.user.email ?? "";
  const userId = session.user.id;

  const [
    { data: note },
    { data: course },
    { data: quizzes },
  ] = await Promise.all([
    supabase.from("lecture_notes").select("*").eq("id", noteId).single(),
    supabase.from("ln_courses").select("*").eq("id", courseId).single(),
    supabase.from("quizzes").select("*").eq("note_id", noteId).order("created_at"),
  ]);

  if (!note || !course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: programme } = await supabase.from("programmes").select("*").eq("id", course.programme_id).single();

  // Adjacent notes
  const { data: allNotes } = await supabase
    .from("lecture_notes")
    .select("id,topic_number,title")
    .eq("course_id", courseId)
    .order("topic_number");

  const idx = (allNotes ?? []).findIndex((n: any) => n.id === noteId);
  const prevNote = idx > 0 ? allNotes![idx - 1] : null;
  const nextNote = idx < (allNotes ?? []).length - 1 ? allNotes![idx + 1] : null;

  // Student check
  const { data: student } = await supabase.from("students").select("id").eq("email", userEmail).single();
  const studentId = student?.id ?? null;

  let completed = false;
  if (studentId) {
    const { data: progress } = await supabase
      .from("student_progress")
      .select("completed")
      .eq("student_id", studentId)
      .eq("note_id", noteId)
      .single();
    completed = progress?.completed ?? false;
  }

  return NextResponse.json({
    note,
    course,
    programme,
    prevNote,
    nextNote,
    quizzes: (quizzes ?? []).map((q: any) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
    })),
    studentId,
    completed,
  });
}
