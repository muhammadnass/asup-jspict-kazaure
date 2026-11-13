import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { data: member } = await supabase.from("members").select("id, department").eq("email", session.user.email).single();
  if (!member) return NextResponse.json({ error: "Not a lecturer" }, { status: 403 });

  const body = await req.json();
  const {
    course_code, course_title, department, type, title, instructions,
    duration_mins, total_marks, academic_year, semester, weight_pct,
    open_at, close_at,
  } = body;

  const { data, error } = await supabase
    .from("assessments")
    .insert({
      lecturer_id: member.id,
      course_code,
      course_title,
      department: department || member.department,
      type,
      title,
      instructions,
      duration_mins: duration_mins ?? 30,
      total_marks: total_marks ?? 20,
      weight_pct,
      academic_year,
      semester,
      status: "draft",
      open_at: open_at || null,
      close_at: close_at || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
