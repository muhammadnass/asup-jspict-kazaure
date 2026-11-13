import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { assessmentId, questions } = await req.json();

  // Verify lecturer owns this assessment
  const { data: member } = await supabase.from("members").select("id").eq("email", session.user.email).single();
  if (!member) return NextResponse.json({ error: "Not a lecturer" }, { status: 403 });

  const { data: assessment } = await supabase.from("assessments").select("lecturer_id").eq("id", assessmentId).single();
  if (!assessment || assessment.lecturer_id !== member.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Delete existing questions and re-insert
  await supabase.from("assessment_questions").delete().eq("assessment_id", assessmentId);

  const rows = questions.map((q: any, i: number) => ({
    assessment_id: assessmentId,
    question_number: i + 1,
    question_text: q.question_text,
    question_type: q.question_type,
    options: q.options,
    correct_answer: q.correct_answer,
    marks: q.marks ?? 1,
    source: q.source ?? "manual",
    approved: q.approved ?? false,
  }));

  const { error } = await supabase.from("assessment_questions").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Also save approved ones to question_bank for reuse
  const approvedRows = rows.filter((q: any) => q.approved);
  if (approvedRows.length > 0) {
    const { data: a } = await supabase.from("assessments").select("course_code, course_title, lecturer_id").eq("id", assessmentId).single();
    if (a) {
      const bankRows = approvedRows.map((q: any) => ({
        course_code: a.course_code,
        course_title: a.course_title,
        lecturer_id: a.lecturer_id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options,
        correct_answer: q.correct_answer,
        marks: q.marks,
        source: q.source,
      }));
      // Insert to bank (ignore duplicates gracefully)
      await supabase.from("question_bank").insert(bankRows);
    }
  }

  return NextResponse.json({ saved: rows.length });
}
