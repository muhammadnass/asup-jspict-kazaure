import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function ToggleButton({ memberId, isApproved }: { memberId: string; isApproved: boolean }) {
  async function toggle() {
    "use server";
    const supabase = createClient();
    await supabase.from("members").update({ is_approved: !isApproved }).eq("id", memberId);
    revalidatePath("/admin/lecturers");
  }
  return (
    <form action={toggle}>
      <button type="submit"
        style={{ padding: "5px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer", border: "none",
          backgroundColor: isApproved ? "#fee2e2" : "#dbeafe",
          color: isApproved ? "#dc2626" : "#1d4ed8" }}>
        {isApproved ? "Revoke" : "Approve"}
      </button>
    </form>
  );
}

export default async function AdminLecturersPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/admin/login");

  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", session.user.id).single();
  if (!admin) redirect("/admin/login");

  // Fetch all members that have a user_id (i.e. registered via lecturer portal)
  const { data: lecturers } = await supabase
    .from("members")
    .select("*")
    .not("user_id", "is", null)
    .order("created_at", { ascending: false });

  const pending  = (lecturers ?? []).filter(l => !l.is_approved);
  const approved = (lecturers ?? []).filter(l => l.is_approved);

  const LecturerTable = ({ list, emptyMsg }: { list: any[]; emptyMsg: string }) => (
    <div style={{ overflowX: "auto" }}>
      {list.length === 0 ? (
        <p style={{ color: "#9ca3af", fontSize: "13px", padding: "20px", textAlign: "center" }}>{emptyMsg}</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f9fafb" }}>
              {["Name", "Email", "Department", "Rank", "Staff ID", "Registered", "Action"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#6b7280", fontWeight: "600", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((l: any) => (
              <tr key={l.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px 14px", fontWeight: "600", color: "#00214D", whiteSpace: "nowrap" }}>{l.full_name}</td>
                <td style={{ padding: "12px 14px", color: "#6b7280", fontSize: "12px" }}>{l.email}</td>
                <td style={{ padding: "12px 14px", color: "#374151" }}>{l.department ?? "—"}</td>
                <td style={{ padding: "12px 14px", color: "#374151", whiteSpace: "nowrap" }}>{l.role ?? "—"}</td>
                <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#6b7280", fontSize: "12px" }}>{l.staff_id ?? "—"}</td>
                <td style={{ padding: "12px 14px", color: "#9ca3af", fontSize: "12px", whiteSpace: "nowrap" }}>
                  {l.created_at ? new Date(l.created_at).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                </td>
                <td style={{ padding: "12px 14px" }}>
                  <ToggleButton memberId={l.id} isApproved={l.is_approved} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ color: "#00214D", fontSize: "22px", fontWeight: "800" }}>Lecturer Accounts</h1>
          <p style={{ color: "#6b7280", fontSize: "13px" }}>Approve or revoke lecturer e-learning access</p>
        </div>
        <a href="/admin/dashboard" style={{ color: "#6b7280", fontSize: "13px", textDecoration: "none" }}>← Back to Dashboard</a>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Lecturers", value: (lecturers ?? []).length, color: "#00214D" },
          { label: "Pending Approval", value: pending.length, color: "#d97706" },
          { label: "Approved", value: approved.length, color: "#166534" },
        ].map(stat => (
          <div key={stat.label} style={{ backgroundColor: "white", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "18px 20px" }}>
            <div style={{ fontSize: "26px", fontWeight: "800", color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Pending */}
      <div style={{ backgroundColor: "white", borderRadius: "12px", border: "2px solid #fde68a", marginBottom: "24px" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #fde68a", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>⏳</span>
          <h2 style={{ color: "#92400e", fontSize: "15px", fontWeight: "700" }}>Pending Approval ({pending.length})</h2>
        </div>
        <LecturerTable list={pending} emptyMsg="No pending registrations." />
      </div>

      {/* Approved */}
      <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>✅</span>
          <h2 style={{ color: "#00214D", fontSize: "15px", fontWeight: "700" }}>Approved Lecturers ({approved.length})</h2>
        </div>
        <LecturerTable list={approved} emptyMsg="No approved lecturers yet." />
      </div>
    </div>
  );
}
