import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getGrade(pct: number): { grade: string; remark: string } {
  if (pct >= 70) return { grade: "A", remark: "Pass" };
  if (pct >= 60) return { grade: "B", remark: "Pass" };
  if (pct >= 50) return { grade: "C", remark: "Pass" };
  if (pct >= 45) return { grade: "D", remark: "Pass" };
  return { grade: "F", remark: "Fail" };
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const userEmail = session.user.email ?? "";
  const { attemptId, answers, tabSwitches } = await req.json() as {
    attemptId: string;
    answers: Record<string, string>; // { questionId: selectedAnswer }
    tabSwitches: number;
  };

  // Verify student owns this attempt
  const { data: student } = await supabase.from("students").select("id").eq("email", userEmail).single();
  if (!student) return NextResponse.json({ error: "Not a student" }, { status: 403 });

  const { data: attempt } = await supabase
    .from("assessment_attempts")
    .select("*, assessments(*)")
    .eq("id", attemptId)
    .eq("student_id", student.id)
    .single();

  if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  if (attempt.status !== "in_progress") return NextResponse.json({ error: "Already submitted" }, { status: 400 });

  // Check time limit
  const assessment = attempt.assessments as any;
  const startedAt = new Date(attempt.started_at).getTime();
  const durationMs = assessment.duration_mins * 60 * 1000;
  const isTimedOut = Date.now() > startedAt + durationMs + 30000; // 30s grace

  // Fetch all questions for this assessment
  const { data: questions } = await supabase
    .from("assessment_questions")
    .select("id, correct_answer, marks")
    .eq("assessment_id", assessment.id)
    .eq("approved", true);

  // Grade
  let score = 0;
  let totalMarks = 0;
  for (const q of (questions ?? [])) {
    totalMarks += q.marks;
    const studentAnswer = answers[q.id];
    if (studentAnswer && studentAnswer === q.correct_answer) {
      score += q.marks;
    }
  }

  const percentage = totalMarks > 0 ? parseFloat(((score / totalMarks) * 100).toFixed(2)) : 0;
  const { grade, remark } = getGrade(percentage);

  // Update attempt
  await supabase.from("assessment_attempts").update({
    answers,
    score,
    total_marks: totalMarks,
    percentage,
    grade,
    submitted_at: new Date().toISOString(),
    tab_switches: tabSwitches ?? 0,
    status: isTimedOut ? "timed_out" : "submitted",
  }).eq("id", attemptId);

  return NextResponse.json({ score, totalMarks, percentage, grade, remark });
}
