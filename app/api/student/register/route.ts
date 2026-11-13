import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { full_name, email, password, department, level, matric_no } = await req.json();

  if (!full_name || !email || !password || !department || !level) {
    return NextResponse.json({ error: "All required fields must be filled." }, { status: 400 });
  }

  // Use server-side Supabase — does NOT touch the browser session
  const supabase = createClient();

  // Check if already registered
  const { data: existing } = await supabase.from("students").select("id").eq("email", email).single();
  if (existing) return NextResponse.json({ error: "User already registered" }, { status: 409 });

  // Sign up via admin auth (server-side, no session overwrite)
  const { data, error: signUpErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "student" },
  });

  if (signUpErr) return NextResponse.json({ error: signUpErr.message }, { status: 400 });

  // Insert student profile
  const { error: insertErr } = await supabase.from("students").insert({
    user_id: data.user?.id,
    full_name,
    email,
    department,
    level,
    matric_no: matric_no || null,
    approved: false,
  });

  if (insertErr) {
    // Rollback: delete the auth user we just created
    if (data.user?.id) await supabase.auth.admin.deleteUser(data.user.id);
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
