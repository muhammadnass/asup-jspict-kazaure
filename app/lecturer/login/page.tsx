"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

export default function LecturerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Check member record exists and is approved
    const { data: member } = await supabase
      .from("members")
      .select("is_approved")
      .eq("user_id", data.user.id)
      .single();

    if (!member) {
      await supabase.auth.signOut();
      setError("No lecturer account found. Please register first.");
      setLoading(false);
      return;
    }

    if (!member.is_approved) {
      await supabase.auth.signOut();
      setError("Your account is pending admin approval. Please check back soon.");
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 13px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    color: "#1a2535",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#eff6ff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", overflow: "hidden", border: "3px solid #00214D", margin: "0 auto 12px", backgroundColor: "white" }}>
            <Image src="/asup-logo.png" alt="ASUP Logo" width={72} height={72} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#00214D", marginBottom: "4px" }}>Lecturer Portal</h1>
          <p style={{ color: "#6b7280", fontSize: "13px" }}>JSPICT Kazaure — Manage your course materials</p>
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {error && (
              <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", padding: "10px 12px", fontSize: "13px", color: "#dc2626" }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                Institutional Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="yourname@jspict.edu.ng"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: "#00214D", color: "white", padding: "13px", borderRadius: "6px", fontSize: "15px", fontWeight: "700", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: "13px", color: "#9ca3af", marginTop: "16px" }}>
          New lecturer?{" "}
          <a href="/lecturer/register" style={{ color: "#00214D", fontWeight: "700", textDecoration: "none" }}>Create account →</a>
        </p>
      </div>
    </div>
  );
}
