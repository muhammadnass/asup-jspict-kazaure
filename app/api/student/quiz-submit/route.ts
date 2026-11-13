import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const userEmail = session.user.email ?? "";
  const { noteId, attempts } = await req.json() as {
    noteId: string;
    attempts: Array<{ quizId: string; selected: string; correct: boolean }>;
  };

  const { data: student } = await supabase.from("students").select("id").eq("email", userEmail).single();
  if (!student) return NextResponse.json({ ok: true }); // lecturers just skip

  const studentId = student.id;

  // Upsert each attempt
  for (const attempt of attempts) {
    await supabase.from("quiz_attempts").upsert({
      student_id: studentId,
      quiz_id: attempt.quizId,
      selected: attempt.selected,
      correct: attempt.correct,
    }, { onConflict: "student_id,quiz_id" });
  }

  // Award points for correct answers (5 pts each)
  const correctCount = attempts.filter(a => a.correct).length;
  if (correctCount > 0) {
    await supabase.from("student_points").insert({
      student_id: studentId,
      points: correctCount * 5,
      reason: `Got ${correctCount} quiz answer${correctCount !== 1 ? "s" : ""} right in note ${noteId}`,
    });
  }

  // Check quiz badges
  const { count: totalCorrect } = await supabase
    .from("quiz_attempts")
    .select("*", { count: "exact", head: true })
    .eq("student_id", studentId)
    .eq("correct", true);

  const { data: allBadges } = await supabase.from("badges").select("*");
  const { data: earnedBadges } = await supabase.from("student_badges").select("badge_id").eq("student_id", studentId);
  const earnedIds = new Set((earnedBadges ?? []).map((b: any) => b.badge_id));

  const isPerfect = attempts.length > 0 && attempts.every(a => a.correct);

  const badgesToAward: string[] = [];
  for (const badge of (allBadges ?? [])) {
    if (earnedIds.has(badge.id)) continue;
    let earn = false;
    switch (badge.condition) {
      case "quiz_10_correct": earn = (totalCorrect ?? 0) >= 10; break;
      case "quiz_perfect":    earn = isPerfect; break;
    }
    if (earn) badgesToAward.push(badge.id);
  }

  if (badgesToAward.length > 0) {
    await supabase.from("student_badges").insert(
      badgesToAward.map(badgeId => ({ student_id: studentId, badge_id: badgeId }))
    );
  }

  return NextResponse.json({ ok: true, newBadges: badgesToAward });
}
