"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

const TITLES = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "Engr.", "Arc.", "Pharm.", "Rev."];

const RANKS = [
  "Chief Lecturer",
  "Principal Lecturer",
  "Senior Lecturer",
  "Lecturer I",
  "Lecturer II",
  "Lecturer III",
  "Assistant Lecturer",
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
        for (let i = 1; i <= Math.min(pdf.numPages, 6); i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(" ") + "\n";
        }
        resolve(text.slice(0, 6000));
      } catch { resolve(""); }
    };
    reader.readAsArrayBuffer(file);
  });
}

function extractSection(text: string, headings: string[]): string {
  const lines = text.split(/\n+/);
  const pattern = new RegExp(headings.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');
  let inSection = false;
  const collected: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (pattern.test(trimmed) && trimmed.length < 60) {
      inSection = true;
      continue;
    }
    // Stop at next major section heading (all-caps short line or known section names)
    if (inSection && trimmed.length < 60 && /^(EDUCATION|QUALIFICATIONS|EXPERIENCE|PUBLICATIONS|RESEARCH|SKILLS|AWARDS|REFERENCES|EMPLOYMENT|WORK HISTORY|ACADEMIC|PROFESSIONAL)/i.test(trimmed) && !pattern.test(trimmed)) {
      break;
    }
    if (inSection && trimmed.length > 10) {
      collected.push(trimmed);
      if (collected.length >= 6) break;
    }
  }
  return collected.join(' ').replace(/\s{2,}/g, ' ').trim();
}

function extractQualifications(text: string): string[] {
  const quals: string[] = [];
  const degreePattern = /\b(PhD|Ph\.D|DPhil|MSc|M\.Sc|MA|M\.A|MEng|MPhil|BSc|B\.Sc|BA|BEng|HND|ND|PGDE|PGD|MBA|MPA)\b[^.;\n]{0,80}/gi;
  const matches = text.match(degreePattern);
  if (matches) {
    matches.slice(0, 3).forEach(m => quals.push(m.trim().replace(/\s{2,}/g, ' ')));
  }
  return quals;
}

function extractPublicationCount(text: string): string {
  const pubSection = extractSection(text, ['PUBLICATIONS', 'RESEARCH OUTPUTS', 'JOURNAL ARTICLES', 'PAPERS']);
  if (!pubSection) return '';
  const count = (pubSection.match(/\d+\./g) || []).length;
  if (count > 1) return `Author of ${count}+ research publications.`;
  return '';
}

function extractYearsExperience(text: string): string {
  const yearMatches = text.match(/\b(19|20)\d{2}\b/g);
  if (!yearMatches || yearMatches.length < 2) return '';
  const years = yearMatches.map(Number);
  const earliest = Math.min(...years);
  const current = new Date().getFullYear();
  if (earliest < 1960 || earliest > current) return '';
  const exp = current - earliest;
  if (exp < 1 || exp > 50) return '';
  return `${exp}+ years of academic and professional experience.`;
}

function summariseCVText(raw: string): string {
  if (!raw.trim()) return "";

  const parts: string[] = [];

  // 1. Profile / Summary / Objective section
  const summary = extractSection(raw, ['PROFILE', 'SUMMARY', 'OBJECTIVE', 'PERSONAL STATEMENT', 'PROFESSIONAL SUMMARY', 'ABOUT ME', 'OVERVIEW']);
  if (summary && summary.length > 40) {
    parts.push(summary.slice(0, 300));
  }

  // 2. Qualifications
  const quals = extractQualifications(raw);
  if (quals.length > 0) {
    parts.push('Qualifications include: ' + quals.join('; ') + '.');
  }

  // 3. Research interests
  const research = extractSection(raw, ['RESEARCH INTERESTS', 'RESEARCH AREAS', 'AREAS OF INTEREST', 'SPECIALISATION', 'SPECIALIZATION']);
  if (research && research.length > 20) {
    parts.push('Research interests: ' + research.slice(0, 200) + '.');
  }

  // 4. Publication count
  const pubCount = extractPublicationCount(raw);
  if (pubCount) parts.push(pubCount);

  // 5. Years of experience
  const exp = extractYearsExperience(raw);
  if (exp) parts.push(exp);

  // 6. Fallback: if nothing extracted, take first meaningful paragraph
  if (parts.length === 0) {
    const lines = raw.split(/\n+/).map(l => l.trim()).filter(l => l.length > 30 && !/^(name|email|phone|address|date|nationality)/i.test(l));
    const fallback = lines.slice(0, 5).join(' ').replace(/\s{2,}/g, ' ');
    if (fallback) parts.push(fallback.slice(0, 500));
  }

  return parts.join(' ').slice(0, 700).trim();
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
  const [departments, setDepartments] = useState<string[]>([]);
  const [profile, setProfile] = useState({
    title: "",
    full_name: "",
    role: "",
    bio: "",
    department: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvExtracting, setCvExtracting] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);

  useEffect(() => {
    supabase
      .from("departments")
      .select("name")
      .order("display_order", { ascending: true })
      .then(({ data }) => {
        if (data) setDepartments(data.map((d: any) => d.name));
      });
  }, []);

  const validateEmail = (e: string) => e.endsWith("@jspict.edu.ng");

  const handleSignUp = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError("");
    if (!validateEmail(email)) {
      setError("Registration is only open to @jspict.edu.ng email addresses.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    setUserId(data.user?.id ?? "");
    setStep("profile");
    setLoading(false);
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
        await new Promise<void>(res => { script.onload = () => res(); });
      }
      const raw = await extractTextFromPDF(file);
      const bio = summariseCVText(raw);
      if (bio) setProfile(p => ({ ...p, bio }));
      setCvExtracting(false);
    }
  };

  const handleProfile = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setLoading(true);
    setError("");

    let cv_url: string | null = null;
    if (cvFile) {
      setUploadingCV(true);
      const ext = cvFile.name.split(".").pop();
      const path = `${userId}/cv.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("member-cvs")
        .upload(path, cvFile, { upsert: true });
      if (!upErr) {
        const { data } = supabase.storage.from("member-cvs").getPublicUrl(path);
        cv_url = data.publicUrl;
      }
      setUploadingCV(false);
    }

    const { error } = await supabase.from("members").insert({
      full_name: profile.full_name,
      title: profile.title,
      role: profile.role || "Member",
      bio: profile.bio,
      department: profile.department,
      email: email,
      user_id: userId,
      is_approved: false,
      display_order: 999,
      cv_url,
    });

    if (error) { setError(error.message); setLoading(false); return; }
    setStep("done");
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", border: "1.5px solid #d1d5db",
    borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", outline: "none",
    backgroundColor: "white",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "13px", fontWeight: "600", color: "#374151",
    display: "block", marginBottom: "6px",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f4f8", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" defer />

      <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "32px 28px", width: "100%", maxWidth: "480px", boxShadow: "0 8px 32px rgba(0,33,77,0.12)" }}>

        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", overflow: "hidden", margin: "0 auto 12px", border: "2px solid #2E8B57", backgroundColor: "white" }}>
            <Image src="/asup-logo.png" alt="ASUP Logo" width={56} height={56} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <h1 style={{ color: "#00214D", fontSize: "20px", fontWeight: "800", margin: "0 0 4px" }}>
            {step === "form" ? "Create Account" : step === "profile" ? "Complete Your Profile" : "Registration Submitted"}
          </h1>
          <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
            ASUP JSPICT Kazaure Chapter — Staff Portal
          </p>
        </div>

        {step !== "done" && (
          <div style={{ display: "flex", gap: "4px", marginBottom: "24px" }}>
            {["form", "profile"].map((s, i) => (
              <div key={s} style={{
                flex: 1, height: "4px", borderRadius: "2px",
                backgroundColor: ["form", "profile"].indexOf(step) >= i ? "#2E8B57" : "#e2e8f0",
                transition: "background-color 0.3s",
              }} />
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
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
              <p style={{ color: "#9ca3af", fontSize: "11px", margin: "4px 0 0" }}>Must be a valid @jspict.edu.ng institutional email</p>
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} style={{ ...inputStyle, paddingRight: "44px" }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "18px" }}>
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <p style={{ color: "#9ca3af", fontSize: "11px", margin: "4px 0 0" }}>Minimum 6 characters</p>
            </div>
            <button type="submit" disabled={loading}
              style={{ backgroundColor: "#00214D", color: "white", padding: "12px", borderRadius: "8px", border: "none", fontWeight: "700", fontSize: "15px", cursor: "pointer", opacity: loading ? 0.7 : 1, marginTop: "4px" }}>
              {loading ? "Creating Account..." : "Continue →"}
            </button>
          </form>
        )}

        {step === "profile" && (
          <form onSubmit={handleProfile} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#166534" }}>
              ✅ Account created! Now complete your profile below.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "8px" }}>
              <div>
                <label style={labelStyle}>Title</label>
                <select value={profile.title} onChange={e => setProfile(p => ({ ...p, title: e.target.value }))} style={inputStyle}>
                  <option value="">None</option>
                  {TITLES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Full Name <span style={{ color: "#9ca3af", fontWeight: 400 }}>(required)</span></label>
                <input type="text" required value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Position / Rank</label>
              <select value={profile.role} onChange={e => setProfile(p => ({ ...p, role: e.target.value }))} style={inputStyle}>
                <option value="">Select your rank</option>
                {RANKS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Department</label>
              <select value={profile.department} onChange={e => setProfile(p => ({ ...p, department: e.target.value }))} style={inputStyle}>
                <option value="">Select your department</option>
                {departments.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>
                Upload CV / Résumé
                <span style={{ color: "#9ca3af", fontWeight: 400 }}> (PDF — bio auto-extracted)</span>
              </label>
              <div onClick={() => cvInputRef.current?.click()}
                style={{
                  border: "2px dashed #d1d5db", borderRadius: "8px", padding: "16px",
                  textAlign: "center", cursor: "pointer",
                  backgroundColor: cvFile ? "#f0fdf4" : "#fafafa",
                  borderColor: cvFile ? "#86efac" : "#d1d5db",
                }}>
                <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleCVChange} style={{ display: "none" }} />
                {cvExtracting
                  ? <p style={{ color: "#2E8B57", fontSize: "13px", margin: 0 }}>⏳ Extracting profile information from CV…</p>
                  : cvFile
                    ? <p style={{ color: "#166534", fontSize: "13px", margin: 0 }}>✅ {cvFile.name}</p>
                    : <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0 }}>📄 Click to select your CV (PDF)</p>
                }
              </div>
              {cvFile && !cvExtracting && (
                <p style={{ color: "#2E8B57", fontSize: "11px", margin: "4px 0 0" }}>
                  Biography auto-filled from your CV summary, qualifications and research interests. Edit freely below.
                </p>
              )}
            </div>

            <div>
              <label style={labelStyle}>
                Brief Biography
                {cvFile && !cvExtracting && (
                  <span style={{ color: "#2E8B57", fontWeight: 400, marginLeft: "6px" }}>✍️ Auto-filled — edit freely</span>
                )}
              </label>
              <textarea required value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={5} style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            <button type="submit" disabled={loading || uploadingCV || cvExtracting}
              style={{ backgroundColor: "#FFB81C", color: "#00214D", padding: "13px", borderRadius: "8px", border: "none", fontWeight: "800", fontSize: "15px", cursor: "pointer", opacity: (loading || uploadingCV || cvExtracting) ? 0.7 : 1, marginTop: "4px" }}>
              {uploadingCV ? "Uploading CV…" : loading ? "Saving Profile…" : "Complete Registration"}
            </button>
          </form>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎉</div>
            <h2 style={{ color: "#00214D", fontSize: "20px", fontWeight: "800", margin: "0 0 12px" }}>Registration Complete!</h2>
            <div style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "10px", padding: "16px", marginBottom: "20px", textAlign: "left" }}>
              <p style={{ color: "#9a3412", fontWeight: "700", fontSize: "14px", margin: "0 0 6px" }}>⏳ Pending Admin Approval</p>
              <p style={{ color: "#c2410c", fontSize: "13px", margin: 0, lineHeight: "1.6" }}>
                Your profile has been submitted and is awaiting approval by the chapter administrator. Once approved, your profile will appear on the Members page.
              </p>
            </div>
            <a href="/members/login"
              style={{ backgroundColor: "#2E8B57", color: "white", padding: "12px 28px", borderRadius: "8px", textDecoration: "none", fontWeight: "700", fontSize: "14px", display: "inline-block" }}>
              Go to Member Portal
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
