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
      .split("\n\n")
      .map(para => para.trim())
      .filter(Boolean)
      .map(para => {
        if (para.startsWith("## ")) return `<h2 style="color:#003366;font-size:20px;font-weight:bold;margin:24px 0 12px">${para.slice(3)}</h2>`;
        if (para.startsWith("# ")) return `<h1 style="color:#003366;font-size:24px;font-weight:bold;margin:24px 0 12px">${para.slice(2)}</h1>`;
        if (para.startsWith("---")) return `<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>`;
        // Bold
        para = para.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        // Bullet list
        if (para.includes("\n- ")) {
          const items = para.split("\n- ").map((item, i) =>
            i === 0 ? item : `<li style="margin:6px 0">${item.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</li>`
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
      .join("\n");
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
