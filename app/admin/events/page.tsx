import { createClient } from "@/lib/supabase/server";
import { createArchiveItem, deleteArchiveItem } from "@/lib/actions/archives";
import type { ArchiveItem } from "@/lib/types";

export default async function AdminEventsPage() {
  const supabase = createClient();
  const { data: items } = await supabase
    .from("archive_items")
    .select("*")
    .order("record_date", { ascending: false, nullsFirst: false });

  const list = (items ?? []) as ArchiveItem[];

  return (
    <div className="space-y-10">
      <h1 style={{ color: "#00214D", fontSize: "24px", fontWeight: "800", margin: "0 0 24px" }}>Events / Archives</h1>

      {/* Upload new event record */}
      <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <h2 style={{ color: "#00214D", fontSize: "17px", fontWeight: "700", margin: "0 0 18px" }}>Add Event Record</h2>
        <form action={createArchiveItem} style={{ display: "grid", gap: "14px", gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>Title *</label>
            <input name="title" required style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #d1d5db", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" }} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>Description</label>
            <textarea name="description" rows={3} style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #d1d5db", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", resize: "vertical" }} />
          </div>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>Date</label>
            <input type="date" name="record_date" style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #d1d5db", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>Document File</label>
            <input type="file" name="document" accept=".pdf,.doc,.docx,.jpg,.png" style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #d1d5db", borderRadius: "8px", fontSize: "13px", backgroundColor: "#fafafa", boxSizing: "border-box" }} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <button type="submit" style={{ backgroundColor: "#00214D", color: "white", padding: "11px 24px", borderRadius: "8px", border: "none", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}>
              Save Event Record
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div>
        <h2 style={{ color: "#00214D", fontSize: "17px", fontWeight: "700", margin: "0 0 14px" }}>
          All Records ({list.length})
        </h2>
        {list.length === 0 ? (
          <p style={{ color: "#9ca3af" }}>No event records yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {list.map(item => (
              <div key={item.id} style={{ backgroundColor: "white", borderRadius: "10px", padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: "700", color: "#00214D", fontSize: "14px" }}>{item.title}</p>
                  {item.record_date && (
                    <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>
                      {new Date(item.record_date).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <a href={item.document_url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: "13px", color: "#2E8B57", fontWeight: "600", textDecoration: "none" }}>
                    View
                  </a>
                  <form action={deleteArchiveItem.bind(null, item.id)}>
                    <button type="submit" style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
