"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError("Incorrect email or password."); setLoading(false); return; }
    router.push("/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "32px", width: "100%", maxWidth: "400px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ width: "48px", height: "48px", backgroundColor: "#003366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#FFB81C", fontWeight: "bold", fontSize: "20px" }}>A</div>
          <h1 style={{ color: "#003366", fontSize: "20px", fontWeight: "bold", margin: "0 0 4px" }}>Member Sign In</h1>
          <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>ASUP Jigawa ICT Kazaure Staff Portal</p>
        </div>
        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 12px", borderRadius: "6px", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                style={{ width: "100%", padding: "10px 40px 10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "16px" }}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <a href="/forgot-password" style={{ color: "#003366", fontSize: "12px", textDecoration: "none" }}>Forgot password?</a>
          </div>
          <button type="submit" disabled={loading}
            style={{ backgroundColor: "#003366", color: "white", padding: "11px", borderRadius: "6px", border: "none", fontWeight: "bold", fontSize: "14px", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p style={{ textAlign: "center", fontSize: "13px", color: "#888", margin: "16px 0 0" }}>
          No account yet? <a href="/register" style={{ color: "#003366", fontWeight: "600" }}>Create one here</a>
        </p>
        <p style={{ textAlign: "center", fontSize: "13px", color: "#888", margin: "8px 0 0" }}>
          Admin? <a href="/admin/login" style={{ color: "#003366", fontWeight: "600" }}>Admin portal</a>
        </p>
      </div>
    </div>
  );
}
