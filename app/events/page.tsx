import { createClient } from "@/lib/supabase/server";
import type { ArchiveItem } from "@/lib/types";

export const revalidate = 60;

export default async function EventsPage() {
  const supabase = createClient();
  const { data: items } = await supabase
    .from("archive_items")
    .select("*")
    .order("record_date", { ascending: false, nullsFirst: false });

  const list = (items ?? []) as ArchiveItem[];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 16px" }}>
        {/* Header */}
        <div style={{ marginBottom: "36px" }}>
          <p style={{ fontSize: "12px", fontWeight: "bold", color: "#FFB81C", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 6px" }}>
            Chapter Events
          </p>
          <h1 style={{ color: "#00214D", fontSize: "30px", fontWeight: "800", margin: "0 0 10px" }}>Events</h1>
          <p style={{ color: "#555", fontSize: "14px", margin: 0, maxWidth: "600px", lineHeight: "1.7" }}>
            Workshops, seminars, meetings and institutional events organised by or involving the ASUP JSPICT Kazaure Chapter.
            Records include minutes, circulars and photographs preserved for institutional memory.
          </p>
          <div style={{ width: "48px", height: "4px", backgroundColor: "#2E8B57", borderRadius: "2px", marginTop: "16px" }} />
        </div>

        {list.length === 0 ? (
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "48px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: "40px", margin: "0 0 12px" }}>🗂️</p>
            <h3 style={{ color: "#00214D", margin: "0 0 8px" }}>No events recorded yet</h3>
            <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>
              The chapter secretary will upload event records from the admin dashboard.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
            {list.map((item) => (
              <a
                key={item.id}
                href={item.document_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", display: "block", backgroundColor: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0", transition: "transform 0.2s, box-shadow 0.2s" }}
              >
                {/* Thumbnail / Placeholder */}
                <div style={{ height: "160px", backgroundColor: "#00214D", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {item.thumbnail_url
                    ? <img src={item.thumbnail_url} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: "48px" }}>📄</span>
                  }
                </div>
                {/* Content */}
                <div style={{ padding: "16px" }}>
                  {item.record_date && (
                    <p style={{ fontSize: "11px", color: "#FFB81C", fontWeight: "700", margin: "0 0 6px", textTransform: "uppercase" }}>
                      {new Date(item.record_date).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  )}
                  <h3 style={{ color: "#00214D", fontSize: "15px", fontWeight: "700", margin: "0 0 8px", lineHeight: "1.4" }}>
                    {item.title}
                  </h3>
                  {item.description && (
                    <p style={{ color: "#666", fontSize: "13px", margin: "0 0 12px", lineHeight: "1.6", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {item.description}
                    </p>
                  )}
                  <span style={{ color: "#2E8B57", fontSize: "12px", fontWeight: "700" }}>
                    View Record →
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
