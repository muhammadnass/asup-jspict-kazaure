import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const revalidate = 60;

export default async function KnowledgeHubPage() {
  const supabase = createClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("*, members(full_name, photo_url, role, department)")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 16px" }}>

        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "12px", fontWeight: "bold", color: "#FFB81C", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 6px" }}>Member Contributions</p>
          <h1 style={{ color: "#00214D", fontSize: "28px", fontWeight: "800", margin: "0 0 8px" }}>Knowledge Hub</h1>
          <p style={{ color: "#666", fontSize: "14px", margin: 0, lineHeight: "1.7" }}>
            Research insights, opinion pieces and knowledge shared by ASUP JSPICT Kazaure Chapter members and the broader academic community.
          </p>
          <div style={{ width: "48px", height: "4px", backgroundColor: "#2E8B57", borderRadius: "2px", marginTop: "16px" }} />
        </div>

        {!articles || articles.length === 0 ? (
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "48px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: "40px", margin: "0 0 12px" }}>✍️</p>
            <h3 style={{ color: "#00214D", margin: "0 0 8px" }}>No articles yet</h3>
            <p style={{ color: "#888", fontSize: "14px", margin: "0 0 16px" }}>Be the first to share your knowledge with the community.</p>
            <a href="/members" style={{ backgroundColor: "#00214D", color: "white", padding: "10px 20px", borderRadius: "6px", textDecoration: "none", fontSize: "13px", fontWeight: "600" }}>
              Sign in to Write
            </a>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {(articles as any[]).map((article) => (
              <Link key={article.id} href={`/articles/${article.id}`} style={{ textDecoration: "none" }}>
                <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0", cursor: "pointer" }}>
                  {/* Top gradient bar */}
                  <div style={{ height: "3px", background: "linear-gradient(to right, #00214D, #FFB81C)", borderRadius: "2px", marginBottom: "16px" }} />
                  <h2 style={{ color: "#00214D", fontSize: "18px", fontWeight: "700", margin: "0 0 8px", lineHeight: "1.4" }}>{article.title}</h2>
                  {article.excerpt && (
                    <p style={{ color: "#666", fontSize: "14px", margin: "0 0 16px", lineHeight: "1.6" }}>{article.excerpt}</p>
                  )}
                  {/* Author + date */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "12px", borderTop: "1px solid #f0f0f0" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "#e5e7eb", overflow: "hidden", flexShrink: 0 }}>
                      {article.members?.photo_url
                        ? <img src={article.members.photo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "bold", color: "#00214D" }}>
                            {article.members?.full_name?.charAt(0) || "A"}
                          </div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#374151", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {article.members?.full_name || "ASUP Member"}
                      </p>
                      {article.members?.department && (
                        <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af" }}>{article.members.department}</p>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                      <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                        {new Date(article.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span style={{ color: "#00214D", fontSize: "12px", fontWeight: "700" }}>Read →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
