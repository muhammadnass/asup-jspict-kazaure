"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function NewArticlePage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [memberId, setMemberId] = useState("");
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    body: "",
    published: false,
  });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("members").select("id").eq("user_id", user.id).maybeSingle();
      if (data) setMemberId(data.id);
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async (publish: boolean) => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.body.trim()) { setError("Article body is required."); return; }
    setSaving(true);
    setError("");

    const slug = form.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 80) + "-" + Date.now();

    const { error } = await supabase.from("articles").insert({
      title: form.title,
      excerpt: form.excerpt || form.body.substring(0, 200) + "...",
      body: form.body,
      slug,
      author_id: memberId || null,
      published: publish,
    });

    if (error) { setError(error.message); setSaving(false); return; }
    router.push(publish ? "/articles" : "/dashboard");
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#003366" }}>Loading...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px 16px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <a href="/dashboard" style={{ color: "#003366", fontSize: "13px", textDecoration: "none" }}>← Back to Dashboard</a>
            <h1 style={{ color: "#003366", fontSize: "22px", fontWeight: "bold", margin: "4px 0 0" }}>Write New Article</h1>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: "6px", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>

          {/* Title */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
              Article Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Quantum AI: The Convergence That Will Redefine Computing..."
              style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "16px", fontWeight: "600", boxSizing: "border-box" }}
            />
          </div>

          {/* Excerpt */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
              Brief Summary / Excerpt <span style={{ fontWeight: "normal", color: "#888" }}>(optional — shown on articles listing)</span>
            </label>
            <textarea
              value={form.excerpt}
              onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
              placeholder="A short 1-2 sentence summary of your article..."
              rows={2}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }}
            />
          </div>

          {/* Body */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
              Article Body * <span style={{ fontWeight: "normal", color: "#888" }}>(paste or type your full article here)</span>
            </label>
            <textarea
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              placeholder="Start writing your article here..."
              rows={24}
              style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", resize: "vertical", boxSizing: "border-box", lineHeight: "1.7", fontFamily: "system-ui, sans-serif" }}
            />
            <p style={{ fontSize: "12px", color: "#aaa", margin: "4px 0 0" }}>
              {form.body.split(/\s+/).filter(Boolean).length} words
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              style={{ flex: 1, minWidth: "140px", backgroundColor: "#003366", color: "white", padding: "12px", borderRadius: "8px", border: "none", fontWeight: "bold", fontSize: "14px", cursor: "pointer", opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Publishing..." : "Publish Article"}
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              style={{ flex: 1, minWidth: "140px", backgroundColor: "#f3f4f6", color: "#374151", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", fontWeight: "600", fontSize: "14px", cursor: "pointer", opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Saving..." : "Save as Draft"}
            </button>
            <a
              href="/dashboard"
              style={{ flex: 1, minWidth: "140px", backgroundColor: "white", color: "#888", padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontWeight: "600", fontSize: "14px", textAlign: "center", textDecoration: "none" }}
            >
              Cancel
            </a>
          </div>
        </div>

        {/* Tip */}
        <div style={{ backgroundColor: "#eff6ff", borderRadius: "8px", padding: "14px 16px", marginTop: "16px" }}>
          <p style={{ fontSize: "12px", color: "#1e40af", margin: 0 }}>
            <b>Tip:</b> You can paste your article directly from a document. Use headings (## Section Title), bold (**text**) and bullet points (- item) for better formatting. Articles appear immediately on the Articles page after publishing.
          </p>
        </div>

      </div>
    </div>
  );
}
