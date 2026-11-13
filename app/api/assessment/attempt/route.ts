import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function shuffleArray<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  const rand = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const attemptId = searchParams.get("attemptId");
  if (!attemptId) return NextResponse.json({ error: "Missing attemptId" }, { status: 400 });

  const { data: student } = await supabase.from("students").select("id").eq("email", session.user.email).single();
  if (!student) return NextResponse.json({ error: "Not a student" }, { status: 403 });

  const { data: attempt } = await supabase
    .from("assessment_attempts")
    .select("*, assessments(*)")
    .eq("id", attemptId)
    .eq("student_id", student.id)
    .single();

  if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  if (attempt.status !== "in_progress") return NextResponse.json({ error: "Assessment already submitted" }, { status: 400 });

  const assessment = attempt.assessments as any;

  // Fetch approved questions
  const { data: questions } = await supabase
    .from("assessment_questions")
    .select("id, question_text, question_type, options")
    .eq("assessment_id", assessment.id)
    .eq("approved", true);

  if (!questions || questions.length === 0) {
    return NextResponse.json({ error: "No questions available" }, { status: 400 });
  }

  // Apply stored question order
  const questionOrder: string[] = attempt.question_order ?? [];
  const optionSeeds: Record<string, number> = attempt.option_seeds ?? {};

  // Sort questions by stored order
  const questionMap: Record<string, any> = {};
  questions.forEach((q: any) => { questionMap[q.id] = q; });

  const orderedQuestions = questionOrder
    .map((id: string) => questionMap[id])
    .filter(Boolean);

  // Apply option shuffling per question
  const finalQuestions = orderedQuestions.map((q: any) => {
    if (q.question_type === "mcq" && optionSeeds[q.id] !== undefined) {
      const shuffled = shuffleArray([...q.options], optionSeeds[q.id]);
      return { ...q, options: shuffled };
    }
    return q;
  });

  return NextResponse.json({
    questions: finalQuestions,
    durationMins: assessment.duration_mins,
    title: assessment.title,
    courseCode: assessment.course_code,
    instructions: assessment.instructions,
    startedAt: attempt.started_at,
    existingAnswers: attempt.answers ?? {},
  });
}
