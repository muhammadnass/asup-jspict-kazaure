import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StudentDashboard() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/student/login");

  const userEmail = session.user.email ?? "";
  const { data: student } = await supabase.from("students").select("*").eq("email", userEmail).single();
  if (!student?.approved) redirect("/e-learning");

  const studentId = student.id;

  // ── Fetch all gamification data in parallel ──
  const [
    { data: progressRows },
    { data: pointsRows },
    { data: streak },
    { data: earnedBadges },
    { data: allBadges },
    { data: leaderboardRaw },
  ] = await Promise.all([
    supabase.from("student_progress").select("course_id,note_id,completed,read_at").eq("student_id", studentId),
    supabase.from("student_points").select("points,reason,created_at").eq("student_id", studentId).order("created_at", { ascending: false }),
    supabase.from("student_streaks").select("*").eq("student_id", studentId).single(),
    supabase.from("student_badges").select("badge_id,earned_at").eq("student_id", studentId),
    supabase.from("badges").select("*"),
    supabase.from("student_points").select("student_id, points"),
  ]);

  const totalPoints = (pointsRows ?? []).reduce((s: number, r: any) => s + r.points, 0);
  const completedNotes = (progressRows ?? []).filter((p: any) => p.completed).length;
  const earnedBadgeIds = new Set((earnedBadges ?? []).map((b: any) => b.badge_id));

  // Build leaderboard (aggregate by student_id)
  const lb: Record<string, number> = {};
  (leaderboardRaw ?? []).forEach((r: any) => {
    lb[r.student_id] = (lb[r.student_id] ?? 0) + r.points;
  });
  const sorted = Object.entries(lb).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const myRank = sorted.findIndex(([sid]) => sid === studentId) + 1;

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #00214D, #003d99)", padding: "clamp(28px,5vw,52px) 24px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <p style={{ color: "#FFB81C", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>
                Student Dashboard
              </p>
              <h1 style={{ color: "white", fontSize: "clamp(20px,5vw,30px)", fontWeight: "800", margin: "0 0 4px" }}>
                Welcome back, {student.full_name.split(" ")[0]}! 👋
              </h1>
              <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0 }}>
                {student.department} · {student.matric_no ?? ""}
              </p>
            </div>
            <Link href="/e-learning/programmes" style={{ backgroundColor: "#FFB81C", color: "#00214D", padding: "12px 20px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", textDecoration: "none" }}>
              📚 Continue Learning
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "clamp(20px,5vw,40px) 24px" }}>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px", marginBottom: "32px" }}>
          {[
            { label: "Total Points", value: totalPoints.toLocaleString(), icon: "⭐", colour: "#FFB81C", bg: "#fffbeb" },
            { label: "Topics Completed", value: completedNotes, icon: "✅", colour: "#2E8B57", bg: "#f0fdf4" },
            { label: "Current Streak", value: `${streak?.current_streak ?? 0} days`, icon: "🔥", colour: "#ef4444", bg: "#fef2f2" },
            { label: "Leaderboard Rank", value: myRank > 0 ? `#${myRank}` : "—", icon: "🏆", colour: "#00214D", bg: "#eff6ff" },
          ].map(stat => (
            <div key={stat.label} style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px", border: "1px solid #e5e7eb", textAlign: "center" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>{stat.icon}</div>
              <div style={{ color: stat.colour, fontSize: "26px", fontWeight: "900" }}>{stat.value}</div>
              <div style={{ color: "#6b7280", fontSize: "12px", fontWeight: "600", marginTop: "2px" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Streak info */}
        {(streak?.current_streak ?? 0) > 0 && (
          <div style={{ backgroundColor: "#fef3c7", border: "1px solid #fcd34d", borderRadius: "12px", padding: "16px 20px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "28px" }}>🔥</span>
            <div>
              <p style={{ color: "#92400e", fontSize: "15px", fontWeight: "700", margin: "0 0 2px" }}>
                You&apos;re on a {streak?.current_streak}-day streak!
              </p>
              <p style={{ color: "#b45309", fontSize: "13px", margin: 0 }}>
                Your longest streak is {streak?.longest_streak} day{streak?.longest_streak !== 1 ? "s" : ""}. Keep it up — study at least once today to extend it!
              </p>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

          {/* Badges */}
          <div style={{ backgroundColor: "white", borderRadius: "14px", padding: "24px", border: "1px solid #e5e7eb" }}>
            <h2 style={{ color: "#00214D", fontSize: "16px", fontWeight: "800", marginBottom: "16px" }}>
              🎖️ Your Badges
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "10px" }}>
              {(allBadges ?? []).map((badge: any) => {
                const earned = earnedBadgeIds.has(badge.id);
                return (
                  <div key={badge.id} title={badge.description}
                    style={{ textAlign: "center", padding: "12px 8px", borderRadius: "10px", backgroundColor: earned ? "#f0fdf4" : "#f9fafb", border: `1px solid ${earned ? "#86efac" : "#e5e7eb"}`, opacity: earned ? 1 : 0.4 }}>
                    <div style={{ fontSize: "24px", marginBottom: "4px" }}>{badge.icon}</div>
                    <div style={{ color: earned ? "#166534" : "#9ca3af", fontSize: "10px", fontWeight: "700", lineHeight: "1.3" }}>
                      {badge.name}
                    </div>
                  </div>
                );
              })}
            </div>
            <p style={{ color: "#9ca3af", fontSize: "12px", marginTop: "12px" }}>
              {earnedBadgeIds.size}/{(allBadges ?? []).length} badges earned
            </p>
          </div>

          {/* Leaderboard */}
          <div style={{ backgroundColor: "white", borderRadius: "14px", padding: "24px", border: "1px solid #e5e7eb" }}>
            <h2 style={{ color: "#00214D", fontSize: "16px", fontWeight: "800", marginBottom: "16px" }}>
              🏆 Top Students
            </h2>
            {sorted.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: "13px" }}>No scores yet. Be the first to earn points!</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {sorted.map(([sid, pts], rank) => {
                  const isMe = sid === studentId;
                  const medal = rank === 0 ? "🥇" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : `${rank + 1}.`;
                  return (
                    <div key={sid} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", backgroundColor: isMe ? "#eff6ff" : "#f9fafb", border: isMe ? "1px solid #bfdbfe" : "1px solid transparent" }}>
                      <span style={{ width: "24px", textAlign: "center", fontWeight: "700", fontSize: "14px" }}>{medal}</span>
                      <span style={{ flex: 1, fontSize: "13px", fontWeight: isMe ? "700" : "500", color: isMe ? "#1d4ed8" : "#374151" }}>
                        {isMe ? `You (${student.full_name.split(" ")[0]})` : `Student #${rank + 1}`}
                      </span>
                      <span style={{ color: "#FFB81C", fontWeight: "800", fontSize: "14px" }}>{pts} pts</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent activity */}
        {(pointsRows ?? []).length > 0 && (
          <div style={{ backgroundColor: "white", borderRadius: "14px", padding: "24px", border: "1px solid #e5e7eb", marginTop: "20px" }}>
            <h2 style={{ color: "#00214D", fontSize: "16px", fontWeight: "800", marginBottom: "16px" }}>
              📋 Recent Activity
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(pointsRows ?? []).slice(0, 8).map((row: any, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "8px", backgroundColor: "#f9fafb" }}>
                  <span style={{ color: "#374151", fontSize: "13px" }}>{row.reason}</span>
                  <span style={{ color: "#2E8B57", fontWeight: "700", fontSize: "13px" }}>+{row.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
