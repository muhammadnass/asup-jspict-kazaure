import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { assessmentId, status } = await req.json();

  const allowedStatuses = ["draft", "open", "closed"];
  if (!allowedStatuses.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  // Verify ownership
  const { data: member } = await supabase.from("members").select("id").eq("email", session.user.email).single();
  if (!member) return NextResponse.json({ error: "Not a lecturer" }, { status: 403 });

  const { data: assessment } = await supabase.from("assessments").select("lecturer_id").eq("id", assessmentId).single();
  if (!assessment || assessment.lecturer_id !== member.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { error } = await supabase.from("assessments").update({ status }).eq("id", assessmentId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, status });
}
