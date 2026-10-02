"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://asup-jspict-kazaure.vercel.app/reset-password",
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setSent(true);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "32px", width: "100%", maxWidth: "400px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ width: "48px", height: "48px", backgroundColor: "#003366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#FFB81C", fontWeight: "bold", fontSize: "20px" }}>A</div>
          <h1 style={{ color: "#003366", fontSize: "20px", fontWeight: "bold", margin: "0 0 4px" }}>Reset Password</h1>
          <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>We will send a reset link to your email</p>
        </div>

        {sent ? (
          <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "16px", textAlign: "center" }}>
            <p style={{ fontSize: "32px", margin: "0 0 8px" }}>📧</p>
            <p style={{ color: "#166534", fontWeight: "600", margin: "0 0 4px" }}>Reset link sent!</p>
            <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>Check your email and click the link to reset your password.</p>
          </div>
        ) : (
          <>
            {error && <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 12px", borderRadius: "6px", fontSize: "13px", marginBottom: "16px" }}>{error}</div>}
            <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="yourname@jspict.edu.ng"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
              </div>
              <button type="submit" disabled={loading}
                style={{ backgroundColor: "#003366", color: "white", padding: "11px", borderRadius: "6px", border: "none", fontWeight: "bold", fontSize: "14px", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}
        <p style={{ textAlign: "center", fontSize: "13px", color: "#888", margin: "16px 0 0" }}>
          <a href="/login" style={{ color: "#003366", fontWeight: "600" }}>Back to Sign In</a>
        </p>
      </div>
    </div>
  );
}
