"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Course { id: string; code: string; title: string; }
interface Note { id: string; topic_number: number; title: string; content: string; }

export default function LecturerNotesPage() {
  const supabase = createClient();
  const [member, setMember] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [form, setForm] = useState({ title: "", content: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/login"; return; }
      const { data: m } = await supabase.from("members").select("*").eq("user_id", session.user.id).single();
      if (!m) { window.location.href = "/login"; return; }
      setMember(m);
      const { data: c } = await supabase.from("ln_courses").select("id,code,title").order("code");
      setCourses(c ?? []);
      setLoading(false);
    })();
  }, []);

  async function selectCourse(course: Course) {
    setSelectedCourse(course);
    setEditingNote(null);
    setSuccess(""); setError("");
    const { data } = await supabase
      .from("lecture_notes")
      .select("id,topic_number,title,content")
      .eq("course_id", course.id)
      .order("topic_number");
    setNotes(data ?? []);
  }

  function startEdit(note: Note) {
    setEditingNote(note);
    setForm({ title: note.title, content: note.content });
    setSuccess(""); setError("");
  }

  async function saveNote(e: React.FormEvent) {
    e.preventDefault();
    if (!editingNote) return;
    setSaving(true); setSuccess(""); setError("");
    const { error: err } = await supabase
      .from("lecture_notes")
      .update({ title: form.title, content: form.content })
      .eq("id", editingNote.id);
    if (err) { setError(err.message); setSaving(false); return; }
    // Refresh notes list
    setNotes(prev => prev.map(n => n.id === editingNote.id ? { ...n, title: form.title, content: form.content } : n));
    setSuccess("Note updated successfully! Students will see the changes immediately.");
    setEditingNote(null);
    setSaving(false);
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#6b7280" }}>Loading...</p>
    </div>
  );

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", border: "1.5px solid #d1d5db",
    borderRadius: "8px", fontSize: "14px", boxSizing: "border-box",
    outline: "none", color: "#1a2535", backgroundColor: "white",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #00214D, #003d99)", padding: "28px 32px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: "#FFB81C", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>Lecturer Portal</p>
            <h1 style={{ color: "white", fontSize: "22px", fontWeight: "800", margin: 0 }}>Lecture Notes Editor</h1>
            <p style={{ color: "#9ca3af", fontSize: "13px", margin: "4px 0 0" }}>Welcome, {member?.full_name} — select a course to edit its notes</p>
          </div>
          <a href="/dashboard" style={{ color: "#9ca3af", fontSize: "13px", textDecoration: "none" }}>← Back to Dashboard</a>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "280px 1fr", gap: "24px" }}>

        {/* Course list */}
        <div>
          <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
              <h2 style={{ color: "#00214D", fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Courses</h2>
            </div>
            {courses.length === 0 ? (
              <p style={{ padding: "16px", color: "#9ca3af", fontSize: "13px" }}>No courses found.</p>
            ) : (
              courses.map(c => (
                <button key={c.id} onClick={() => selectCourse(c)}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 16px", border: "none", borderBottom: "1px solid #f3f4f6", cursor: "pointer", backgroundColor: selectedCourse?.id === c.id ? "#eff6ff" : "white", transition: "background 0.1s" }}>
                  <p style={{ color: "#00214D", fontSize: "12px", fontWeight: "700", margin: "0 0 2px", fontFamily: "monospace" }}>{c.code}</p>
                  <p style={{ color: "#6b7280", fontSize: "12px", margin: 0, lineHeight: "1.4" }}>{c.title}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Notes / editor */}
        <div>
          {!selectedCourse ? (
            <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "48px 32px", textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>📚</div>
              <p style={{ color: "#6b7280", fontSize: "15px" }}>Select a course from the left to view and edit its lecture notes.</p>
            </div>
          ) : editingNote ? (
            <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ color: "#00214D", fontSize: "15px", fontWeight: "700", margin: 0 }}>
                  Editing: Topic {editingNote.topic_number}
                </h2>
                <button onClick={() => setEditingNote(null)}
                  style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "13px" }}>
                  ✕ Cancel
                </button>
              </div>
              <form onSubmit={saveNote} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {error && <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "13px" }}>{error}</div>}
                {success && <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #86efac", color: "#166534", padding: "10px 14px", borderRadius: "8px", fontSize: "13px" }}>{success}</div>}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Note Title</label>
                  <input type="text" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Content <span style={{ color: "#9ca3af", fontWeight: 400 }}>(HTML supported)</span>
                  </label>
                  <textarea required value={form.content}
                    onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                    rows={20}
                    style={{ ...inputStyle, fontFamily: "monospace", fontSize: "13px", resize: "vertical" }} />
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button type="submit" disabled={saving}
                    style={{ backgroundColor: "#2E8B57", color: "white", padding: "12px 24px", borderRadius: "8px", border: "none", fontWeight: "700", fontSize: "14px", cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                    {saving ? "Saving…" : "💾 Save Changes"}
                  </button>
                  <button type="button" onClick={() => setEditingNote(null)}
                    style={{ backgroundColor: "#f3f4f6", color: "#374151", padding: "12px 24px", borderRadius: "8px", border: "none", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb" }}>
                <h2 style={{ color: "#00214D", fontSize: "15px", fontWeight: "700", margin: "0 0 2px" }}>{selectedCourse.code} — {selectedCourse.title}</h2>
                <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>{notes.length} topic{notes.length !== 1 ? "s" : ""} available</p>
              </div>
              {success && (
                <div style={{ margin: "16px 20px", backgroundColor: "#f0fdf4", border: "1px solid #86efac", color: "#166534", padding: "10px 14px", borderRadius: "8px", fontSize: "13px" }}>
                  {success}
                </div>
              )}
              {notes.length === 0 ? (
                <p style={{ padding: "24px", color: "#9ca3af", fontSize: "13px" }}>No lecture notes found for this course.</p>
              ) : (
                notes.map(note => (
                  <div key={note.id} style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <p style={{ color: "#00214D", fontSize: "14px", fontWeight: "600", margin: "0 0 2px" }}>
                        Topic {note.topic_number}: {note.title}
                      </p>
                      <p style={{ color: "#9ca3af", fontSize: "12px", margin: 0 }}>
                        {note.content.replace(/<[^>]+>/g, "").slice(0, 80)}…
                      </p>
                    </div>
                    <button onClick={() => startEdit(note)}
                      style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", padding: "8px 16px", borderRadius: "6px", border: "1px solid #bfdbfe", fontWeight: "600", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap", marginLeft: "16px" }}>
                      ✏️ Edit
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
