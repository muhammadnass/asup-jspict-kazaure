"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<"form" | "otp" | "profile">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");

  const [profile, setProfile] = useState({
    full_name: "",
    role: "",
    bio: "",
    email: "",
  });

  // Step 1: Sign up with email — Supabase sends OTP automatically
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: undefined },
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setUserId(data.user?.id ?? "");
    setStep("otp");
    setLoading(false);
  };

  // Step 2: Verify OTP
  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "signup",
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setProfile(p => ({ ...p, email }));
    setStep("profile");
    setLoading(false);
  };

  // Step 3: Create member profile
  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.from("members").insert({
      full_name: profile.full_name,
      role: profile.role || "Member",
      bio: profile.bio,
      email: profile.email,
      user_id: userId,
      is_approved: false,
      display_order: 999,
    });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "32px", width: "100%", maxWidth: "420px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ width: "48px", height: "48px", backgroundColor: "#003366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#FFB81C", fontWeight: "bold", fontSize: "20px" }}>A</div>
          <h1 style={{ color: "#003366", fontSize: "20px", fontWeight: "bold", margin: "0 0 4px" }}>
            {step === "form" && "Create Account"}
            {step === "otp" && "Verify Your Email"}
            {step === "profile" && "Complete Your Profile"}
          </h1>
          <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>
            {step === "form" && "ASUP Jigawa ICT Kazaure — Staff Portal"}
            {step === "otp" && `Enter the 6-digit code sent to ${email}`}
            {step === "profile" && "This will appear on the chapter website"}
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 12px", borderRadius: "6px", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {/* Step 1: Email + Password */}
        {step === "form" && (
          <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>Official Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="yourname@jspict.edu.ng"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
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

        {/* Step 2: OTP */}
        {step === "otp" && (
          <form onSubmit={handleOtp} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>6-Digit OTP Code</label>
              <input type="text" required value={otp} onChange={e => setOtp(e.target.value)}
                placeholder="123456" maxLength={6}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "20px", textAlign: "center", letterSpacing: "8px", boxSizing: "border-box" }} />
            </div>
            <button type="submit" disabled={loading}
              style={{ backgroundColor: "#003366", color: "white", padding: "11px", borderRadius: "6px", border: "none", fontWeight: "bold", fontSize: "14px", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Verifying..." : "Verify Email"}
            </button>
            <button type="button" onClick={() => setStep("form")}
              style={{ background: "none", border: "none", color: "#888", fontSize: "13px", cursor: "pointer" }}>
              ← Back
            </button>
          </form>
        )}

        {/* Step 3: Profile */}
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
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>Brief Biography</label>
              <textarea required value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                placeholder="Your background, research interests, and achievements..."
                rows={4}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }} />
            </div>
            <button type="submit" disabled={loading}
              style={{ backgroundColor: "#003366", color: "white", padding: "11px", borderRadius: "6px", border: "none", fontWeight: "bold", fontSize: "14px", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Saving..." : "Complete Registration"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
