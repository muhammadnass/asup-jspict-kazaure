import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const userEmail = session.user.email ?? "";
  const { noteId, courseId } = await req.json();

  if (!noteId || !courseId) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const { data: student } = await supabase.from("students").select("id").eq("email", userEmail).single();
  if (!student) return NextResponse.json({ error: "Not a student" }, { status: 403 });

  const studentId = student.id;

  // Upsert progress
  await supabase.from("student_progress").upsert({
    student_id: studentId,
    course_id: courseId,
    note_id: noteId,
    completed: true,
    read_at: new Date().toISOString(),
  }, { onConflict: "student_id,note_id" });

  // Award 10 points
  await supabase.from("student_points").insert({
    student_id: studentId,
    points: 10,
    reason: `Completed note ${noteId}`,
  });

  // Update streak
  const today = new Date().toISOString().split("T")[0];
  const { data: streak } = await supabase.from("student_streaks").select("*").eq("student_id", studentId).single();

  if (!streak) {
    await supabase.from("student_streaks").insert({
      student_id: studentId,
      current_streak: 1,
      longest_streak: 1,
      last_activity: today,
    });
  } else {
    const lastActivity = streak.last_activity;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    let newCurrent = streak.current_streak;

    if (lastActivity === today) {
      // Already active today, no change to streak count
    } else if (lastActivity === yesterday) {
      newCurrent = streak.current_streak + 1;
    } else {
      newCurrent = 1; // streak broken
    }

    const newLongest = Math.max(newCurrent, streak.longest_streak);
    await supabase.from("student_streaks")
      .update({ current_streak: newCurrent, longest_streak: newLongest, last_activity: today, updated_at: new Date().toISOString() })
      .eq("student_id", studentId);
  }

  // Check and award badges
  const { count: totalCompleted } = await supabase
    .from("student_progress")
    .select("*", { count: "exact", head: true })
    .eq("student_id", studentId)
    .eq("completed", true);

  const { data: allBadges } = await supabase.from("badges").select("*");
  const { data: earnedBadges } = await supabase.from("student_badges").select("badge_id").eq("student_id", studentId);
  const earnedIds = new Set((earnedBadges ?? []).map((b: any) => b.badge_id));

  const badgesToAward: string[] = [];
  for (const badge of (allBadges ?? [])) {
    if (earnedIds.has(badge.id)) continue;
    let earn = false;
    switch (badge.condition) {
      case "complete_1_note":   earn = (totalCompleted ?? 0) >= 1; break;
      case "complete_5_notes":  earn = (totalCompleted ?? 0) >= 5; break;
      case "complete_10_notes": earn = (totalCompleted ?? 0) >= 10; break;
      case "complete_25_notes": earn = (totalCompleted ?? 0) >= 25; break;
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
