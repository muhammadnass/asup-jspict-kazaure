"use client";
import { useState, useEffect } from "react";

const DEPARTMENTS = [
  "Computer Science","Computer Engineering","Electrical/Electronics Engineering",
  "Health Information Management","Library and Information Science",
  "Office Technology and Management","Printing Technology","Statistics","General Studies",
];

type Question = {
  id?: string;
  question_number: number;
  question_text: string;
  question_type: "mcq" | "truefalse";
  options: string[];
  correct_answer: string;
  explanation?: string;
  approved: boolean;
  source: "ai" | "manual";
};

type Assessment = {
  id: string;
  course_code: string;
  course_title: string;
  department: string;
  type: "ca" | "exam";
  title: string;
  instructions: string;
  duration_mins: number;
  total_marks: number;
  weight_pct: number;
  status: string;
  academic_year: string;
  semester: string;
  open_at: string;
  close_at: string;
};

export default function AssessmentPage() {
  const [step, setStep] = useState<"list" | "create" | "questions" | "preview">("list");
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [current, setCurrent] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [pastedText, setPastedText] = useState("");
  const [mcqCount, setMcqCount] = useState(15);
  const [tfCount, setTfCount] = useState(5);
  const [genError, setGenError] = useState("");
  const [editingQ, setEditingQ] = useState<number | null>(null);

  const [form, setForm] = useState({
    course_code: "", course_title: "", department: "", type: "ca",
    title: "", instructions: "Answer all questions. Each question carries equal marks.",
    duration_mins: 30, total_marks: 20, academic_year: "2025/2026",
    semester: "First", open_at: "", close_at: "",
  });

  useEffect(() => { loadAssessments(); }, []);

  const loadAssessments = async () => {
    const r = await fetch("/api/assessment/list");
    if (r.ok) setAssessments(await r.json());
  };

  const loadNotes = async (programmeCode: string) => {
    const r = await fetch(`/api/assessment/course-notes?programme=${programmeCode}`);
    if (r.ok) setNotes(await r.json());
  };

  const createAssessment = async () => {
    setSaving(true);
    const weight = form.type === "ca" ? 40 : 60;
    const r = await fetch("/api/assessment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, weight_pct: weight }),
    });
    if (r.ok) {
      const data = await r.json();
      setCurrent(data);
      setStep("questions");
      // Load notes for this course's programme
      loadNotes(data.programme_code ?? "ND-CS");
    }
    setSaving(false);
  };

  const generateQuestions = async () => {
    if (!current) return;
    setGenerating(true);
    setGenError("");
    const r = await fetch("/api/assessment/generate-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assessmentId: current.id,
        courseCode: current.course_code,
        courseTitle: current.course_title,
        sourceText: pastedText,
        noteIds: selectedNotes,
        mcqCount,
        tfCount,
      }),
    });
    const data = await r.json();
    if (!r.ok) { setGenError(data.error ?? "Failed"); setGenerating(false); return; }
    setQuestions(data.questions.map((q: any, i: number) => ({ ...q, question_number: i + 1, approved: false, source: "ai" })));
    setGenerating(false);
  };

  const toggleApprove = (idx: number) => {
    setQuestions(qs => qs.map((q, i) => i === idx ? { ...q, approved: !q.approved } : q));
  };

  const approveAll = () => setQuestions(qs => qs.map(q => ({ ...q, approved: true })));

  const updateQuestion = (idx: number, field: string, value: any) => {
    setQuestions(qs => qs.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const saveAndActivate = async (action: "save" | "open") => {
    if (!current) return;
    setSaving(true);
    // Save all questions
    await fetch("/api/assessment/save-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assessmentId: current.id, questions }),
    });
    if (action === "open") {
      await fetch("/api/assessment/set-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId: current.id, status: "open" }),
      });
    }
    setSaving(false);
    loadAssessments();
    setStep("list");
  };

  const approvedCount = questions.filter(q => q.approved).length;

  if (step === "list") return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ color: "#00214D", fontSize: "22px", fontWeight: "800" }}>📝 My Assessments</h1>
          <p style={{ color: "#6b7280", fontSize: "13px" }}>Create and manage CA tests and examinations</p>
        </div>
        <button onClick={() => setStep("create")}
          style={{ backgroundColor: "#00214D", color: "white", padding: "10px 20px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", border: "none", cursor: "pointer" }}>
          + New Assessment
        </button>
      </div>

      {assessments.length === 0 ? (
        <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "60px 24px", textAlign: "center", border: "1px solid #e5e7eb" }}>
          <p style={{ fontSize: "48px" }}>📋</p>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "12px" }}>No assessments yet. Click "New Assessment" to create one.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {assessments.map((a: Assessment) => (
            <div key={a.id} style={{ backgroundColor: "white", borderRadius: "10px", padding: "18px 20px", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ backgroundColor: a.type === "ca" ? "#dbeafe" : "#fef3c7", color: a.type === "ca" ? "#1d4ed8" : "#92400e", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "99px", textTransform: "uppercase" }}>
                    {a.type === "ca" ? "CA 40%" : "EXAM 60%"}
                  </span>
                  <span style={{ backgroundColor: a.status === "open" ? "#dcfce7" : a.status === "closed" ? "#fee2e2" : "#f3f4f6", color: a.status === "open" ? "#166534" : a.status === "closed" ? "#dc2626" : "#6b7280", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "99px", textTransform: "uppercase" }}>
                    {a.status}
                  </span>
                </div>
                <h3 style={{ color: "#00214D", fontSize: "15px", fontWeight: "700" }}>{a.title}</h3>
                <p style={{ color: "#6b7280", fontSize: "12px" }}>{a.course_code} · {a.department} · {a.academic_year} {a.semester} Semester</p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <a href={`/api/assessment/export?id=${a.id}&format=excel`}
                  style={{ backgroundColor: "#f0fdf4", color: "#166534", padding: "7px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", textDecoration: "none" }}>
                  📊 Excel
                </a>
                <a href={`/api/assessment/export?id=${a.id}&format=pdf`} target="_blank"
                  style={{ backgroundColor: "#fef2f2", color: "#dc2626", padding: "7px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", textDecoration: "none" }}>
                  📄 PDF
                </a>
                {a.status === "draft" && (
                  <button onClick={() => { setCurrent(a); setStep("questions"); }}
                    style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", padding: "7px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", border: "none", cursor: "pointer" }}>
                    ✏️ Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (step === "create") return (
    <div style={{ padding: "24px", maxWidth: "700px", margin: "0 auto" }}>
      <button onClick={() => setStep("list")} style={{ color: "#6b7280", background: "none", border: "none", cursor: "pointer", marginBottom: "16px", fontSize: "13px" }}>
        ← Back
      </button>
      <h1 style={{ color: "#00214D", fontSize: "20px", fontWeight: "800", marginBottom: "20px" }}>Create New Assessment</h1>

      <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: "16px" }}>
        {[
          { label: "Assessment Type", key: "type", type: "select", options: [{ v: "ca", l: "CA Test (40%)" }, { v: "exam", l: "Examination (60%)" }] },
          { label: "Assessment Title", key: "title", placeholder: "e.g. First Semester CA Test" },
          { label: "Course Code", key: "course_code", placeholder: "e.g. COM 111" },
          { label: "Course Title", key: "course_title", placeholder: "e.g. Introduction to Computing" },
          { label: "Department", key: "department", type: "select", options: DEPARTMENTS.map(d => ({ v: d, l: d })) },
          { label: "Academic Year", key: "academic_year", placeholder: "e.g. 2025/2026" },
          { label: "Semester", key: "semester", type: "select", options: [{ v: "First", l: "First" }, { v: "Second", l: "Second" }] },
          { label: "Duration (minutes)", key: "duration_mins", type: "number" },
          { label: "Total Marks / Questions", key: "total_marks", type: "number" },
          { label: "Open At (optional)", key: "open_at", type: "datetime-local" },
          { label: "Close At (optional)", key: "close_at", type: "datetime-local" },
        ].map((f: any) => (
          <div key={f.key}>
            <label style={{ color: "#374151", fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>{f.label}</label>
            {f.type === "select" ? (
              <select value={(form as any)[f.key]} onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }}>
                {f.options.map((o: any) => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            ) : (
              <input type={f.type ?? "text"} value={(form as any)[f.key]} placeholder={f.placeholder}
                onChange={e => setForm(x => ({ ...x, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }} />
            )}
          </div>
        ))}

        <div>
          <label style={{ color: "#374151", fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>Instructions for Students</label>
          <textarea value={form.instructions} onChange={e => setForm(x => ({ ...x, instructions: e.target.value }))} rows={3}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }} />
        </div>

        <button onClick={createAssessment} disabled={saving || !form.course_code || !form.title}
          style={{ backgroundColor: "#00214D", color: "white", padding: "14px", borderRadius: "8px", fontWeight: "700", fontSize: "15px", border: "none", cursor: "pointer" }}>
          {saving ? "Creating…" : "Continue to Questions →"}
        </button>
      </div>
    </div>
  );

  if (step === "questions") return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <button onClick={() => setStep("list")} style={{ color: "#6b7280", background: "none", border: "none", cursor: "pointer", marginBottom: "8px", fontSize: "13px" }}>
        ← Back to list
      </button>
      <h1 style={{ color: "#00214D", fontSize: "20px", fontWeight: "800", marginBottom: "4px" }}>
        Generate Questions — {current?.title}
      </h1>
      <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "20px" }}>
        {current?.course_code} · {current?.type === "ca" ? "CA Test 40%" : "Exam 60%"} · {current?.duration_mins} mins · {current?.total_marks} marks
      </p>

      {/* Generation controls */}
      <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", border: "1px solid #e5e7eb", marginBottom: "20px" }}>
        <h2 style={{ color: "#00214D", fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>🤖 AI Question Generation</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>MCQ Questions</label>
            <input type="number" value={mcqCount} min={0} max={40}
              onChange={e => setMcqCount(Number(e.target.value))}
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>True/False Questions</label>
            <input type="number" value={tfCount} min={0} max={20}
              onChange={e => setTfCount(Number(e.target.value))}
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }} />
          </div>
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>
            Paste your own topic / notes (optional — combine with lecture notes below)
          </label>
          <textarea value={pastedText} onChange={e => setPastedText(e.target.value)} rows={4}
            placeholder="Paste any text, syllabus, or notes here to generate questions from…"
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "13px" }} />
        </div>

        {notes.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "8px" }}>
              Or select lecture notes from the platform:
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "180px", overflowY: "auto" }}>
              {notes.map((n: any) => (
                <label key={n.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", backgroundColor: "#f9fafb", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>
                  <input type="checkbox" checked={selectedNotes.includes(n.id)}
                    onChange={e => setSelectedNotes(s => e.target.checked ? [...s, n.id] : s.filter(x => x !== n.id))} />
                  Topic {n.topic_number}: {n.title}
                </label>
              ))}
            </div>
          </div>
        )}

        {genError && <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "10px" }}>⚠️ {genError}</p>}

        <button onClick={generateQuestions} disabled={generating || (!pastedText.trim() && selectedNotes.length === 0)}
          style={{ backgroundColor: "#2E8B57", color: "white", padding: "12px 24px", borderRadius: "8px", fontWeight: "700", fontSize: "14px", border: "none", cursor: "pointer" }}>
          {generating ? "⏳ Generating with AI…" : "⚡ Generate Questions"}
        </button>
      </div>

      {/* Questions review */}
      {questions.length > 0 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h2 style={{ color: "#00214D", fontSize: "16px", fontWeight: "700" }}>
              Review Questions ({approvedCount}/{questions.length} approved)
            </h2>
            <button onClick={approveAll}
              style={{ backgroundColor: "#f0fdf4", color: "#166534", padding: "8px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", border: "1px solid #86efac", cursor: "pointer" }}>
              ✓ Approve All
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
            {questions.map((q, idx) => (
              <div key={idx} style={{ backgroundColor: "white", borderRadius: "10px", padding: "18px", border: `1px solid ${q.approved ? "#86efac" : "#e5e7eb"}`, borderLeft: `4px solid ${q.approved ? "#22c55e" : "#d1d5db"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <span style={{ backgroundColor: q.question_type === "mcq" ? "#dbeafe" : "#fef3c7", color: q.question_type === "mcq" ? "#1d4ed8" : "#92400e", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "99px" }}>
                    {q.question_type === "mcq" ? "MCQ" : "True/False"}
                  </span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => setEditingQ(editingQ === idx ? null : idx)}
                      style={{ backgroundColor: "#f3f4f6", color: "#374151", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", border: "none", cursor: "pointer" }}>
                      ✏️ Edit
                    </button>
                    <button onClick={() => toggleApprove(idx)}
                      style={{ backgroundColor: q.approved ? "#dcfce7" : "#f9fafb", color: q.approved ? "#166534" : "#6b7280", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", border: `1px solid ${q.approved ? "#86efac" : "#e5e7eb"}`, cursor: "pointer" }}>
                      {q.approved ? "✓ Approved" : "Approve"}
                    </button>
                  </div>
                </div>

                {editingQ === idx ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <textarea value={q.question_text} rows={2}
                      onChange={e => updateQuestion(idx, "question_text", e.target.value)}
                      style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px" }} />
                    {q.question_type === "mcq" && q.options.map((opt, oi) => (
                      <div key={oi} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input type="radio" name={`correct-${idx}`} checked={q.correct_answer === ["A","B","C","D"][oi]}
                          onChange={() => updateQuestion(idx, "correct_answer", ["A","B","C","D"][oi])} />
                        <input value={opt} onChange={e => { const opts = [...q.options]; opts[oi] = e.target.value; updateQuestion(idx, "options", opts); }}
                          style={{ flex: 1, padding: "7px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px" }} />
                      </div>
                    ))}
                    {q.question_type === "truefalse" && (
                      <div style={{ display: "flex", gap: "12px" }}>
                        {["True", "False"].map(v => (
                          <label key={v} style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "13px" }}>
                            <input type="radio" checked={q.correct_answer === v} onChange={() => updateQuestion(idx, "correct_answer", v)} />
                            {v}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <p style={{ color: "#00214D", fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
                      Q{idx + 1}. {q.question_text}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {q.options.map((opt, oi) => {
                        const letter = q.question_type === "mcq" ? ["A","B","C","D"][oi] : opt;
                        const isCorrect = q.correct_answer === letter;
                        return (
                          <div key={oi} style={{ padding: "6px 10px", borderRadius: "6px", backgroundColor: isCorrect ? "#f0fdf4" : "#f9fafb", color: isCorrect ? "#166534" : "#374151", fontSize: "13px", fontWeight: isCorrect ? "600" : "400", border: isCorrect ? "1px solid #86efac" : "1px solid transparent" }}>
                            {opt} {isCorrect && "✓"}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => saveAndActivate("save")} disabled={saving || approvedCount === 0}
              style={{ backgroundColor: "#f3f4f6", color: "#374151", padding: "12px 20px", borderRadius: "8px", fontWeight: "700", fontSize: "14px", border: "1px solid #d1d5db", cursor: "pointer" }}>
              {saving ? "Saving…" : "💾 Save as Draft"}
            </button>
            <button onClick={() => saveAndActivate("open")} disabled={saving || approvedCount === 0}
              style={{ backgroundColor: "#00214D", color: "white", padding: "12px 20px", borderRadius: "8px", fontWeight: "700", fontSize: "14px", border: "none", cursor: "pointer" }}>
              {saving ? "Opening…" : `🚀 Approve & Open Test (${approvedCount} questions)`}
            </button>
          </div>

          {approvedCount === 0 && (
            <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "8px" }}>
              Approve at least one question before opening the test.
            </p>
          )}
        </div>
      )}
    </div>
  );

  return null;
}
