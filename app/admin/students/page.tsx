import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function ToggleButton({ studentId, approved }: { studentId: string; approved: boolean }) {
  async function toggle() {
    "use server";
    const supabase = createClient();
    await supabase.from("students").update({ approved: !approved }).eq("id", studentId);
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

export default async function AdminStudentsPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/admin/login");

  const { data: admin } = await supabase.from("admins").select("id").eq("email", session.user.email).single();
  if (!admin) redirect("/admin/login");

  const { data: students } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });

  const pending = (students ?? []).filter(s => !s.approved);
  const approved = (students ?? []).filter(s => s.approved);

  const StudentTable = ({ list, emptyMsg }: { list: any[]; emptyMsg: string }) => (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f9fafb" }}>
            {["Name", "Email", "Department", "Level", "Reg. No.", "Action"].map(h => (
              <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#6b7280", fontWeight: "600", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list.map((s: any) => (
            <tr key={s.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
              <td style={{ padding: "12px 14px", fontWeight: "600", color: "#00214D" }}>{s.full_name}</td>
              <td style={{ padding: "12px 14px", color: "#6b7280" }}>{s.email}</td>
              <td style={{ padding: "12px 14px", color: "#374151" }}>{s.department}</td>
              <td style={{ padding: "12px 14px", color: "#374151" }}>{s.level}</td>
              <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#6b7280", fontSize: "12px" }}>{s.matric_no ?? "—"}</td>
              <td style={{ padding: "12px 14px" }}>
                <ToggleButton studentId={s.id} approved={s.approved} />
              </td>
            </tr>
          ))}
          {list.length === 0 && (
            <tr><td colSpan={6} style={{ padding: "24px", textAlign: "center", color: "#9ca3af" }}>{emptyMsg}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ color: "#00214D", fontSize: "22px", fontWeight: "800" }}>Student Accounts</h1>
          <p style={{ color: "#6b7280", fontSize: "13px" }}>Approve or revoke student e-learning access</p>
        </div>
        <a href="/admin/dashboard" style={{ color: "#6b7280", fontSize: "13px", textDecoration: "none" }}>← Back to Dashboard</a>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Students", value: students?.length ?? 0, color: "#00214D" },
          { label: "Pending Approval", value: pending.length, color: "#d97706" },
          { label: "Approved", value: approved.length, color: "#166534" },
        ].map(stat => (
          <div key={stat.label} style={{ backgroundColor: "white", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "18px 20px" }}>
            <div style={{ fontSize: "26px", fontWeight: "800", color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "12px", border: "2px solid #fde68a", marginBottom: "24px" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #fde68a", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>⏳</span>
          <h2 style={{ color: "#92400e", fontSize: "15px", fontWeight: "700" }}>Pending Approval ({pending.length})</h2>
        </div>
        <StudentTable list={pending} emptyMsg="No pending students." />
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>✅</span>
          <h2 style={{ color: "#00214D", fontSize: "15px", fontWeight: "700" }}>Approved Students ({approved.length})</h2>
        </div>
        <StudentTable list={approved} emptyMsg="No approved students yet." />
      </div>
    </div>
  );
}
