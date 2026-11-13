"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

type Question = {
  id: string;
  question_number: number;
  question_text: string;
  question_type: "mcq" | "truefalse";
  options: string[];  // already shuffled server-side
};

type AttemptData = {
  attemptId: string;
  questions: Question[];
  durationMins: number;
  title: string;
  courseCode: string;
  instructions: string;
  startedAt: string;
};

type Screen = "loading" | "device-block" | "confirm" | "test" | "result" | "error";

export default function TestPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const router = useRouter();

  const [screen, setScreen] = useState<Screen>("loading");
  const [attemptData, setAttemptData] = useState<AttemptData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [tabWarning, setTabWarning] = useState(false);
  const submitRef = useRef(false);

  // Desktop-only check
  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 1024;
    if (isMobile) { setScreen("device-block"); return; }
    setScreen("confirm");
  }, []);

  // Tab-switch detection
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && screen === "test") {
        setTabSwitches(prev => prev + 1);
        setTabWarning(true);
        setTimeout(() => setTabWarning(false), 4000);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [screen]);

  // Block right-click and keyboard shortcuts during test
  useEffect(() => {
    if (screen !== "test") return;
    const blockCtx = (e: MouseEvent) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      if (e.ctrlKey && ["c","v","a","u","s","p"].includes(e.key.toLowerCase())) e.preventDefault();
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && ["i","j","c"].includes(e.key.toLowerCase()))) e.preventDefault();
    };
    document.addEventListener("contextmenu", blockCtx);
    document.addEventListener("keydown", blockKeys);
    return () => { document.removeEventListener("contextmenu", blockCtx); document.removeEventListener("keydown", blockKeys); };
  }, [screen]);

  const submitTest = useCallback(async (auto = false) => {
    if (!attemptData || submitRef.current) return;
    submitRef.current = true;
    setSubmitting(true);
    try {
      const r = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: attemptData.attemptId, answers, tabSwitches }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error ?? "Submission failed"); setSubmitting(false); submitRef.current = false; return; }
      setResult({ ...data, auto });
      setScreen("result");
    } catch {
      setError("Network error. Please try again."); setSubmitting(false); submitRef.current = false;
    }
  }, [attemptData, answers, tabSwitches]);

  // Countdown timer
  useEffect(() => {
    if (screen !== "test" || !attemptData) return;
    const startedAt = new Date(attemptData.startedAt).getTime();
    const endAt = startedAt + attemptData.durationMins * 60 * 1000;

    const tick = () => {
      const remaining = Math.max(0, Math.floor((endAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0 && !submitRef.current) submitTest(true);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [screen, attemptData, submitTest]);

  const startTest = async () => {
    setScreen("loading");
    try {
      // Start/resume attempt
      const startRes = await fetch("/api/assessment/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId }),
      });
      const startData = await startRes.json();
      if (!startRes.ok) { setError(startData.error ?? "Could not start assessment"); setScreen("error"); return; }

      // Fetch questions for this attempt
      const qRes = await fetch(`/api/assessment/attempt?attemptId=${startData.attemptId}`);
      const qData = await qRes.json();
      if (!qRes.ok) { setError(qData.error ?? "Could not load questions"); setScreen("error"); return; }

      setAttemptData({
        attemptId: startData.attemptId,
        questions: qData.questions,
        durationMins: qData.durationMins,
        title: qData.title,
        courseCode: qData.courseCode,
        instructions: qData.instructions,
        startedAt: qData.startedAt,
      });
      setScreen("test");
    } catch {
      setError("Network error. Please check your connection."); setScreen("error");
    }
  };

  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const timeColor = timeLeft < 300 ? "#dc2626" : timeLeft < 600 ? "#d97706" : "#166534";
  const answered = Object.keys(answers).length;
  const total = attemptData?.questions.length ?? 0;

  // --- DEVICE BLOCK ---
  if (screen === "device-block") return (
    <div style={{ minHeight: "100vh", backgroundColor: "#00214D", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "40px", maxWidth: "480px", textAlign: "center" }}>
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>🖥️</div>
        <h1 style={{ color: "#00214D", fontSize: "22px", fontWeight: "800", marginBottom: "12px" }}>Desktop Only</h1>
        <p style={{ color: "#374151", fontSize: "15px", lineHeight: "1.6", marginBottom: "20px" }}>
          This assessment must be taken on a <strong>desktop or laptop computer</strong>. Smartphones and tablets are not allowed.
        </p>
        <p style={{ color: "#6b7280", fontSize: "13px" }}>
          Please go to a computer lab or use your personal laptop to access this test.
        </p>
      </div>
    </div>
  );

  // --- LOADING ---
  if (screen === "loading") return (
    <div style={{ minHeight: "100vh", backgroundColor: "#00214D", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "white" }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
        <p style={{ fontSize: "16px", fontWeight: "600" }}>Loading assessment…</p>
      </div>
    </div>
  );

  // --- ERROR ---
  if (screen === "error") return (
    <div style={{ minHeight: "100vh", backgroundColor: "#00214D", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "40px", maxWidth: "480px", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
        <h2 style={{ color: "#dc2626", fontSize: "20px", fontWeight: "700", marginBottom: "12px" }}>Cannot Start Assessment</h2>
        <p style={{ color: "#374151", fontSize: "14px", marginBottom: "24px" }}>{error}</p>
        <button onClick={() => router.push("/e-learning")} style={{ backgroundColor: "#00214D", color: "white", padding: "12px 28px", borderRadius: "8px", fontWeight: "700", border: "none", cursor: "pointer", fontSize: "14px" }}>
          Go Back
        </button>
      </div>
    </div>
  );

  // --- CONFIRM ---
  if (screen === "confirm") return (
    <div style={{ minHeight: "100vh", backgroundColor: "#00214D", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "40px", maxWidth: "520px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>📝</div>
          <h1 style={{ color: "#00214D", fontSize: "22px", fontWeight: "800" }}>Assessment Ready</h1>
        </div>

        <div style={{ backgroundColor: "#f9fafb", borderRadius: "10px", padding: "16px 20px", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
            <span style={{ color: "#6b7280" }}>Assessment ID</span>
            <span style={{ fontWeight: "700", color: "#00214D", fontFamily: "monospace", fontSize: "12px" }}>{assessmentId}</span>
          </div>
        </div>

        <div style={{ backgroundColor: "#fef3c7", border: "1px solid #fcd34d", borderRadius: "10px", padding: "14px 16px", marginBottom: "24px", fontSize: "13px", color: "#92400e" }}>
          <strong>⚠️ Rules:</strong>
          <ul style={{ marginTop: "8px", paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "4px" }}>
            <li>Once you start, the timer cannot be paused.</li>
            <li>Switching tabs is detected and recorded as malpractice.</li>
            <li>Do not close this window during the test.</li>
            <li>Your answers are saved automatically.</li>
          </ul>
        </div>

        <button onClick={startTest}
          style={{ width: "100%", backgroundColor: "#00214D", color: "white", padding: "16px", borderRadius: "10px", fontWeight: "800", fontSize: "16px", border: "none", cursor: "pointer" }}>
          Start Assessment →
        </button>
      </div>
    </div>
  );

  // --- RESULT ---
  if (screen === "result" && result) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#00214D", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "40px", maxWidth: "480px", width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>{result.grade === "F" ? "😔" : result.grade === "A" ? "🏆" : "✅"}</div>
        {result.auto && (
          <div style={{ backgroundColor: "#fef3c7", border: "1px solid #fcd34d", borderRadius: "8px", padding: "10px", marginBottom: "16px", fontSize: "13px", color: "#92400e" }}>
            ⏰ Time expired — your answers were automatically submitted.
          </div>
        )}
        <h1 style={{ color: "#00214D", fontSize: "24px", fontWeight: "800", marginBottom: "8px" }}>
          Grade: <span style={{ color: result.grade === "F" ? "#dc2626" : result.grade === "A" ? "#166534" : "#1d4ed8" }}>{result.grade}</span>
        </h1>
        <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>{result.remark}</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "28px" }}>
          {[
            { label: "Score", value: `${result.score} / ${result.totalMarks}` },
            { label: "Percentage", value: `${result.percentage}%` },
            { label: "Tab Switches", value: tabSwitches },
            { label: "Questions", value: total },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: "#f9fafb", borderRadius: "10px", padding: "16px", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: "22px", fontWeight: "800", color: "#00214D" }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: "#f9fafb", borderRadius: "10px", padding: "14px", fontSize: "12px", color: "#6b7280", marginBottom: "24px", textAlign: "left" }}>
          <strong style={{ color: "#374151" }}>NBTE Grading Scale:</strong><br />
          A=70-100% · B=60-69% · C=50-59% · D=45-49% · F=Below 45%
        </div>

        <p style={{ color: "#9ca3af", fontSize: "12px" }}>
          Your result has been recorded. You may now close this window.
        </p>
      </div>
    </div>
  );

  // --- TEST SCREEN ---
  if (screen !== "test" || !attemptData) return null;
  const q = attemptData.questions[currentQ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#00214D", display: "flex", flexDirection: "column", userSelect: "none" }}>
      {/* Tab switch warning */}
      {tabWarning && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, backgroundColor: "#dc2626", color: "white", padding: "14px 24px", textAlign: "center", fontWeight: "700", fontSize: "15px", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
          ⚠️ Tab switch detected! This has been recorded. ({tabSwitches} total)
        </div>
      )}

      {/* Top bar */}
      <div style={{ backgroundColor: "#001830", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <span style={{ color: "#93c5fd", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>Assessment</span>
          <div style={{ color: "white", fontSize: "14px", fontWeight: "700" }}>{attemptData.courseCode} — {attemptData.title}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: timeColor, fontSize: "32px", fontWeight: "800", fontFamily: "monospace", lineHeight: 1 }}>{fmtTime(timeLeft)}</div>
          <div style={{ color: "#6b7280", fontSize: "10px" }}>Time Remaining</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "white", fontSize: "14px", fontWeight: "700" }}>Q {currentQ + 1} / {total}</div>
          <div style={{ color: "#6b7280", fontSize: "11px" }}>{answered} answered</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: "4px", backgroundColor: "#1e3a5f" }}>
        <div style={{ height: "100%", backgroundColor: "#3b82f6", width: `${total > 0 ? (answered / total) * 100 : 0}%`, transition: "width 0.3s" }} />
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Question navigator sidebar */}
        <div style={{ width: "180px", backgroundColor: "#001830", padding: "16px 12px", overflowY: "auto", flexShrink: 0 }}>
          <p style={{ color: "#6b7280", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>Questions</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
            {attemptData.questions.map((_, i) => {
              const qId = attemptData.questions[i].id;
              const ans = answers[qId];
              const isCurrent = i === currentQ;
              return (
                <button key={i} onClick={() => setCurrentQ(i)}
                  style={{
                    width: "32px", height: "32px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", border: "none", cursor: "pointer",
                    backgroundColor: isCurrent ? "#3b82f6" : ans ? "#22c55e" : "#1e3a5f",
                    color: "white",
                  }}>
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question content */}
        <div style={{ flex: 1, padding: "32px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ maxWidth: "760px", width: "100%" }}>
            {/* Question badge */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <span style={{ backgroundColor: "#1e3a5f", color: "#93c5fd", fontSize: "11px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px" }}>
                Question {currentQ + 1} of {total}
              </span>
              <span style={{ backgroundColor: q.question_type === "mcq" ? "#1e40af" : "#78350f", color: "white", fontSize: "11px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px" }}>
                {q.question_type === "mcq" ? "Multiple Choice" : "True / False"}
              </span>
            </div>

            {/* Question text */}
            <div style={{ backgroundColor: "#001830", borderRadius: "12px", padding: "24px", marginBottom: "20px", border: "1px solid #1e3a5f" }}>
              <p style={{ color: "white", fontSize: "17px", fontWeight: "600", lineHeight: "1.7" }}>{q.question_text}</p>
            </div>

            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {q.options.map((opt, oi) => {
                const isSelected = answers[q.id] === opt;
                return (
                  <button key={oi} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                    style={{
                      padding: "16px 20px", borderRadius: "10px", textAlign: "left", fontSize: "15px", fontWeight: isSelected ? "700" : "400", cursor: "pointer", transition: "all 0.15s",
                      backgroundColor: isSelected ? "#1d4ed8" : "#1e3a5f",
                      color: "white",
                      border: isSelected ? "2px solid #60a5fa" : "2px solid transparent",
                    }}>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Nav buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "32px" }}>
              <button onClick={() => setCurrentQ(i => Math.max(0, i - 1))} disabled={currentQ === 0}
                style={{ padding: "12px 24px", borderRadius: "8px", fontWeight: "700", fontSize: "14px", cursor: "pointer", backgroundColor: "transparent", color: currentQ === 0 ? "#1e3a5f" : "#93c5fd", border: `1px solid ${currentQ === 0 ? "#1e3a5f" : "#93c5fd"}` }}>
                ← Previous
              </button>

              {currentQ < total - 1 ? (
                <button onClick={() => setCurrentQ(i => Math.min(total - 1, i + 1))}
                  style={{ padding: "12px 24px", borderRadius: "8px", fontWeight: "700", fontSize: "14px", cursor: "pointer", backgroundColor: "#1d4ed8", color: "white", border: "none" }}>
                  Next →
                </button>
              ) : (
                <button onClick={() => {
                  if (window.confirm(`Submit test? You've answered ${answered}/${total} questions. This cannot be undone.`)) submitTest();
                }} disabled={submitting}
                  style={{ padding: "12px 28px", borderRadius: "8px", fontWeight: "800", fontSize: "14px", cursor: "pointer", backgroundColor: "#22c55e", color: "white", border: "none" }}>
                  {submitting ? "Submitting…" : "✓ Submit Test"}
                </button>
              )}
            </div>

            {/* Submit all from anywhere */}
            {currentQ < total - 1 && answered > 0 && (
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <button onClick={() => {
                  if (window.confirm(`Submit test now? You've answered ${answered}/${total} questions.`)) submitTest();
                }} disabled={submitting}
                  style={{ padding: "10px 24px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", backgroundColor: "transparent", color: "#22c55e", border: "1px solid #22c55e" }}>
                  {submitting ? "Submitting…" : "✓ Submit Now"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
