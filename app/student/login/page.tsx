"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

export default function StudentLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      window.location.href = "/e-learning";
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0fdf4", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", overflow: "hidden", border: "3px solid #2E8B57", margin: "0 auto 12px", backgroundColor: "white" }}>
            <Image src="/asup-logo.png" alt="ASUP Logo" width={72} height={72} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#00214D", marginBottom: "4px" }}>Student E-Learning Portal</h1>
          <p style={{ color: "#6b7280", fontSize: "13px" }}>JSPICT Kazaure — Access your course materials</p>
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                Student Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="student@jspict.edu.ng"
                required
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            {error && (
              <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", padding: "10px 12px", marginBottom: "16px", fontSize: "13px", color: "#dc2626" }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", backgroundColor: "#2E8B57", color: "white", padding: "12px", borderRadius: "6px", fontSize: "14px", fontWeight: "700", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Signing in..." : "Access E-Learning"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#9ca3af", marginTop: "16px" }}>
          JSPICT students only. Contact your lecturer for access credentials.
        </p>
      </div>
    </div>
  );
}
