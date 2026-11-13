import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  // Verify admin
  const { data: admin } = await supabase.from("admins").select("id").eq("email", session.user.email).single();
  if (!admin) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

  const { role, userId, approved } = await req.json();
  // role: "hod" | "examiner"
  const table = role === "hod" ? "hod_users" : role === "examiner" ? "examiner_users" : null;
  if (!table) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  const { error } = await supabase.from(table).update({ approved }).eq("id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
