import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const courseCode = searchParams.get("course");
  const programmeCode = searchParams.get("programme");

  let query = supabase
    .from("lecture_notes")
    .select("id, title, topic_number, ln_courses(course_code, course_title)")
    .order("topic_number");

  if (courseCode) {
    // Get the course id first
    const { data: course } = await supabase
      .from("ln_courses")
      .select("id")
      .eq("course_code", courseCode)
      .single();
    if (course) query = query.eq("course_id", course.id);
  } else if (programmeCode) {
    const { data: courses } = await supabase
      .from("ln_courses")
      .select("id")
      .eq("programme_code", programmeCode);
    if (courses && courses.length > 0) {
      query = query.in("course_id", courses.map((c: any) => c.id));
    }
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
