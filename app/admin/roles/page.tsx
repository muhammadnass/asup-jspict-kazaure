import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function ApproveButton({ role, userId, approved }: { role: string; userId: string; approved: boolean }) {
  // Server Action
  async function toggle() {
    "use server";
    const supabase = createClient();
    const table = role === "hod" ? "hod_users" : "examiner_users";
    await supabase.from(table).update({ approved: !approved }).eq("id", userId);
  }
  return (
    <form action={toggle}>
      <button type="submit"
        style={{ padding: "5px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer", border: "none",
          backgroundColor: approved ? "#fee2e2" : "#dcfce7", color: approved ? "#dc2626" : "#166534" }}>
        {approved ? "Revoke" : "Approve"}
      </button>
    </form>
  );
}

export default async function AdminRolesPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/admin/login");

  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", session.user.id).single();
  if (!admin) redirect("/admin/login");

  const { data: hods } = await supabase.from("hod_users").select("*").order("created_at", { ascending: false });
  const { data: examiners } = await supabase.from("examiner_users").select("*").order("created_at", { ascending: false });

  const TableSection = ({ title, users, role, icon }: any) => (
    <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e5e7eb", marginBottom: "24px" }}>
      <div style={{ padding: "18px 20px", borderBottom: "1px solid #e5e7eb" }}>
        <h2 style={{ color: "#00214D", fontSize: "16px", fontWeight: "700" }}>{icon} {title} ({users?.length ?? 0})</h2>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f9fafb" }}>
              {["Name", "Email", "Department", "Staff ID", "Status", "Action"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#6b7280", fontWeight: "600", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u: any) => (
              <tr key={u.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px 14px", fontWeight: "600", color: "#00214D" }}>{u.full_name}</td>
                <td style={{ padding: "12px 14px", color: "#6b7280" }}>{u.email}</td>
                <td style={{ padding: "12px 14px", color: "#374151" }}>{u.department}</td>
                <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#6b7280", fontSize: "12px" }}>{u.staff_id}</td>
                <td style={{ padding: "12px 14px" }}>
                  <span style={{ backgroundColor: u.approved ? "#dcfce7" : "#fef3c7", color: u.approved ? "#166534" : "#92400e", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "99px" }}>
                    {u.approved ? "Approved" : "Pending"}
                  </span>
                </td>
                <td style={{ padding: "12px 14px" }}>
                  <ApproveButton role={role} userId={u.id} approved={u.approved} />
                </td>
              </tr>
            ))}
            {(users ?? []).length === 0 && (
              <tr><td colSpan={6} style={{ padding: "24px", textAlign: "center", color: "#9ca3af" }}>No {title.toLowerCase()} registered yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ color: "#00214D", fontSize: "22px", fontWeight: "800" }}>Role Management</h1>
          <p style={{ color: "#6b7280", fontSize: "13px" }}>Approve or revoke HOD and Examiner accounts</p>
        </div>
        <a href="/admin/dashboard" style={{ color: "#6b7280", fontSize: "13px", textDecoration: "none" }}>← Back to Dashboard</a>
      </div>

      <TableSection title="Heads of Department" users={hods} role="hod" icon="🏛️" />
      <TableSection title="Examiners" users={examiners} role="examiner" icon="🔍" />
    </div>
  );
}
