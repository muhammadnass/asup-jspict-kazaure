"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

const RANKS = [
  "Chief Lecturer",
  "Principal Lecturer",
  "Senior Lecturer",
  "Lecturer I",
  "Lecturer II",
  "Lecturer III",
  "Assistant Lecturer",
];

const BLANK_MEMBER = {
  full_name: "",
  role: "",
  bio: "",
  email: "",
  department: "",
  phone: "",
  qualification: "",
};

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();
  const cvInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [member, setMember] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState<typeof BLANK_MEMBER & { bio: string }>(BLANK_MEMBER as any);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);
      const { data } = await supabase
        .from("members")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setMember(data);
        setFormData({
          full_name: data.full_name || "",
          role: data.role || "",
          bio: data.bio || "",
          email: data.email || user.email || "",
          department: data.department || "",
          phone: data.phone || "",
          qualification: data.qualification || "",
        });
      } else {
        setMember({ is_approved: true });
        setFormData({ ...BLANK_MEMBER, email: user.email || "", bio: "" });
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (member?.id) {
      const { error } = await supabase.from("members").update({
        full_name: formData.full_name,
        role: formData.role,
        bio: formData.bio,
        email: formData.email,
        department: formData.department,
      }).eq("id", member.id);
      if (error) { setError(error.message); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from("members").insert({
        full_name: formData.full_name,
        role: formData.role || "Member",
        bio: formData.bio,
        email: formData.email || user?.email,
        department: formData.department,
        user_id: user?.id,
        is_approved: true,
        display_order: 999,
      }).select().single();
      if (error) { setError(error.message); setSaving(false); return; }
      setMember(data);
    }

    setSuccess("Profile saved successfully!");
    setSaving(false);
    // Clear form fields after successful save
    setFormData(BLANK_MEMBER as any);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const ext = file.name.split(".").pop();
    const path = `${member?.id || user?.id}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("member-photos")
      .upload(path, file, { upsert: true });
    if (upErr) { setError(upErr.message); setUploading(false); return; }
    const { data } = supabase.storage.from("member-photos").getPublicUrl(path);
    await supabase.from("members").update({ photo_url: data.publicUrl }).eq("id", member.id);
    setMember((m: any) => ({ ...m, photo_url: data.publicUrl }));
    setSuccess("Photo updated!");
    setUploading(false);
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!member?.id) { setError("Save your profile first before uploading a CV."); return; }
    setUploadingCV(true);
    setError("");
    const ext = file.name.split(".").pop();
    const path = `${member.id}/cv.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("member-cvs")
      .upload(path, file, { upsert: true });
    if (upErr) { setError(upErr.message); setUploadingCV(false); return; }
    const { data } = supabase.storage.from("member-cvs").getPublicUrl(path);
    await supabase.from("members").update({ cv_url: data.publicUrl }).eq("id", member.id);
    setMember((m: any) => ({ ...m, cv_url: data.publicUrl }));
    setSuccess("CV uploaded successfully!");
    setUploadingCV(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f0f4f8" }}>
      <p style={{ color: "#00214D", fontSize: "15px" }}>Loading your profile…</p>
    </div>
  );

  const initials = member?.full_name?.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase() || "?";

  const tabs = [
    { id: "profile", label: "My Profile" },
    { id: "publications", label: "Publications" },
    { id: "articles", label: "My Articles" },
    { id: "assessments", label: "📝 Assessments" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f4f8" }}>

      {/* Dashboard header */}
      <div style={{ backgroundColor: "#00214D", borderBottom: "3px solid #2E8B57" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "50%", overflow: "hidden", border: "2px solid #FFB81C", backgroundColor: "#e5f0ff", flexShrink: 0 }}>
              {member?.photo_url ? (
                <img src={member.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#00214D", fontSize: "16px" }}>{initials}</div>
              )}
            </div>
            <div>
              <p style={{ color: "white", fontWeight: "700", fontSize: "15px", margin: "0 0 2px" }}>{member?.full_name || user?.email}</p>
              <p style={{ color: "#9ca3af", fontSize: "11px", margin: 0 }}>{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#d1d5db", border: "1px solid rgba(255,255,255,0.2)", padding: "8px 16px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}
          >
            Sign Out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "24px 16px" }}>

        {/* Welcome banner for new users */}
        {!member?.id && (
          <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#1e40af" }}>
            👋 Welcome! Complete your profile below to appear in the chapter directory.
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "20px", backgroundColor: "white", padding: "4px", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,33,77,0.08)" }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                flex: 1, padding: "10px 8px", borderRadius: "8px", border: "none",
                fontSize: "12px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s",
                backgroundColor: activeTab === t.id ? "#00214D" : "transparent",
                color: activeTab === t.id ? "white" : "#64748b",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Status messages */}
        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "12px 16px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #86efac", color: "#166534", padding: "12px 16px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
            ✅ {success}
          </div>
        )}

        {/* ── MY PROFILE TAB ── */}
        {activeTab === "profile" && (
          <div style={{ backgroundColor: "white", borderRadius: "14px", boxShadow: "0 2px 12px rgba(0,33,77,0.08)", overflow: "hidden" }}>
            <div style={{ height: "4px", background: "linear-gradient(90deg, #00214D, #2E8B57)" }} />
            <div style={{ padding: "28px" }}>

              {/* Photo section */}
              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <div style={{ width: "96px", height: "96px", borderRadius: "50%", overflow: "hidden", margin: "0 auto 14px", border: "4px solid #FFB81C", backgroundColor: "#e5f0ff" }}>
                  {member?.photo_url ? (
                    <img src={member.photo_url} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", fontWeight: "bold", color: "#00214D" }}>
                      {initials}
                    </div>
                  )}
                </div>
                {member?.id && (
                  <label style={{ backgroundColor: "#00214D", color: "white", padding: "7px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "inline-block" }}>
                    {uploading ? "Uploading…" : "Change Photo"}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} disabled={uploading} />
                  </label>
                )}
              </div>

              {/* Profile Form */}
              <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#374151", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Full Name <span style={{ color: "#9ca3af", textTransform: "none", fontWeight: "400" }}>(with title e.g. Dr., Engr., Mr., Mrs.)</span>
                  </label>
                  <input
                    type="text" required
                    value={formData.full_name}
                    onChange={(e) => setFormData((f) => ({ ...f, full_name: e.target.value }))}
                    style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #d1d5db", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#374151", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Position / Rank
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData((f) => ({ ...f, role: e.target.value }))}
                    style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #d1d5db", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box", backgroundColor: "white" }}
                  >
                    <option value="">Select rank</option>
                    {RANKS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#374151", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData((f) => ({ ...f, department: e.target.value }))}
                    style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #d1d5db", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#374151", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                    style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #d1d5db", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#374151", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Biography & Research Interests
                  </label>
                  <textarea
                    required
                    value={formData.bio}
                    onChange={(e) => setFormData((f) => ({ ...f, bio: e.target.value }))}
                    rows={6}
                    style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #d1d5db", borderRadius: "8px", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }}
                  />
                </div>

                {/* CV Upload */}
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#374151", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    CV / Résumé
                  </label>
                  {member?.cv_url ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", backgroundColor: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px" }}>
                      <span style={{ fontSize: "13px", color: "#166534" }}>✅ CV uploaded</span>
                      <a href={member.cv_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "#2E8B57", fontWeight: "700", textDecoration: "none" }}>
                        View →
                      </a>
                      <label style={{ marginLeft: "auto", backgroundColor: "#00214D", color: "white", padding: "5px 12px", borderRadius: "5px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>
                        {uploadingCV ? "Uploading…" : "Replace"}
                        <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleCVUpload} style={{ display: "none" }} disabled={uploadingCV} />
                      </label>
                    </div>
                  ) : (
                    <label style={{ display: "block", border: "2px dashed #d1d5db", borderRadius: "8px", padding: "16px", textAlign: "center", cursor: "pointer", backgroundColor: "#fafafa" }}>
                      <span style={{ color: "#9ca3af", fontSize: "13px" }}>
                        {uploadingCV ? "⏳ Uploading…" : "📄 Click to upload your CV (PDF, DOC)"}
                      </span>
                      <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleCVUpload} style={{ display: "none" }} disabled={uploadingCV || !member?.id} />
                    </label>
                  )}
                  {!member?.id && (
                    <p style={{ color: "#9ca3af", fontSize: "11px", margin: "4px 0 0" }}>Save your profile first to enable CV upload.</p>
                  )}
                </div>

                <button
                  type="submit" disabled={saving}
                  style={{ backgroundColor: "#FFB81C", color: "#00214D", padding: "13px", borderRadius: "8px", border: "none", fontWeight: "800", fontSize: "15px", cursor: "pointer", opacity: saving ? 0.7 : 1, marginTop: "4px" }}
                >
                  {saving ? "Saving…" : member?.id ? "Save Changes" : "Create My Profile"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── PUBLICATIONS TAB ── */}
        {activeTab === "publications" && (
          <div style={{ backgroundColor: "white", borderRadius: "14px", boxShadow: "0 2px 12px rgba(0,33,77,0.08)", overflow: "hidden" }}>
            <div style={{ height: "4px", background: "linear-gradient(90deg, #00214D, #2E8B57)" }} />
            <div style={{ padding: "28px" }}>
              <h3 style={{ color: "#00214D", fontSize: "17px", fontWeight: "800", margin: "0 0 8px" }}>My Publications</h3>
              <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "24px" }}>
                Add your journal articles, conference papers, and books. These will appear on your member profile.
              </p>
              <div style={{ backgroundColor: "#f8f9fa", borderRadius: "10px", padding: "32px", textAlign: "center" }}>
                <p style={{ fontSize: "40px", margin: "0 0 12px" }}>📚</p>
                <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 6px", fontWeight: "600" }}>Publication management coming soon</p>
                <p style={{ color: "#9ca3af", fontSize: "12px", margin: 0 }}>
                  For now, include your publications in your biography in the My Profile tab.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── ASSESSMENTS TAB ── */}
        {activeTab === "assessments" && (
          <div style={{ backgroundColor: "white", borderRadius: "14px", boxShadow: "0 2px 12px rgba(0,33,77,0.08)", overflow: "hidden" }}>
            <div style={{ height: "4px", background: "linear-gradient(90deg, #00214D, #2E8B57)" }} />
            <div style={{ padding: "28px" }}>
              <h3 style={{ color: "#00214D", fontSize: "17px", fontWeight: "800", margin: "0 0 8px" }}>My Assessments</h3>
              <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "24px" }}>Create CA tests and exams, generate questions with AI, and export results.</p>
              <a href="/dashboard/assessment" style={{ display: "inline-block", backgroundColor: "#00214D", color: "white", padding: "11px 24px", borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: "700" }}>📝 Go to Assessments</a>
            </div>
          </div>
        )}

        {/* ── ARTICLES TAB ── */}
        {activeTab === "articles" && (
          <div style={{ backgroundColor: "white", borderRadius: "14px", boxShadow: "0 2px 12px rgba(0,33,77,0.08)", overflow: "hidden" }}>
            <div style={{ height: "4px", background: "linear-gradient(90deg, #00214D, #2E8B57)" }} />
            <div style={{ padding: "28px" }}>
              <h3 style={{ color: "#00214D", fontSize: "17px", fontWeight: "800", margin: "0 0 8px" }}>My Articles</h3>
              <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "24px" }}>
                Write and publish articles to share your knowledge with the ASUP community.
              </p>
              <a
                href="/dashboard/articles/new"
                style={{ display: "inline-block", backgroundColor: "#00214D", color: "white", padding: "11px 24px", borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: "700" }}
              >
                ✍️ Write New Article
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
