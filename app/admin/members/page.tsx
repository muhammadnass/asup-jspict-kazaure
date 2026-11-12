"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminMembersPage() {
  const supabase = createClient();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [actionMsg, setActionMsg] = useState("");
  const [actionType, setActionType] = useState<"success" | "error">("success");
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchMembers = async () => {
    const { data } = await supabase.from("members").select("*").order("created_at", { ascending: false });
    setMembers(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, []);

  const showMsg = (msg: string, type: "success" | "error" = "success") => {
    setActionMsg(msg);
    setActionType(type);
    setTimeout(() => setActionMsg(""), 5000);
  };

  const approve = async (id: string, name: string, whatsapp: string | null) => {
    setApprovingId(id);
    const { error } = await supabase.from("members").update({ is_approved: true }).eq("id", id);
    if (error) { showMsg("Error: " + error.message, "error"); setApprovingId(null); return; }
    fetchMembers();
    setApprovingId(null);
    if (whatsapp) {
      const digits = whatsapp.replace(/[^0-9]/g, "");
      const intl = digits.startsWith("0") ? "234" + digits.slice(1) : digits;
      const msg = encodeURIComponent(
        `Assalamu Alaikum ${name},\n\nYour ASUP JSPICT Kazaure Chapter profile has been approved! ✅\n\nYou can now log in at:\nhttps://www.asupjspict.org.ng/members/login\n\nWelcome to the platform.\n\n— ASUP JSPICT Admin`
      );
      window.open(`https://wa.me/${intl}?text=${msg}`, "_blank");
      showMsg(`✅ ${name} approved! WhatsApp message opened.`);
    } else {
      showMsg(`✅ ${name} approved! (No WhatsApp number on file)`);
    }
  };

  const revoke = async (id: string) => {
    const { error } = await supabase.from("members").update({ is_approved: false }).eq("id", id);
    if (!error) { showMsg("Approval revoked."); fetchMembers(); }
    else showMsg("Error: " + error.message, "error");
  };

  const deleteMember = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (!error) { showMsg("Member deleted."); fetchMembers(); }
    else showMsg("Error: " + error.message, "error");
  };

  const clearAll = async () => {
    if (!confirm("⚠️ This will DELETE ALL MEMBERS. Are you sure?")) return;
    if (!confirm("Second confirmation: really delete ALL members and reset the database?")) return;
    const { error } = await supabase.from("members").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (!error) { showMsg("✅ All members cleared. Ready for live launch."); fetchMembers(); }
    else showMsg("Error: " + error.message, "error");
  };

  const filtered = members.filter(m => {
    if (filter === "pending") return !m.is_approved;
    if (filter === "approved") return m.is_approved;
    return true;
  });

  const pendingCount = members.filter(m => !m.is_approved).length;
  const approvedCount = members.filter(m => m.is_approved).length;

  return (
    <div style={{ padding: "0" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ color: "#00214D", fontSize: "clamp(18px, 5vw, 24px)", fontWeight: "800", margin: "0 0 4px" }}>Members</h1>
          {pendingCount > 0 && (
            <p style={{ color: "#c2410c", fontSize: "13px", margin: 0, fontWeight: "600" }}>
              ⏳ {pendingCount} awaiting approval
            </p>
          )}
        </div>
        <button onClick={clearAll}
          style={{ backgroundColor: "#dc2626", color: "white", padding: "10px 16px", borderRadius: "8px", border: "none", fontWeight: "700", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap" }}>
          🗑 Reset All
        </button>
      </div>

      {actionMsg && (
        <div style={{
          backgroundColor: actionType === "success" ? "#f0fdf4" : "#fef2f2",
          border: `1px solid ${actionType === "success" ? "#86efac" : "#fecaca"}`,
          color: actionType === "success" ? "#166534" : "#dc2626",
          padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", fontWeight: "600"
        }}>
          {actionMsg}
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", overflowX: "auto", paddingBottom: "4px" }}>
        {([
          { key: "pending", label: `Pending (${pendingCount})` },
          { key: "approved", label: `Approved (${approvedCount})` },
          { key: "all", label: `All (${members.length})` },
        ] as const).map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            style={{
              padding: "8px 18px", borderRadius: "20px", border: "none", cursor: "pointer",
              fontWeight: "600", fontSize: "13px", whiteSpace: "nowrap",
              backgroundColor: filter === f.key ? "#00214D" : "#e5e7eb",
              color: filter === f.key ? "white" : "#374151",
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "#9ca3af", textAlign: "center", padding: "32px" }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "40px", textAlign: "center", color: "#9ca3af" }}>
          No members in this category.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map(m => (
            <details key={m.id} style={{
              backgroundColor: "white", borderRadius: "12px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              border: `1px solid ${m.is_approved ? "#d1fae5" : "#fed7aa"}`
            }}>
              <summary style={{ cursor: "pointer", padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px", listStyle: "none" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", backgroundColor: "#e5e7eb", flexShrink: 0 }}>
                  {m.photo_url
                    ? <img src={m.photo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold", color: "#00214D" }}>
                        {m.full_name?.charAt(0)}
                      </div>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: "700", color: "#00214D", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.title ? `${m.title} ` : ""}{m.full_name}
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.role}{m.department ? ` · ${m.department}` : ""}
                  </p>
                </div>
                <span style={{
                  padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", flexShrink: 0,
                  backgroundColor: m.is_approved ? "#d1fae5" : "#fff7ed",
                  color: m.is_approved ? "#166534" : "#9a3412",
                }}>
                  {m.is_approved ? "✓" : "⏳"}
                </span>
              </summary>
              <div style={{ padding: "0 16px 16px", borderTop: "1px solid #f0f0f0" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "10px", margin: "14px 0" }}>
                  {[
                    ["Email", m.email],
                    ["Phone", m.phone],
                    ["WhatsApp", m.whatsapp],
                    ["Department", m.department],
                    ["Registered", new Date(m.created_at).toLocaleDateString("en-NG")],
                  ].filter(([, val]) => val).map(([label, val]) => (
                    <div key={label as string}>
                      <p style={{ margin: 0, fontSize: "10px", color: "#9ca3af", fontWeight: "700", textTransform: "uppercase" }}>{label}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#374151", wordBreak: "break-all" }}>{val as string}</p>
                    </div>
                  ))}
                </div>
                {m.bio && (
                  <p style={{ fontSize: "13px", color: "#555", lineHeight: "1.6", margin: "0 0 12px", padding: "10px", backgroundColor: "#f8fafc", borderRadius: "6px" }}>
                    {m.bio}
                  </p>
                )}
                {m.cv_url && (
                  <a href={m.cv_url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: "13px", color: "#2E8B57", fontWeight: "600", display: "inline-block", marginBottom: "14px" }}>
                    📄 View CV
                  </a>
                )}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {!m.is_approved ? (
                    <button onClick={() => approve(m.id, m.full_name, m.whatsapp)} disabled={approvingId === m.id}
                      style={{ backgroundColor: "#2E8B57", color: "white", padding: "10px 20px", borderRadius: "8px", border: "none", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
                      {approvingId === m.id ? "Approving…" : "✓ Approve & Notify"}
                    </button>
                  ) : (
                    <>
                      <button onClick={() => revoke(m.id)}
                        style={{ backgroundColor: "#f59e0b", color: "white", padding: "10px 16px", borderRadius: "8px", border: "none", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
                        Revoke
                      </button>
                      {m.whatsapp && (() => {
                        const digits = m.whatsapp.replace(/[^0-9]/g, "");
                        const intl = digits.startsWith("0") ? "234" + digits.slice(1) : digits;
                        const msg = encodeURIComponent(`Assalamu Alaikum ${m.full_name},\n\nYour ASUP JSPICT profile is active. Log in at:\nhttps://www.asupjspict.org.ng/members/login\n\n— ASUP JSPICT Admin`);
                        return (
                          <a href={`https://wa.me/${intl}?text=${msg}`} target="_blank" rel="noopener noreferrer"
                            style={{ backgroundColor: "#25D366", color: "white", padding: "10px 16px", borderRadius: "8px", textDecoration: "none", fontWeight: "700", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            💬 WhatsApp
                          </a>
                        );
                      })()}
                    </>
                  )}
                  <button onClick={() => deleteMember(m.id, m.full_name)}
                    style={{ backgroundColor: "#fef2f2", color: "#dc2626", padding: "10px 16px", borderRadius: "8px", border: "1px solid #fecaca", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
                    Delete
                  </button>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
