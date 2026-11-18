"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

const DEPARTMENTS = [
  "Computer Engineering",
  "Computer Science",
  "Electrical/Electronics Engineering",
  "Health Information Management",
  "Library and Information Science",
  "Office Technology and Management",
  "Printing Technology",
  "Statistics",
  "General Studies",
];

const RANKS = [
  "Chief Lecturer",
  "Principal Lecturer",
  "Senior Lecturer",
  "Lecturer I",
  "Lecturer II",
  "Lecturer III",
  "Assistant Lecturer",
];

export default function LecturerRegisterPage() {
  const supabase = createClient();
  const [step, setStep] = useState<"form" | "done">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    department: "",
    rank: "",
    staff_id: "",
    phone: "",
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.email.toLowerCase().endsWith("@jspict.edu.ng")) {
      setError("Only @jspict.edu.ng email addresses are allowed.");
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      // 1. Create auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        setError("Account creation failed. Please try again.");
        setLoading(false);
        return;
      }

      // 2. Insert into members table (same table used for lecturer profiles)
      const { error: memberError } = await supabase.from("members").insert({
        user_id: userId,
        full_name: form.full_name,
        email: form.email,
        role: form.rank || "Lecturer",
        department: form.department,
        phone: form.phone || null,
        staff_id: form.staff_id || null,
        is_approved: false,
        display_order: 999,
      });

      if (memberError) {
        setError(memberError.message);
        setLoading(false);
        return;
      }

      setStep("done");
    } catch {
      setError("Network error. Please try again.");
    }

    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    border: "1.5px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "16px",
    boxSizing: "border-box",
    outline: "none",
    color: "#1a2535",
    backgroundColor: "white",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    display: "block",
    marginBottom: "6px",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "480px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", overflow: "hidden", border: "3px solid #00214D", margin: "0 auto 12px", backgroundColor: "white" }}>
            <Image src="/asup-logo.png" alt="ASUP" width={64} height={64} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <h1 style={{ fontSize: "clamp(18px,5vw,22px)", fontWeight: "800", color: "#00214D", margin: "0 0 4px" }}>
            {step === "form" ? "Lecturer Registration" : "Registration Submitted!"}
          </h1>
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>JSPICT Kazaure — E-Learning Portal</p>
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "clamp(20px,5vw,28px)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>

          {step === "form" && (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {error && (
                <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "13px" }}>
                  {error}
                </div>
              )}

              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" required value={form.full_name}
                  onChange={e => set("full_name", e.target.value)}
                  style={inputStyle} placeholder="e.g. Dr. Amina Yusuf Musa" />
              </div>

              <div>
                <label style={labelStyle}>Institutional Email</label>
                <input type="email" required value={form.email}
                  onChange={e => set("email", e.target.value)}
                  style={inputStyle} placeholder="yourname@jspict.edu.ng" />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={e => set("password", e.target.value)}
                    style={{ ...inputStyle, paddingRight: "44px" }}
                    placeholder="Minimum 6 characters"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "18px", padding: 0 }}>
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Department</label>
                <select required value={form.department}
                  onChange={e => set("department", e.target.value)}
                  style={{ ...inputStyle, backgroundColor: "white" }}>
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Academic Rank</label>
                <select required value={form.rank}
                  onChange={e => set("rank", e.target.value)}
                  style={{ ...inputStyle, backgroundColor: "white" }}>
                  <option value="">Select rank</option>
                  {RANKS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Staff ID <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span></label>
                  <input type="text" value={form.staff_id}
                    onChange={e => set("staff_id", e.target.value)}
                    style={inputStyle} placeholder="e.g. JSPICT/ST/001" />
                </div>
                <div>
                  <label style={labelStyle}>Phone <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span></label>
                  <input type="tel" value={form.phone}
                    onChange={e => set("phone", e.target.value)}
                    style={inputStyle} placeholder="080XXXXXXXX" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                style={{ backgroundColor: "#00214D", color: "white", padding: "14px", borderRadius: "8px", border: "none", fontWeight: "700", fontSize: "15px", cursor: "pointer", opacity: loading ? 0.7 : 1, marginTop: "4px" }}>
                {loading ? "Submitting…" : "Submit Registration"}
              </button>

              <p style={{ textAlign: "center", fontSize: "13px", color: "#9ca3af", margin: 0 }}>
                Already registered?{" "}
                <a href="/lecturer/login" style={{ color: "#00214D", fontWeight: "700", textDecoration: "none" }}>Sign in</a>
              </p>
            </form>
          )}

          {step === "done" && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: "52px", marginBottom: "16px" }}>📋</div>
              <h2 style={{ color: "#00214D", fontWeight: "800", fontSize: "20px", margin: "0 0 12px" }}>Registration Submitted!</h2>
              <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.7", margin: "0 0 24px" }}>
                Your lecturer account is <strong>pending admin approval</strong>. You will be able to sign in and manage course materials once an administrator approves your account.
              </p>
              <div style={{ backgroundColor: "#eff6ff", borderRadius: "10px", padding: "14px 16px", marginBottom: "20px", fontSize: "13px", color: "#1d4ed8" }}>
                💡 Contact your HOD or the ICT unit if approval takes longer than 24 hours.
              </div>
              <a href="/lecturer/login"
                style={{ display: "block", backgroundColor: "#00214D", color: "white", padding: "14px", borderRadius: "8px", textDecoration: "none", fontWeight: "700", fontSize: "15px" }}>
                Go to Sign In →
              </a>
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#9ca3af", marginTop: "16px" }}>
          JSPICT staff only. For help contact the ICT unit.
        </p>
      </div>
    </div>
  );
}
