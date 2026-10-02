"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState({ full_name: "", role: "", bio: "", department: "" });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    setUserId(data.user?.id ?? "");
    setStep("otp");
    setLoading(false);
  };

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "signup" });
    if (error) { setError(error.message); setLoading(false); return; }
    setStep("profile");
    setLoading(false);
  };

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.from("members").insert({
      full_name: profile.full_name,
      role: profile.role || "Member",
      bio: profile.bio,
      department: profile.department,
      email: email,
      user_id: userId,
      is_approved: false,
      display_order: 999,
    });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/dashboard");
  };

  const eyeBtn = (show: boolean, toggle: () => void) => (
    <button type="button" onClick={toggle}
      style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "16px" }}>
      {show ? "🙈" : "👁️"}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "32px", width: "100%", maxWidth: "420px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ width: "48px", height: "48px", backgroundColor: "#003366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#FFB81C", fontWeight: "bold", fontSize: "20px" }}>A</div>
          <h1 style={{ color: "#003366", fontSize: "20px", fontWeight: "bold", margin: "0 0 4px" }}>
            {step === "form" && "Create Account"}
            {step === "otp" && "Verify Your Email"}
            {step === "profile" && "Complete Your Profile"}
          </h1>
          <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>
            {step === "form" && "ASUP Jigawa ICT Kazaure — Staff Portal"}
            {step === "otp" && `Check ${email} for your 6-digit code`}
            {step === "profile" && "This will appear on the chapter website"}
          </p>
        </div>

        {/* Steps indicator */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "20px" }}>
          {["form", "otp", "profile"].map((s, i) => (
            <div key={s} style={{ flex: 1, height: "3px", borderRadius: "2px", backgroundColor: ["form","otp","profile"].indexOf(step) >= i ? "#003366" : "#e5e7eb" }} />
          ))}
        </div>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 12px", borderRadius: "6px", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {step === "form" && (
          <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="yourname@jspict.edu.ng"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  style={{ width: "100%", padding: "10px 40px 10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
                {eyeBtn(showPassword, () => setShowPassword(!showPassword))}
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{ backgroundColor: "#003366", color: "white", padding: "11px", borderRadius: "6px", border: "none", fontWeight: "bold", fontSize: "14px", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Sending OTP..." : "Continue"}
            </button>
            <p style={{ textAlign: "center", fontSize: "13px", color: "#888", margin: 0 }}>
              Already have an account? <a href="/login" style={{ color: "#003366", fontWeight: "600" }}>Sign in</a>
            </p>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleOtp} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>6-Digit OTP Code</label>
              <input type="text" required value={otp} onChange={e => setOtp(e.target.value)}
                placeholder="123456" maxLength={6}
                style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "24px", textAlign: "center", letterSpacing: "10px", boxSizing: "border-box" }} />
              <p style={{ fontSize: "12px", color: "#888", margin: "6px 0 0" }}>Check your spam folder if you do not see it</p>
            </div>
            <button type="submit" disabled={loading}
              style={{ backgroundColor: "#003366", color: "white", padding: "11px", borderRadius: "6px", border: "none", fontWeight: "bold", fontSize: "14px", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Verifying..." : "Verify Email"}
            </button>
            <button type="button" onClick={() => { setStep("form"); setError(""); }}
              style={{ background: "none", border: "none", color: "#888", fontSize: "13px", cursor: "pointer" }}>
              Back
            </button>
          </form>
        )}

        {step === "profile" && (
          <form onSubmit={handleProfile} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>Full Name (with title)</label>
              <input type="text" required value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                placeholder="Dr. Amina Yusuf"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>Position / Rank</label>
              <select value={profile.role} onChange={e => setProfile(p => ({ ...p, role: e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}>
                <option value="">Select rank</option>
                <option>Professor</option>
                <option>Associate Professor</option>
                <option>Senior Lecturer</option>
                <option>Lecturer I</option>
                <option>Lecturer II</option>
                <option>Lecturer III</option>
                <option>Assistant Lecturer</option>
                <option>Graduate Assistant</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>Department</label>
              <input type="text" value={profile.department} onChange={e => setProfile(p => ({ ...p, department: e.target.value }))}
                placeholder="e.g. Information Technology"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>Brief Biography</label>
              <textarea required value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                placeholder="Your background, qualifications and research interests..."
                rows={4}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }} />
            </div>
            <button type="submit" disabled={loading}
              style={{ backgroundColor: "#FFB81C", color: "#003366", padding: "11px", borderRadius: "6px", border: "none", fontWeight: "bold", fontSize: "14px", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Creating Profile..." : "Complete Registration"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
