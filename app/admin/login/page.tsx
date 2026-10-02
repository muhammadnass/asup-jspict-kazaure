"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { signIn } from "@/lib/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}
      style={{ width: "100%", backgroundColor: "#003366", color: "white", padding: "11px", borderRadius: "6px", border: "none", fontWeight: "bold", fontSize: "14px", cursor: "pointer", opacity: pending ? 0.7 : 1 }}>
      {pending ? "Signing in..." : "Sign In"}
    </button>
  );
}

export default function AdminLoginPage() {
  const [state, formAction] = useFormState(signIn, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "32px", width: "100%", maxWidth: "400px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ width: "48px", height: "48px", backgroundColor: "#003366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#FFB81C", fontWeight: "bold", fontSize: "20px" }}>A</div>
          <h1 style={{ color: "#003366", fontSize: "20px", fontWeight: "bold", margin: "0 0 4px" }}>Admin Sign In</h1>
          <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>Chapter secretary access only</p>
        </div>

        {state?.error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 12px", borderRadius: "6px", fontSize: "13px", marginBottom: "16px" }}>
            {state.error}
          </div>
        )}

        <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>Email</label>
            <input type="email" name="email" required
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} name="password" required
                style={{ width: "100%", padding: "10px 40px 10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "16px" }}>
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          <SubmitButton />
        </form>
        <p style={{ textAlign: "center", fontSize: "13px", color: "#888", margin: "16px 0 0" }}>
          Staff member? <a href="/login" style={{ color: "#003366", fontWeight: "600" }}>Member portal</a>
        </p>
      </div>
    </div>
  );
}
