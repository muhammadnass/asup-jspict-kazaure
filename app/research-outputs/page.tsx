"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResearchOutputsPage() {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [outputs, setOutputs] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [myMember, setMyMember] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", abstract: "" });
  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data: res } = await supabase
        .from("research_outputs")
        .select("*, members(full_name, photo_url, role, department)")
        .eq("published", true)
        .order("created_at", { ascending: false });
      setOutputs(res ?? []);

      if (user) {
        const { data: mem } = await supabase
          .from("members")
          .select("*")
          .eq("user_id", user.id)
          .single();
        setMyMember(mem);
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myMember) return;
    setSubmitting(true);
    setError("");

    let file_url: string | null = null;
    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${myMember.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("research-outputs")
        .upload(path, file, { upsert: true });
      if (!upErr) {
        const { data } = supabase.storage.from("research-outputs").getPublicUrl(path);
        file_url = data.publicUrl;
      }
    }

    const { error: insErr } = await supabase.from("research_outputs").insert({
      member_id: myMember.id,
      title: form.title,
      abstract: form.abstract,
      file_url,
      published: true,
    });

    if (insErr) {
      setError(insErr.message);
    } else {
      setSuccess("Research output submitted successfully!");
      setForm({ title: "", abstract: "" });
      setFile(null);
      setShowForm(false);
      // Refresh list
      const { data: res } = await supabase
        .from("research_outputs")
        .select("*, members(full_name, photo_url, role, department)")
        .eq("published", true)
        .order("created_at", { ascending: false });
      setOutputs(res ?? []);
    }
    setSubmitting(false);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 16px" }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "12px", fontWeight: "bold", color: "#FFB81C", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 6px" }}>
            Scholarly Work
          </p>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h1 style={{ color: "#00214D", fontSize: "28px", fontWeight: "800", margin: "0 0 8px" }}>
                Research Outputs
              </h1>
              <p style={{ color: "#555", fontSize: "14px", margin: 0 }}>
                Peer-reviewed papers, technical reports and academic publications by ASUP JSPICT Kazaure Chapter members.
              </p>
            </div>
            {user && myMember && (
              <button
                onClick={() => setShowForm(!showForm)}
                style={{ backgroundColor: "#00214D", color: "white", padding: "10px 20px", borderRadius: "8px", border: "none", fontWeight: "700", fontSize: "13px", cursor: "pointer", flexShrink: 0 }}>
                {showForm ? "✕ Cancel" : "+ Submit Research"}
              </button>
            )}
          </div>
        </div>

        {/* Success / error messages */}
        {success && (
          <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #86efac", color: "#166534", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>
            {success}
          </div>
        )}
        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>
            {error}
          </div>
        )}

        {/* Submit form */}
        {showForm && myMember && (
          <div style={{ backgroundColor: "white", borderRadius: "14px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", marginBottom: "28px", border: "2px solid #2E8B57" }}>
            <h2 style={{ color: "#00214D", fontSize: "18px", fontWeight: "700", margin: "0 0 20px" }}>
              Submit Research Output
            </h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
                  Research Title *
                </label>
                <input type="text" required
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #d1d5db", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
                  Abstract *
                </label>
                <textarea required rows={5}
                  value={form.abstract}
                  onChange={e => setForm(f => ({ ...f, abstract: e.target.value }))}
                  style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #d1d5db", borderRadius: "8px", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
                  Upload Publication File <span style={{ fontWeight: 400, color: "#9ca3af" }}>(PDF, DOC — optional)</span>
                </label>
                <div onClick={() => fileRef.current?.click()}
                  style={{ border: "2px dashed #d1d5db", borderRadius: "8px", padding: "14px", textAlign: "center", cursor: "pointer", backgroundColor: file ? "#f0fdf4" : "#fafafa", borderColor: file ? "#86efac" : "#d1d5db" }}>
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx"
                    onChange={e => setFile(e.target.files?.[0] ?? null)} style={{ display: "none" }} />
                  <p style={{ margin: 0, fontSize: "13px", color: file ? "#166534" : "#9ca3af" }}>
                    {file ? `✅ ${file.name}` : "📄 Click to upload file"}
                  </p>
                </div>
              </div>
              <button type="submit" disabled={submitting}
                style={{ backgroundColor: "#FFB81C", color: "#00214D", padding: "12px", borderRadius: "8px", border: "none", fontWeight: "800", fontSize: "15px", cursor: "pointer", opacity: submitting ? 0.7 : 1 }}>
                {submitting ? "Submitting…" : "Submit Research Output"}
              </button>
            </form>
          </div>
        )}

        {!user && (
          <div style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "10px", padding: "14px 18px", marginBottom: "24px", fontSize: "13px", color: "#9a3412" }}>
            <strong>Note:</strong> Sign in via the <a href="/members" style={{ color: "#c2410c" }}>Members page</a> to submit your own research outputs.
          </div>
        )}

        {/* Outputs list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#9ca3af" }}>Loading…</div>
        ) : outputs.length === 0 ? (
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "48px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: "40px", margin: "0 0 12px" }}>📰</p>
            <h3 style={{ color: "#00214D", margin: "0 0 8px" }}>No research outputs yet</h3>
            <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>
              Members can submit their research papers and publications using the button above.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {outputs.map((item: any) => (
              <div key={item.id}
                style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0" }}>
                {/* Title */}
                <h2 style={{ color: "#00214D", fontSize: "17px", fontWeight: "700", margin: "0 0 10px", lineHeight: "1.4" }}>
                  {item.title}
                </h2>
                {/* Abstract */}
                <p style={{ color: "#555", fontSize: "13px", lineHeight: "1.7", margin: "0 0 14px" }}>
                  {item.abstract}
                </p>
                {/* Author row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "50%", overflow: "hidden", backgroundColor: "#e5e7eb", flexShrink: 0 }}>
                      {item.members?.photo_url
                        ? <img src={item.members.photo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold", color: "#00214D" }}>
                            {item.members?.full_name?.charAt(0) ?? "A"}
                          </div>
                      }
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                        {item.members?.full_name ?? "ASUP Member"}
                      </p>
                      {item.members?.department && (
                        <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af" }}>{item.members.department}</p>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                      {new Date(item.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    {item.file_url && (
                      <a href={item.file_url} target="_blank" rel="noopener noreferrer"
                        style={{ backgroundColor: "#00214D", color: "white", padding: "6px 14px", borderRadius: "6px", textDecoration: "none", fontSize: "12px", fontWeight: "700" }}>
                        Download →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
