import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { data: member } = await supabase.from("members").select("id").eq("email", session.user.email).single();
  if (!member) return NextResponse.json({ error: "Not a lecturer" }, { status: 403 });

  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("lecturer_id", member.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
