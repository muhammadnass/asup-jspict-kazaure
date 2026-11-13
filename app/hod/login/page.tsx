"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function HodLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError(authError.message); setLoading(false); return; }
    // Verify HOD profile exists
    const { data: hod } = await supabase.from("hod_users").select("id, approved").eq("email", email).single();
    if (!hod) { await supabase.auth.signOut(); setError("No HOD account found for this email."); setLoading(false); return; }
    if (!hod.approved) { await supabase.auth.signOut(); setError("Your HOD account is pending admin approval."); setLoading(false); return; }
    router.push("/hod/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f4f8", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "64px", height: "64px", backgroundColor: "#00214D", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "28px" }}>🏛️</div>
          <h1 style={{ color: "#00214D", fontSize: "24px", fontWeight: "800" }}>HOD Portal</h1>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>Jos State Polytechnic ICT Department</p>
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "32px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <h2 style={{ color: "#00214D", fontSize: "18px", fontWeight: "700", marginBottom: "24px" }}>Head of Department Sign In</h2>

          {error && (
            <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px", marginBottom: "16px", color: "#dc2626", fontSize: "13px" }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ color: "#374151", fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="hod@jspict.edu.ng"
                style={{ width: "100%", padding: "12px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none" }} />
            </div>
            <div>
              <label style={{ color: "#374151", fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "6px" }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                style={{ width: "100%", padding: "12px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none" }} />
            </div>
            <button type="submit" disabled={loading}
              style={{ backgroundColor: "#00214D", color: "white", padding: "14px", borderRadius: "10px", fontWeight: "700", fontSize: "15px", border: "none", cursor: loading ? "not-allowed" : "pointer", marginTop: "8px", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div style={{ marginTop: "20px", textAlign: "center", fontSize: "13px", color: "#6b7280" }}>
            Don&apos;t have an account?{" "}
            <a href="/hod/register" style={{ color: "#00214D", fontWeight: "600", textDecoration: "none" }}>Register here</a>
          </div>
          <div style={{ marginTop: "12px", textAlign: "center", fontSize: "12px", color: "#9ca3af" }}>
            <a href="/members/login" style={{ color: "#6b7280" }}>Lecturer login</a> · <a href="/examiner/login" style={{ color: "#6b7280" }}>Examiner login</a>
          </div>
        </div>
      </div>
    </div>
  );
}
