import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function shuffleArray<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  // seeded Fisher-Yates using simple LCG
  let s = seed;
  const rand = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const userEmail = session.user.email ?? "";
  const { assessmentId } = await req.json();

  const { data: student } = await supabase.from("students").select("id, full_name, reg_number").eq("email", userEmail).single();
  if (!student) return NextResponse.json({ error: "Not a student" }, { status: 403 });

  // Check assessment is open
  const { data: assessment } = await supabase.from("assessments").select("*").eq("id", assessmentId).single();
  if (!assessment) return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  if (assessment.status !== "open") return NextResponse.json({ error: "Assessment is not open" }, { status: 400 });

  const now = new Date();
  if (assessment.open_at && new Date(assessment.open_at) > now) return NextResponse.json({ error: "Assessment has not started yet" }, { status: 400 });
  if (assessment.close_at && new Date(assessment.close_at) < now) return NextResponse.json({ error: "Assessment has closed" }, { status: 400 });

  // Check for existing attempt
  const { data: existing } = await supabase
    .from("assessment_attempts")
    .select("id, status")
    .eq("assessment_id", assessmentId)
    .eq("student_id", student.id)
    .single();

  if (existing) {
    if (existing.status !== "in_progress") return NextResponse.json({ error: "You have already submitted this assessment" }, { status: 400 });
    // Resume existing attempt
    return NextResponse.json({ attemptId: existing.id, resumed: true });
  }

  // Fetch approved questions
  const { data: questions } = await supabase
    .from("assessment_questions")
    .select("id, question_type, options")
    .eq("assessment_id", assessmentId)
    .eq("approved", true);

  if (!questions || questions.length === 0) {
    return NextResponse.json({ error: "No approved questions in this assessment" }, { status: 400 });
  }

  // Generate unique seeds for this student (using student_id hash)
  const studentSeed = student.id.split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
  const timeSeed = Date.now() % 999983; // prime modulus
  const seed = studentSeed ^ timeSeed;

  // Shuffle question order
  const questionOrder = shuffleArray(questions.map((q: any) => q.id), seed);

  // Per-question option shuffle seeds
  const optionSeeds: Record<string, number> = {};
  questions.forEach((q: any, i: number) => {
    optionSeeds[q.id] = (seed + i * 7919) % 2147483647;
  });

  // Create attempt
  const { data: attempt, error } = await supabase
    .from("assessment_attempts")
    .insert({
      assessment_id: assessmentId,
      student_id: student.id,
      question_order: questionOrder,
      option_seeds: optionSeeds,
      answers: {},
      status: "in_progress",
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ attemptId: attempt.id, resumed: false });
}
