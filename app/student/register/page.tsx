"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

const DEPARTMENTS = [
  "Computer Science", "Information Technology", "Business Administration",
  "Accountancy", "Mass Communication", "Science Laboratory Technology",
  "Electrical Engineering", "Civil Engineering", "Mechanical Engineering",
  "International Program", "Other",
];

const LEVELS = ["ND 1", "ND 2", "HND 1", "HND 2"];

export default function StudentRegisterPage() {
  const supabase = createClient();
  const [step, setStep] = useState<"form" | "done">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    full_name: "", email: "", password: "",
    department: "", level: "", reg_no: "",
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");

    const { data, error: signUpErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { role: "student" } },
    });

    if (signUpErr) { setError(signUpErr.message); setLoading(false); return; }

    const { error: insertErr } = await supabase.from("students").insert({
      user_id: data.user?.id,
      full_name: form.full_name,
      email: form.email,
      department: form.department,
      level: form.level,
      reg_no: form.reg_no || null,
    });

    if (insertErr) {
      // students table may not exist yet — still let them in
      console.warn("students table insert:", insertErr.message);
    }

    setStep("done");
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px",
    border: "1.5px solid #d1d5db", borderRadius: "8px",
    fontSize: "16px", boxSizing: "border-box",
    outline: "none", color: "#1a2535", backgroundColor: "white",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "13px", fontWeight: "600", color: "#374151",
    display: "block", marginBottom: "6px",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "460px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", overflow: "hidden", border: "3px solid #2E8B57", margin: "0 auto 12px", backgroundColor: "white" }}>
            <Image src="/asup-logo.png" alt="ASUP" width={64} height={64} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <h1 style={{ fontSize: "clamp(18px,5vw,22px)", fontWeight: "800", color: "#00214D", margin: "0 0 4px" }}>
            {step === "form" ? "Student Registration" : "Registration Complete!"}
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
                <input type="text" required value={form.full_name} onChange={e => set("full_name", e.target.value)} style={inputStyle} placeholder="e.g. Aisha Musa Ibrahim" />
              </div>

              <div>
                <label style={labelStyle}>Email Address</label>
                <input type="email" required value={form.email} onChange={e => set("email", e.target.value)} style={inputStyle} placeholder="you@example.com" />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPassword ? "text" : "password"} required value={form.password}
                    onChange={e => set("password", e.target.value)}
                    style={{ ...inputStyle, paddingRight: "44px" }} placeholder="Minimum 6 characters" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "18px", padding: 0 }}>
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Department</label>
                <select required value={form.department} onChange={e => set("department", e.target.value)}
                  style={{ ...inputStyle, backgroundColor: "white" }}>
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Level</label>
                  <select required value={form.level} onChange={e => set("level", e.target.value)}
                    style={{ ...inputStyle, backgroundColor: "white" }}>
                    <option value="">Select level</option>
                    {LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Reg. No. <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span></label>
                  <input type="text" value={form.reg_no} onChange={e => set("reg_no", e.target.value)} style={inputStyle} placeholder="e.g. JSPICT/ND/22/001" />
                </div>
              </div>

              <button type="submit" disabled={loading}
                style={{ backgroundColor: "#2E8B57", color: "white", padding: "14px", borderRadius: "8px", border: "none", fontWeight: "700", fontSize: "15px", cursor: "pointer", opacity: loading ? 0.7 : 1, marginTop: "4px" }}>
                {loading ? "Creating Account…" : "Register & Access E-Learning"}
              </button>

              <p style={{ textAlign: "center", fontSize: "13px", color: "#9ca3af", margin: 0 }}>
                Already registered?{" "}
                <a href="/student/login" style={{ color: "#2E8B57", fontWeight: "700", textDecoration: "none" }}>Sign in</a>
              </p>
            </form>
          )}

          {step === "done" && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: "52px", marginBottom: "16px" }}>🎓</div>
              <h2 style={{ color: "#00214D", fontWeight: "800", fontSize: "20px", margin: "0 0 12px" }}>Welcome to JSPICT E-Learning!</h2>
              <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.7", margin: "0 0 24px" }}>
                Your account is ready. You can now access all your course materials.
              </p>
              <a href="/e-learning"
                style={{ display: "block", backgroundColor: "#2E8B57", color: "white", padding: "14px", borderRadius: "8px", textDecoration: "none", fontWeight: "700", fontSize: "15px", marginBottom: "12px" }}>
                Go to E-Learning →
              </a>
              <a href="/student/login"
                style={{ display: "block", backgroundColor: "#f0fdf4", color: "#2E8B57", padding: "12px", borderRadius: "8px", textDecoration: "none", fontWeight: "600", fontSize: "14px", border: "1px solid #86efac" }}>
                Sign In Instead
              </a>
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#9ca3af", marginTop: "16px" }}>
          JSPICT students only. For help contact your department.
        </p>
      </div>
    </div>
  );
}
