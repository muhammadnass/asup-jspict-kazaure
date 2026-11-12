"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

export default function RectorLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    // Check rector role
    const { data: rector } = await supabase
      .from("rector_users")
      .select("id")
      .eq("user_id", data.user?.id)
      .single();
    if (!rector) {
      await supabase.auth.signOut();
      setError("Access denied. This portal is for the Rector only.");
      setLoading(false);
      return;
    }
    window.location.href = "/rector/dashboard";
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f172a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", overflow: "hidden", border: "3px solid #FFB81C", margin: "0 auto 12px", backgroundColor: "white" }}>
            <Image src="/asup-logo.png" alt="ASUP Logo" width={72} height={72} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: "800", color: "white", marginBottom: "4px" }}>Rector Dashboard</h1>
          <p style={{ color: "#94a3b8", fontSize: "13px" }}>JSPICT Kazaure — Administrative Portal</p>
        </div>

        <div style={{ backgroundColor: "#1e293b", borderRadius: "12px", padding: "28px", border: "1px solid #334155" }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#cbd5e1", marginBottom: "6px" }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="rector@jspict.edu.ng"
                required
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #475569", borderRadius: "6px", fontSize: "14px", outline: "none", boxSizing: "border-box", backgroundColor: "#0f172a", color: "white" }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#cbd5e1", marginBottom: "6px" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #475569", borderRadius: "6px", fontSize: "14px", outline: "none", boxSizing: "border-box", backgroundColor: "#0f172a", color: "white" }}
              />
            </div>
            {error && (
              <div style={{ backgroundColor: "#450a0a", border: "1px solid #7f1d1d", borderRadius: "6px", padding: "10px 12px", marginBottom: "16px", fontSize: "13px", color: "#fca5a5" }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", backgroundColor: "#FFB81C", color: "#00214D", padding: "12px", borderRadius: "6px", fontSize: "14px", fontWeight: "700", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Signing in..." : "Access Rector Dashboard"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#64748b", marginTop: "16px" }}>
          Restricted access — Rector of JSPICT Kazaure only.
        </p>
      </div>
    </div>
  );
}
