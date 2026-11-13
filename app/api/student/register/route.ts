import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  const { full_name, email, password, department, level, matric_no } = await req.json();

  if (!full_name || !email || !password || !department || !level) {
    return NextResponse.json({ error: "All required fields must be filled." }, { status: 400 });
  }

  const supabase = createServerClient();
  const admin = createAdminClient();

  // Check if already registered
  const { data: existing } = await supabase.from("students").select("id").eq("email", email).single();
  if (existing) return NextResponse.json({ error: "User already registered" }, { status: 409 });

  // Create auth user server-side — does NOT overwrite the browser session
  const { data, error: signUpErr } = await admin.auth.admin.createUser({
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
    if (data.user?.id) await admin.auth.admin.deleteUser(data.user.id);
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
