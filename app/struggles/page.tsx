import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function StruggesPage() {
  const supabase = createClient();
  const { data: posts } = await supabase
    .from("content_posts")
    .select("*")
    .in("category", ["struggles", "history"])
    .eq("published", true)
    .order("year", { ascending: false });

  const list = posts ?? [];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 16px" }}>

        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <p style={{ fontSize: "12px", fontWeight: "bold", color: "#FFB81C", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 6px" }}>
            Our Journey
          </p>
          <h1 style={{ color: "#00214D", fontSize: "30px", fontWeight: "800", margin: "0 0 12px" }}>
            Struggles &amp; History
          </h1>
          <p style={{ color: "#555", fontSize: "15px", margin: 0, lineHeight: "1.7" }}>
            A chronicle of the chapter&apos;s milestones, challenges, and the relentless pursuit of staff welfare and academic excellence at Jigawa State Polytechnic ICT, Kazaure.
          </p>
          <div style={{ width: "48px", height: "4px", backgroundColor: "#2E8B57", borderRadius: "2px", marginTop: "16px" }} />
        </div>

        {list.length === 0 ? (
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "48px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: "40px", margin: "0 0 12px" }}>📚</p>
            <h3 style={{ color: "#00214D", margin: "0 0 8px" }}>No records yet</h3>
            <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>
              The chapter secretary will populate this section with the chapter&apos;s history and struggles.
            </p>
          </div>
        ) : (
          <div style={{ position: "relative", paddingLeft: "28px" }}>
            {/* Timeline line */}
            <div style={{ position: "absolute", left: "8px", top: "8px", bottom: "8px", width: "2px", backgroundColor: "#2E8B57", opacity: 0.3 }} />

            {list.map((post: any, idx) => (
              <div key={post.id} style={{ position: "relative", marginBottom: "36px" }}>
                {/* Timeline dot */}
                <div style={{
                  position: "absolute", left: "-24px", top: "6px",
                  width: "14px", height: "14px", borderRadius: "50%",
                  backgroundColor: post.category === "history" ? "#FFB81C" : "#2E8B57",
                  border: "2px solid white",
                  boxShadow: "0 0 0 2px " + (post.category === "history" ? "#FFB81C" : "#2E8B57"),
                }} />

                <div style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "20px 24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid #f0f0f0",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                    {post.year && (
                      <span style={{
                        backgroundColor: "#00214D", color: "#FFB81C",
                        padding: "2px 10px", borderRadius: "20px",
                        fontSize: "12px", fontWeight: "700",
                      }}>
                        {post.year}
                      </span>
                    )}
                    <span style={{
                      backgroundColor: post.category === "history" ? "#fff7ed" : "#f0fdf4",
                      color: post.category === "history" ? "#c2410c" : "#166534",
                      padding: "2px 10px", borderRadius: "20px",
                      fontSize: "11px", fontWeight: "600",
                      textTransform: "capitalize",
                    }}>
                      {post.category}
                    </span>
                  </div>
                  <h2 style={{ color: "#00214D", fontSize: "17px", fontWeight: "700", margin: "0 0 10px" }}>
                    {post.title}
                  </h2>
                  <div style={{ color: "#555", fontSize: "14px", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
                    {post.body}
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
