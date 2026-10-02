import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const revalidate = 60;

export default async function ArticlesPage() {
  const supabase = createClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("*, members(full_name, photo_url)")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 16px" }}>

        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "12px", fontWeight: "bold", color: "#FFB81C", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 6px" }}>Knowledge Hub</p>
          <h1 style={{ color: "#003366", fontSize: "28px", fontWeight: "bold", margin: "0 0 8px" }}>Member Articles</h1>
          <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
            Research insights and knowledge shared by ASUP Jigawa ICT Kazaure chapter members and the broader academic community.
          </p>
        </div>

        {!articles || articles.length === 0 ? (
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "48px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: "40px", margin: "0 0 12px" }}>✍️</p>
            <h3 style={{ color: "#003366", margin: "0 0 8px" }}>No articles yet</h3>
            <p style={{ color: "#888", fontSize: "14px", margin: "0 0 16px" }}>Be the first to share your knowledge with the community.</p>
            <a href="/login" style={{ backgroundColor: "#003366", color: "white", padding: "10px 20px", borderRadius: "6px", textDecoration: "none", fontSize: "13px", fontWeight: "600" }}>
              Sign in to Write
            </a>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {(articles as any[]).map((article) => (
              <Link key={article.id} href={`/articles/${article.id}`} style={{ textDecoration: "none" }}>
                <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0", cursor: "pointer" }}>
                  <h2 style={{ color: "#003366", fontSize: "18px", fontWeight: "bold", margin: "0 0 8px" }}>{article.title}</h2>
                  {article.excerpt && (
                    <p style={{ color: "#666", fontSize: "14px", margin: "0 0 12px", lineHeight: "1.6" }}>{article.excerpt}</p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#e5e7eb", overflow: "hidden", flexShrink: 0 }}>
                      {article.members?.photo_url
                        ? <img src={article.members.photo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", color: "#003366" }}>{article.members?.full_name?.charAt(0)}</div>
                      }
                    </div>
                    <span style={{ fontSize: "13px", color: "#888" }}>{article.members?.full_name ?? "ASUP Member"}</span>
                    <span style={{ fontSize: "13px", color: "#ccc", marginLeft: "auto" }}>
                      {new Date(article.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
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
