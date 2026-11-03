"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminMembersPage() {
  const supabase = createClient();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [actionMsg, setActionMsg] = useState("");

  const fetchMembers = async () => {
    let q = supabase.from("members").select("*").order("created_at", { ascending: false });
    const { data } = await q;
    setMembers(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, []);

  const approve = async (id: string) => {
    const { error } = await supabase.from("members").update({ is_approved: true }).eq("id", id);
    if (!error) { setActionMsg("Member approved!"); fetchMembers(); }
    else setActionMsg("Error: " + error.message);
  };

  const revoke = async (id: string) => {
    const { error } = await supabase.from("members").update({ is_approved: false }).eq("id", id);
    if (!error) { setActionMsg("Approval revoked."); fetchMembers(); }
    else setActionMsg("Error: " + error.message);
  };

  const deleteMember = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (!error) { setActionMsg("Member deleted."); fetchMembers(); }
    else setActionMsg("Error: " + error.message);
  };

  const clearAll = async () => {
    if (!confirm("⚠️ This will DELETE ALL MEMBERS from the website. Are you sure?")) return;
    if (!confirm("Second confirmation: really delete ALL members?")) return;
    const { error } = await supabase.from("members").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (!error) { setActionMsg("All members cleared from website."); fetchMembers(); }
    else setActionMsg("Error: " + error.message);
  };

  const filtered = members.filter(m => {
    if (filter === "pending") return !m.is_approved;
    if (filter === "approved") return m.is_approved;
    return true;
  });

  const pendingCount = members.filter(m => !m.is_approved).length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ color: "#00214D", fontSize: "24px", fontWeight: "800", margin: "0 0 4px" }}>Members</h1>
          {pendingCount > 0 && (
            <p style={{ color: "#c2410c", fontSize: "13px", margin: 0, fontWeight: "600" }}>
              ⏳ {pendingCount} member{pendingCount !== 1 ? "s" : ""} awaiting approval
            </p>
          )}
        </div>
        <button onClick={clearAll}
          style={{ backgroundColor: "#dc2626", color: "white", padding: "8px 16px", borderRadius: "6px", border: "none", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
          🗑 Clear All Members
        </button>
      </div>

      {actionMsg && (
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #86efac", color: "#166534", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>
          {actionMsg}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {(["pending", "approved", "all"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: "6px 16px", borderRadius: "20px", border: "none", cursor: "pointer",
              fontWeight: "600", fontSize: "13px",
              backgroundColor: filter === f ? "#00214D" : "#e5e7eb",
              color: filter === f ? "white" : "#374151",
            }}>
            {f === "pending" ? `Pending (${pendingCount})` : f === "approved" ? `Approved (${members.filter(m => m.is_approved).length})` : `All (${members.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "#9ca3af" }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "32px", textAlign: "center", color: "#9ca3af" }}>
          No members in this category.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map(m => (
            <details key={m.id} style={{ backgroundColor: "white", borderRadius: "10px", padding: "0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid " + (m.is_approved ? "#d1fae5" : "#fed7aa") }}>
              <summary style={{ cursor: "pointer", padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px", listStyle: "none" }}>
                {/* Avatar */}
                <div style={{ width: "38px", height: "38px", borderRadius: "50%", overflow: "hidden", backgroundColor: "#e5e7eb", flexShrink: 0 }}>
                  {m.photo_url
                    ? <img src={m.photo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold", color: "#00214D" }}>
                        {m.full_name?.charAt(0)}
                      </div>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: "700", color: "#00214D", fontSize: "14px" }}>{m.full_name}</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>{m.role} {m.department ? `· ${m.department}` : ""}</p>
                </div>
                <span style={{
                  padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
                  backgroundColor: m.is_approved ? "#d1fae5" : "#fff7ed",
                  color: m.is_approved ? "#166534" : "#9a3412",
                }}>
                  {m.is_approved ? "✓ Approved" : "⏳ Pending"}
                </span>
              </summary>

              <div style={{ padding: "0 18px 18px", borderTop: "1px solid #f0f0f0", marginTop: "4px" }}>
                {/* Details */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px", margin: "14px 0" }}>
                  {[
                    ["Email", m.email],
                    ["Department", m.department],
                    ["Registered", new Date(m.created_at).toLocaleDateString("en-NG")],
                  ].map(([label, val]) => val ? (
                    <div key={label as string}>
                      <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af", fontWeight: "600", textTransform: "uppercase" }}>{label}</p>
                      <p style={{ margin: 0, fontSize: "13px", color: "#374151" }}>{val}</p>
                    </div>
                  ) : null)}
                </div>
                {m.bio && (
                  <p style={{ fontSize: "13px", color: "#555", lineHeight: "1.6", margin: "0 0 14px" }}>{m.bio}</p>
                )}
                {m.cv_url && (
                  <a href={m.cv_url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: "13px", color: "#2E8B57", fontWeight: "600", display: "inline-block", marginBottom: "14px" }}>
                    📄 View CV
                  </a>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {!m.is_approved ? (
                    <button onClick={() => approve(m.id)}
                      style={{ backgroundColor: "#2E8B57", color: "white", padding: "8px 18px", borderRadius: "6px", border: "none", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
                      ✓ Approve
                    </button>
                  ) : (
                    <button onClick={() => revoke(m.id)}
                      style={{ backgroundColor: "#f59e0b", color: "white", padding: "8px 18px", borderRadius: "6px", border: "none", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
                      Revoke Approval
                    </button>
                  )}
                  <button onClick={() => deleteMember(m.id, m.full_name)}
                    style={{ backgroundColor: "#fef2f2", color: "#dc2626", padding: "8px 18px", borderRadius: "6px", border: "1px solid #fecaca", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
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
