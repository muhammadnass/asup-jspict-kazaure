"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminDepartmentsPage() {
  const supabase = createClient();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const fetch = async () => {
    const { data } = await supabase.from("departments").select("*").order("display_order", { ascending: true });
    setDepartments(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    const maxOrder = departments.length > 0 ? Math.max(...departments.map(d => d.display_order)) + 1 : 1;
    const { error } = await supabase.from("departments").insert({ name: newName.trim(), display_order: maxOrder });
    setSaving(false);
    if (error) { setMsg("Error: " + error.message); return; }
    setNewName("");
    setMsg("Department added!");
    fetch();
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete department "${name}"? Members assigned to it will keep the name but it won't appear in the dropdown.`)) return;
    await supabase.from("departments").delete().eq("id", id);
    setMsg("Department removed.");
    fetch();
  };

  return (
    <div>
      <h1 style={{ color: "#00214D", fontSize: "24px", fontWeight: "800", margin: "0 0 8px" }}>Departments</h1>
      <p style={{ color: "#555", fontSize: "14px", margin: "0 0 24px" }}>
        Manage the list of departments shown in registration and member profiles.
      </p>

      {msg && (
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #86efac", color: "#166534", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>
          {msg}
        </div>
      )}

      {/* Add new */}
      <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "20px" }}>
        <h2 style={{ color: "#00214D", fontSize: "16px", fontWeight: "700", margin: "0 0 14px" }}>Add Department</h2>
        <form onSubmit={add} style={{ display: "flex", gap: "10px" }}>
          <input type="text" required value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="Department name"
            style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }} />
          <button type="submit" disabled={saving}
            style={{ backgroundColor: "#2E8B57", color: "white", padding: "10px 20px", borderRadius: "8px", border: "none", fontWeight: "700", fontSize: "13px", cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Adding…" : "Add"}
          </button>
        </form>
      </div>

      {/* List */}
      <div style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: "20px", color: "#9ca3af" }}>Loading…</p>
        ) : departments.length === 0 ? (
          <p style={{ padding: "20px", color: "#9ca3af" }}>No departments yet. Add one above.</p>
        ) : (
          departments.map((d, idx) => (
            <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: idx < departments.length - 1 ? "1px solid #f0f0f0" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ color: "#9ca3af", fontSize: "12px", fontWeight: "600", minWidth: "20px" }}>{d.display_order}</span>
                <span style={{ color: "#00214D", fontSize: "14px", fontWeight: "600" }}>{d.name}</span>
              </div>
              <button onClick={() => remove(d.id, d.name)}
                style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
