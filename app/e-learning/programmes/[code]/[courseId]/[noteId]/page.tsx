"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ── Types ──
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface Note {
  id: string;
  topic_number: number;
  title: string;
  content: string;
  pdf_url: string | null;
  word_url: string | null;
  course_id: string;
}

// ── Quiz component ──
function QuizSection({ questions, studentId, noteId }: { questions: QuizQuestion[]; studentId: string | null; noteId: string }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  if (questions.length === 0) return null;

  const score = questions.filter(q => answers[q.id] === q.answer).length;

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }
    setSubmitted(true);
    if (!studentId) return;
    setSaving(true);
    // Record quiz attempts
    const response = await fetch("/api/student/quiz-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId, attempts: Object.entries(answers).map(([quizId, selected]) => ({
        quizId,
        selected,
        correct: questions.find(q => q.id === quizId)?.answer === selected,
      })) }),
    });
    setSaving(false);
  };

  return (
    <div style={{ marginTop: "48px", borderTop: "2px dashed #e5e7eb", paddingTop: "32px" }}>
      <h2 style={{ color: "#00214D", fontSize: "20px", fontWeight: "800", marginBottom: "8px" }}>🧠 Quick Quiz</h2>
      <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "24px" }}>
        Test your understanding. Answer all {questions.length} question{questions.length !== 1 ? "s" : ""} then click Submit.
      </p>

      {questions.map((q, i) => {
        const selected = answers[q.id];
        const isCorrect = submitted && selected === q.answer;
        const isWrong = submitted && selected && selected !== q.answer;

        return (
          <div key={q.id} style={{ backgroundColor: "#f9fafb", borderRadius: "12px", padding: "20px", marginBottom: "16px", border: submitted ? (isCorrect ? "2px solid #2E8B57" : isWrong ? "2px solid #ef4444" : "2px solid #e5e7eb") : "2px solid transparent" }}>
            <p style={{ color: "#00214D", fontSize: "15px", fontWeight: "700", marginBottom: "12px" }}>
              Q{i + 1}. {q.question}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {q.options.map((opt) => {
                const letter = opt[0];
                const isSelected = selected === letter;
                const isAnswer = q.answer === letter;
                let bg = "white";
                let border = "1px solid #d1d5db";
                let color = "#374151";
                if (!submitted && isSelected) { bg = "#eff6ff"; border = "1.5px solid #3b82f6"; color = "#1d4ed8"; }
                if (submitted && isAnswer) { bg = "#f0fdf4"; border = "1.5px solid #22c55e"; color = "#166534"; }
                if (submitted && isSelected && !isAnswer) { bg = "#fef2f2"; border = "1.5px solid #ef4444"; color = "#dc2626"; }

                return (
                  <button key={opt} disabled={submitted}
                    onClick={() => !submitted && setAnswers(a => ({ ...a, [q.id]: letter }))}
                    style={{ textAlign: "left", backgroundColor: bg, border, borderRadius: "8px", padding: "10px 14px", cursor: submitted ? "default" : "pointer", color, fontSize: "14px", fontWeight: isSelected || (submitted && isAnswer) ? "600" : "400" }}>
                    {opt} {submitted && isAnswer && " ✓"} {submitted && isSelected && !isAnswer && " ✗"}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <div style={{ marginTop: "12px", padding: "10px 14px", backgroundColor: "white", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>
                  💡 <strong>Explanation:</strong> {q.explanation}
                </p>
              </div>
            )}
          </div>
        );
      })}

      {!submitted ? (
        <button onClick={handleSubmit}
          style={{ backgroundColor: "#00214D", color: "white", padding: "14px 28px", borderRadius: "8px", fontSize: "15px", fontWeight: "700", cursor: "pointer", border: "none", marginTop: "8px" }}>
          Submit Answers
        </button>
      ) : (
        <div style={{ backgroundColor: score === questions.length ? "#f0fdf4" : score >= questions.length / 2 ? "#fffbeb" : "#fef2f2", borderRadius: "12px", padding: "20px", textAlign: "center", border: "1px solid " + (score === questions.length ? "#86efac" : score >= questions.length / 2 ? "#fcd34d" : "#fca5a5") }}>
          <p style={{ fontSize: "32px", marginBottom: "8px" }}>
            {score === questions.length ? "🎉" : score >= questions.length / 2 ? "👍" : "📖"}
          </p>
          <p style={{ color: "#00214D", fontSize: "18px", fontWeight: "800", marginBottom: "4px" }}>
            {score}/{questions.length} Correct
          </p>
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>
            {score === questions.length
              ? "Perfect score! You really understood this topic. 💯"
              : score >= questions.length / 2
              ? "Good job! Review the ones you missed and you will nail it next time."
              : "Keep studying — re-read the note above and try again."}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main page (client component, fetches data) ──
export default function NotePage({ params }: { params: { code: string; courseId: string; noteId: string } }) {
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [course, setCourse] = useState<any>(null);
  const [programme, setProgramme] = useState<any>(null);
  const [prevNote, setPrevNote] = useState<any>(null);
  const [nextNote, setNextNote] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [marking, setMarking] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/student/note?noteId=${params.noteId}&courseId=${params.courseId}&code=${params.code}`)
      .then(r => r.json())
      .then(d => {
        setNote(d.note);
        setCourse(d.course);
        setProgramme(d.programme);
        setPrevNote(d.prevNote);
        setNextNote(d.nextNote);
        setQuizzes(d.quizzes ?? []);
        setStudentId(d.studentId ?? null);
        setCompleted(d.completed ?? false);
        setLoading(false);
      });
  }, [params.noteId]);

  const markComplete = async () => {
    if (!studentId || completed) return;
    setMarking(true);
    await fetch("/api/student/mark-complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId: params.noteId, courseId: params.courseId }),
    });
    setCompleted(true);
    setMarking(false);
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#6b7280" }}>Loading…</p>
      </div>
    );
  }

  if (!note || !course || !programme) {
    return (
      <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "48px" }}>📭</p>
          <p style={{ color: "#6b7280" }}>Note not found.</p>
          <Link href={`/e-learning/programmes/${params.code}`} style={{ color: "#00214D", fontWeight: "600" }}>← Go back</Link>
        </div>
      </div>
    );
  }

  const levelColour = programme.level === "ND" ? "#2E8B57" : "#00214D";

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${levelColour}, #003d99)`, padding: "clamp(20px,4vw,40px) 24px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Link href={`/e-learning/programmes/${programme.code}/${course.id}`}
            style={{ color: "#FFB81C", fontSize: "12px", fontWeight: "600", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "12px" }}>
            ← {course.code}: {course.title}
          </Link>
          <h1 style={{ color: "white", fontSize: "clamp(16px,4vw,24px)", fontWeight: "800", margin: "0 0 6px" }}>
            Topic {note.topic_number}: {note.title}
          </h1>
          {completed && (
            <span style={{ backgroundColor: "#22c55e", color: "white", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "99px" }}>
              ✓ Completed
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "clamp(24px,5vw,48px) 24px" }}>

        {/* Download buttons */}
        {(note.pdf_url || note.word_url) && (
          <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "10px", padding: "14px 18px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ color: "#92400e", fontSize: "13px", fontWeight: "600" }}>📥 Download this note:</span>
            {note.pdf_url && (
              <a href={note.pdf_url} target="_blank" rel="noopener noreferrer"
                style={{ backgroundColor: "#ef4444", color: "white", padding: "8px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", textDecoration: "none" }}>
                📄 PDF
              </a>
            )}
            {note.word_url && (
              <a href={note.word_url} target="_blank" rel="noopener noreferrer"
                style={{ backgroundColor: "#2563eb", color: "white", padding: "8px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", textDecoration: "none" }}>
                📝 Word
              </a>
            )}
          </div>
        )}

        {/* Note content */}
        <div style={{ backgroundColor: "white", borderRadius: "14px", padding: "clamp(20px,5vw,40px)", border: "1px solid #e5e7eb", lineHeight: "1.8" }}>
          <div
            className="note-content"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </div>

        {/* Quiz */}
        <QuizSection questions={quizzes} studentId={studentId} noteId={note.id} />

        {/* Mark complete + navigation */}
        <div style={{ marginTop: "32px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            {prevNote && (
              <Link href={`/e-learning/programmes/${programme.code}/${course.id}/${prevNote.id}`}
                style={{ backgroundColor: "white", color: "#00214D", padding: "12px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", textDecoration: "none", border: "1px solid #d1d5db", display: "inline-block" }}>
                ← Previous
              </Link>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            {studentId && !completed && (
              <button onClick={markComplete} disabled={marking}
                style={{ backgroundColor: "#2E8B57", color: "white", padding: "12px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer", border: "none" }}>
                {marking ? "Saving…" : "✓ Mark as Complete"}
              </button>
            )}
            {nextNote && (
              <Link href={`/e-learning/programmes/${programme.code}/${course.id}/${nextNote.id}`}
                style={{ backgroundColor: levelColour, color: "white", padding: "12px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", textDecoration: "none", display: "inline-block" }}>
                Next Topic →
              </Link>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .note-content h2 { color: #00214D; font-size: 20px; font-weight: 800; margin: 28px 0 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px; }
        .note-content h3 { color: #374151; font-size: 16px; font-weight: 700; margin: 20px 0 8px; }
        .note-content p  { color: #374151; font-size: 15px; margin: 0 0 14px; }
        .note-content ul, .note-content ol { padding-left: 24px; margin: 0 0 14px; }
        .note-content li { color: #374151; font-size: 15px; margin-bottom: 6px; }
        .note-content strong { color: #00214D; }
        .note-content .highlight-box { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 16px 0; }
        .note-content .example-box  { background: #fffbeb; border-left: 4px solid #FFB81C; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 16px 0; }
        .note-content .warning-box  { background: #fef2f2; border-left: 4px solid #ef4444; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 16px 0; }
        .note-content code { background: #f3f4f6; color: #374151; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; }
        .note-content pre  { background: #1e293b; color: #e2e8f0; padding: 20px; border-radius: 10px; overflow-x: auto; margin: 16px 0; }
        .note-content pre code { background: none; color: inherit; padding: 0; font-size: 13px; }
        .note-content table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        .note-content th { background: #00214D; color: white; padding: 10px 14px; text-align: left; font-size: 13px; }
        .note-content td { padding: 10px 14px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #374151; }
        .note-content tr:nth-child(even) td { background: #f9fafb; }
      `}</style>
    </div>
  );
}
