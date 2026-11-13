"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const DEPARTMENTS = [
  "Computer Science","Computer Engineering","Electrical/Electronics Engineering",
  "Health Information Management","Library and Information Science",
  "Office Technology and Management","Printing Technology","Statistics",
];

export default function ExaminerRegisterPage() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", department: "", staff_id: "", institution: "Jos State Polytechnic", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true); setError("");
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({ email: form.email, password: form.password });
    if (authError) { setError(authError.message); setLoading(false); return; }
    const { error: profileError } = await supabase.from("examiner_users").insert({
      id: data.user?.id,
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      department: form.department,
      staff_id: form.staff_id,
      institution: form.institution,
      approved: false,
    });
    if (profileError) { setError(profileError.message); setLoading(false); return; }
    setDone(true);
  };

  if (done) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f4f8", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "40px", maxWidth: "420px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
        <h2 style={{ color: "#00214D", fontSize: "20px", fontWeight: "800" }}>Registration Submitted</h2>
        <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "12px" }}>Your Examiner account is <strong>pending admin approval</strong>. You will be notified once access is granted.</p>
        <a href="/examiner/login" style={{ display: "inline-block", marginTop: "24px", backgroundColor: "#00214D", color: "white", padding: "12px 28px", borderRadius: "8px", fontWeight: "700", textDecoration: "none", fontSize: "14px" }}>
          Back to Login
        </a>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f4f8", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "480px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ width: "56px", height: "56px", backgroundColor: "#1e3a5f", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: "24px" }}>🔍</div>
          <h1 style={{ color: "#00214D", fontSize: "22px", fontWeight: "800" }}>Examiner Registration</h1>
          <p style={{ color: "#6b7280", fontSize: "13px" }}>Jos State Polytechnic ICT Department</p>
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          {error && <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 12px", marginBottom: "14px", color: "#dc2626", fontSize: "13px" }}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { label: "Full Name", key: "full_name", placeholder: "Prof. Aminu Bello", type: "text" },
              { label: "Email Address", key: "email", placeholder: "examiner@institution.edu.ng", type: "email" },
              { label: "Phone Number", key: "phone", placeholder: "08012345678", type: "tel" },
              { label: "Staff ID / ICAN No.", key: "staff_id", placeholder: "EX/JSPICT/001", type: "text" },
              { label: "Institution", key: "institution", placeholder: "Jos State Polytechnic", type: "text" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ color: "#374151", fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "5px" }}>{f.label}</label>
                <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))} required placeholder={f.placeholder}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }} />
              </div>
            ))}
            <div>
              <label style={{ color: "#374151", fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "5px" }}>Department to Examine</label>
              <select value={form.department} onChange={e => setForm(x => ({ ...x, department: e.target.value }))} required
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }}>
                <option value="">Select department…</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color: "#374151", fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "5px" }}>Password</label>
              <input type="password" value={form.password} onChange={e => setForm(x => ({ ...x, password: e.target.value }))} required placeholder="Min. 8 characters"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }} />
            </div>
            <div>
              <label style={{ color: "#374151", fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "5px" }}>Confirm Password</label>
              <input type="password" value={form.confirm} onChange={e => setForm(x => ({ ...x, confirm: e.target.value }))} required placeholder="Repeat password"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }} />
            </div>
            <button type="submit" disabled={loading}
              style={{ backgroundColor: "#00214D", color: "white", padding: "13px", borderRadius: "9px", fontWeight: "700", fontSize: "15px", border: "none", cursor: "pointer", marginTop: "4px" }}>
              {loading ? "Registering…" : "Register Account"}
            </button>
          </form>

          <div style={{ marginTop: "16px", textAlign: "center", fontSize: "13px", color: "#6b7280" }}>
            Already have an account? <a href="/examiner/login" style={{ color: "#00214D", fontWeight: "600", textDecoration: "none" }}>Sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
}
