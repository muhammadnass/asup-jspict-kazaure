"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

const RANKS = [
  "Chief Lecturer","Principal Lecturer","Senior Lecturer",
  "Lecturer I","Lecturer II","Lecturer III","Assistant Lecturer",
];

async function extractTextFromPDF(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
        // @ts-ignore
        const pdfjsLib = window["pdfjs-dist/build/pdf"];
        if (!pdfjsLib) { resolve(""); return; }
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
        let text = "";
        for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(" ") + "\n";
        }
        resolve(text.slice(0, 4000));
      } catch { resolve(""); }
    };
    reader.readAsArrayBuffer(file);
  });
}

function summariseCVText(raw: string): string {
  if (!raw.trim()) return "";
  const lines = raw.split(/\n+/).map(l => l.trim()).filter(l => l.length > 20);
  const junkRe = /^(name|email|phone|address|tel|mobile|contact|curriculum vitae|cv|resume)\b/i;
  const clean = lines.filter(l => !junkRe.test(l));
  const profileIdx = clean.findIndex(l => /profile|summary|objective|about/i.test(l));
  if (profileIdx >= 0 && clean[profileIdx + 1]) {
    const section = clean.slice(profileIdx + 1, profileIdx + 5).join(" ");
    if (section.length > 80) return section.slice(0, 600);
  }
  const degrees = clean.filter(l => /(phd|ph\.d|doctorate|msc|m\.sc|mba|bsc|b\.sc|bachelor|master|degree)/i.test(l));
  const interests = clean.filter(l => /research|speciali[sz]|interest|focus/i.test(l));
  const combined = [...new Set([...degrees, ...interests, ...clean.slice(0, 6)])];
  return combined.join(" ").replace(/\s{2,}/g, " ").slice(0, 600);
}

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const cvInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState({
    full_name: "", role: "", bio: "", department: "", phone: "", whatsapp: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvExtracting, setCvExtracting] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    setUserId(data.user?.id ?? "");
    setStep("profile"); setLoading(false);
  };

  const handleCVChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvFile(file);
    if (file.type === "application/pdf") {
      setCvExtracting(true);
      if (!(window as any)["pdfjs-dist/build/pdf"]) {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        document.head.appendChild(script);
        await new Promise<void>((res) => { script.onload = () => res(); });
      }
      const raw = await extractTextFromPDF(file);
      const bio = summariseCVText(raw);
      if (bio) setProfile((p) => ({ ...p, bio }));
      setCvExtracting(false);
    }
  };

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    let cv_url: string | null = null;
    if (cvFile) {
      setUploadingCV(true);
      const ext = cvFile.name.split(".").pop();
      const path = `${userId}/cv.${ext}`;
      const { error: upErr } = await supabase.storage.from("member-cvs").upload(path, cvFile, { upsert: true });
      if (!upErr) {
        const { data } = supabase.storage.from("member-cvs").getPublicUrl(path);
        cv_url = data.publicUrl;
      }
      setUploadingCV(false);
    }
    const { error } = await supabase.from("members").insert({
      full_name: profile.full_name,
      role: profile.role || "Member",
      bio: profile.bio,
      department: profile.department,
      phone: profile.phone || null,
      whatsapp: profile.whatsapp || null,
      email: email,
      user_id: userId,
      is_approved: false,
      display_order: 999,
      cv_url,
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setStep("done"); setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", border: "1.5px solid #d1d5db",
    borderRadius: "8px", fontSize: "16px", boxSizing: "border-box",
    outline: "none", color: "#1a2535", backgroundColor: "white",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "13px", fontWeight: "600", color: "#374151",
    display: "block", marginBottom: "6px",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f4f8", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" defer />
      <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "clamp(20px,5vw,32px) clamp(16px,5vw,28px)", width: "100%", maxWidth: "480px", boxShadow: "0 8px 32px rgba(0,33,77,0.12)" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", overflow: "hidden", margin: "0 auto 12px", border: "2px solid #2E8B57" }}>
            <Image src="/asup-logo.png" alt="ASUP" width={56} height={56} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <h1 style={{ color: "#00214D", fontSize: "clamp(18px,5vw,22px)", fontWeight: "800", margin: "0 0 4px" }}>
            {step === "form" ? "Create Account" : step === "profile" ? "Complete Your Profile" : "Registration Submitted"}
          </h1>
          <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>ASUP JSPICT Kazaure Chapter — Staff Portal</p>
        </div>

        {step !== "done" && (
          <div style={{ display: "flex", gap: "4px", marginBottom: "24px" }}>
            {["form", "profile"].map((s, i) => (
              <div key={s} style={{ flex: 1, height: "4px", borderRadius: "2px", backgroundColor: ["form","profile"].indexOf(step) >= i ? "#2E8B57" : "#e2e8f0", transition: "background-color 0.3s" }} />
            ))}
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {step === "form" && (
          <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="you@jspict.edu.ng" />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: "44px" }} placeholder="Minimum 6 characters" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "18px", padding: 0 }}>
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{ backgroundColor: "#00214D", color: "white", padding: "14px", borderRadius: "8px", border: "none", fontWeight: "700", fontSize: "15px", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Creating Account…" : "Continue →"}
            </button>
            <p style={{ textAlign: "center", fontSize: "13px", color: "#9ca3af", margin: 0 }}>
              Already registered?{" "}
              <a href="/members/login" style={{ color: "#2E8B57", fontWeight: "700", textDecoration: "none" }}>Sign in</a>
            </p>
          </form>
        )}

        {step === "profile" && (
          <form onSubmit={handleProfile} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#166534" }}>
              ✅ Account created! Complete your profile below.
            </div>
            <div>
              <label style={labelStyle}>Full Name <span style={{ color: "#9ca3af", fontWeight: "400" }}>(include title e.g. Dr., Mr., Mrs.)</span></label>
              <input type="text" required value={profile.full_name} onChange={(e) => setProfile(p => ({ ...p, full_name: e.target.value }))} style={inputStyle} placeholder="Dr. Amina Yusuf" />
            </div>
            <div>
              <label style={labelStyle}>Position / Rank</label>
              <select value={profile.role} onChange={(e) => setProfile(p => ({ ...p, role: e.target.value }))}
                style={{ ...inputStyle, backgroundColor: "white" }}>
                <option value="">Select your rank</option>
                {RANKS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Department</label>
              <input type="text" value={profile.department} onChange={(e) => setProfile(p => ({ ...p, department: e.target.value }))} style={inputStyle} placeholder="e.g. Computer Science" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input type="tel" value={profile.phone} onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))} style={inputStyle} placeholder="e.g. 08012345678" />
              </div>
              <div>
                <label style={labelStyle}>WhatsApp Number <span style={{ color: "#9ca3af", fontWeight: "400" }}>(for approval notice)</span></label>
                <input type="tel" value={profile.whatsapp} onChange={(e) => setProfile(p => ({ ...p, whatsapp: e.target.value }))} style={inputStyle} placeholder="e.g. 08012345678" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Upload CV / Résumé <span style={{ color: "#9ca3af", fontWeight: "400" }}>(PDF, DOC)</span></label>
              <div onClick={() => cvInputRef.current?.click()}
                style={{ border: "2px dashed #d1d5db", borderRadius: "8px", padding: "16px", textAlign: "center", cursor: "pointer", backgroundColor: cvFile ? "#f0fdf4" : "#fafafa", borderColor: cvFile ? "#86efac" : "#d1d5db" }}>
                <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleCVChange} style={{ display: "none" }} />
                {cvExtracting ? <p style={{ color: "#2E8B57", fontSize: "13px", margin: 0 }}>⏳ Reading CV…</p>
                  : cvFile ? <p style={{ color: "#166534", fontSize: "13px", margin: 0 }}>✅ {cvFile.name}</p>
                  : <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0 }}>📄 Tap to select your CV</p>}
              </div>
            </div>
            <div>
              <label style={labelStyle}>
                Brief Biography
                {cvFile && !cvExtracting && <span style={{ color: "#2E8B57", fontWeight: "400", marginLeft: "6px" }}>✍️ Auto-filled — edit freely</span>}
              </label>
              <textarea required value={profile.bio} onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))} rows={5}
                style={{ ...inputStyle, resize: "vertical" }} placeholder="A brief description of your academic background and research interests…" />
            </div>
            <button type="submit" disabled={loading || uploadingCV || cvExtracting}
              style={{ backgroundColor: "#FFB81C", color: "#00214D", padding: "14px", borderRadius: "8px", border: "none", fontWeight: "800", fontSize: "15px", cursor: "pointer", opacity: (loading || uploadingCV || cvExtracting) ? 0.7 : 1 }}>
              {uploadingCV ? "Uploading CV…" : loading ? "Saving…" : "Complete Registration"}
            </button>
          </form>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
            <h2 style={{ color: "#00214D", fontWeight: "800", margin: "0 0 12px" }}>Registration Submitted!</h2>
            <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.7", margin: "0 0 20px" }}>
              Your profile has been submitted for review. You will receive a <strong>WhatsApp message</strong> once an admin approves your account.
            </p>
            <a href="/" style={{ display: "inline-block", backgroundColor: "#00214D", color: "white", padding: "12px 28px", borderRadius: "8px", textDecoration: "none", fontWeight: "700", fontSize: "14px" }}>
              Back to Home
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
