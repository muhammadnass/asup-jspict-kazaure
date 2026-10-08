import os

base = "/home/muhammad-sanusi/Documents/Projects/ASUP website/asup-jigawa"

# ── NEW ARTICLE PAGE ──────────────────────────────────────────────────
os.makedirs(f"{base}/app/dashboard/articles/new", exist_ok=True)

files = {}

files[f"{base}/app/dashboard/articles/new/page.tsx"] = """
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
""".lstrip()

# ── INDIVIDUAL ARTICLE VIEW PAGE ─────────────────────────────────────
os.makedirs(f"{base}/app/articles/[id]", exist_ok=True)

files[f"{base}/app/articles/[id]/page.tsx"] = """
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export const revalidate = 60;

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: article } = await supabase
    .from("articles")
    .select("*, members(full_name, photo_url, role, department)")
    .eq("id", params.id)
    .eq("published", true)
    .single();

  if (!article) notFound();

  const formattedDate = new Date(article.created_at).toLocaleDateString("en-NG", {
    day: "numeric", month: "long", year: "numeric"
  });

  // Convert basic markdown-like formatting to HTML paragraphs
  const formatBody = (text: string) => {
    return text
      .split("\\n\\n")
      .map(para => para.trim())
      .filter(Boolean)
      .map(para => {
        if (para.startsWith("## ")) return `<h2 style="color:#003366;font-size:20px;font-weight:bold;margin:24px 0 12px">${para.slice(3)}</h2>`;
        if (para.startsWith("# ")) return `<h1 style="color:#003366;font-size:24px;font-weight:bold;margin:24px 0 12px">${para.slice(2)}</h1>`;
        if (para.startsWith("---")) return `<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>`;
        // Bold
        para = para.replace(/\\*\\*(.+?)\\*\\*/g, "<strong>$1</strong>");
        // Bullet list
        if (para.includes("\\n- ")) {
          const items = para.split("\\n- ").map((item, i) =>
            i === 0 ? item : `<li style="margin:6px 0">${item.replace(/\\*\\*(.+?)\\*\\*/g, "<strong>$1</strong>")}</li>`
          );
          return `<p style="margin:0 0 8px">${items[0]}</p><ul style="padding-left:20px;margin:8px 0">${items.slice(1).join("")}</ul>`;
        }
        if (para.startsWith("- ")) {
          return `<ul style="padding-left:20px;margin:8px 0"><li style="margin:4px 0">${para.slice(2)}</li></ul>`;
        }
        if (para.startsWith("*") && para.endsWith("*")) {
          return `<p style="font-style:italic;color:#555;margin:16px 0;font-size:14px">${para.slice(1,-1)}</p>`;
        }
        return `<p style="margin:0 0 16px;line-height:1.8">${para}</p>`;
      })
      .join("\\n");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 16px" }}>

        {/* Back */}
        <a href="/articles" style={{ color: "#003366", fontSize: "13px", textDecoration: "none", display: "inline-block", marginBottom: "20px" }}>
          ← Back to Articles
        </a>

        {/* Article header */}
        <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "32px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: "24px" }}>
          <h1 style={{ color: "#003366", fontSize: "26px", fontWeight: "bold", lineHeight: "1.3", margin: "0 0 16px" }}>
            {article.title}
          </h1>

          {/* Author */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "16px", borderBottom: "1px solid #f0f0f0", marginBottom: "24px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", backgroundColor: "#e5e7eb", flexShrink: 0 }}>
              {article.members?.photo_url
                ? <img src={article.members.photo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#003366" }}>
                    {article.members?.full_name?.charAt(0) || "A"}
                  </div>
              }
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: "600", color: "#003366", fontSize: "14px" }}>
                {article.members?.full_name || "ASUP JSPICT Member"}
              </p>
              <p style={{ margin: 0, color: "#888", fontSize: "12px" }}>
                {article.members?.role && `${article.members.role} · `}{formattedDate}
              </p>
            </div>
          </div>

          {/* Body */}
          <div
            style={{ color: "#374151", fontSize: "15px", lineHeight: "1.8" }}
            dangerouslySetInnerHTML={{ __html: formatBody(article.body) }}
          />
        </div>

        {/* Footer CTA */}
        <div style={{ backgroundColor: "#003366", borderRadius: "12px", padding: "20px 24px", textAlign: "center", color: "white" }}>
          <p style={{ margin: "0 0 8px", fontWeight: "600" }}>Are you a staff member?</p>
          <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#9ca3af" }}>Share your knowledge — write an article for the chapter.</p>
          <a href="/login" style={{ backgroundColor: "#FFB81C", color: "#003366", padding: "8px 20px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold", fontSize: "13px" }}>
            Sign In to Write
          </a>
        </div>

      </div>
    </div>
  );
}
""".lstrip()

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    print(f"✅ Written: {os.path.relpath(path, base)} ({content.count(chr(10))} lines)")

print("\n🎉 Article pages created!")
print("Pages added:")
print("  /dashboard/articles/new  — Write and publish articles")
print("  /articles/[id]           — View individual articles")
