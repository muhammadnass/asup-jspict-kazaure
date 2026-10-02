import os

base = "/home/muhammad-sanusi/Documents/Projects/ASUP website/asup-jigawa"
path = f"{base}/app/dashboard/page.tsx"

content = """
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [member, setMember] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");

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
      } else {
        setMember({ full_name: "", role: "", bio: "", email: user.email, department: "", user_id: user.id, is_approved: false, display_order: 999 });
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
    if (member.id) {
      const { error } = await supabase.from("members").update({
        full_name: member.full_name,
        role: member.role,
        bio: member.bio,
        email: member.email,
        department: member.department,
      }).eq("id", member.id);
      if (error) { setError(error.message); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from("members").insert({
        full_name: member.full_name,
        role: member.role || "Member",
        bio: member.bio,
        email: member.email || user?.email,
        department: member.department,
        user_id: user?.id,
        is_approved: false,
        display_order: 999,
      }).select().single();
      if (error) { setError(error.message); setSaving(false); return; }
      setMember(data);
    }
    setSuccess("Profile saved successfully!");
    setSaving(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const ext = file.name.split(".").pop();
    const path = `${member.id || user?.id}.${ext}`;
    const { error: upErr } = await supabase.storage.from("member-photos").upload(path, file, { upsert: true });
    if (upErr) { setError(upErr.message); setUploading(false); return; }
    const { data } = supabase.storage.from("member-photos").getPublicUrl(path);
    await supabase.from("members").update({ photo_url: data.publicUrl }).eq("id", member.id);
    setMember((m: any) => ({ ...m, photo_url: data.publicUrl }));
    setSuccess("Photo updated!");
    setUploading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#003366" }}>Loading your profile...</p>
    </div>
  );

  const tabs = [
    { id: "profile", label: "My Profile" },
    { id: "publications", label: "Publications" },
    { id: "articles", label: "My Articles" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "24px 16px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h1 style={{ color: "#003366", fontSize: "20px", fontWeight: "bold", margin: "0 0 2px" }}>
              {member?.full_name || "My Dashboard"}
            </h1>
            <p style={{ color: "#888", fontSize: "12px", margin: 0 }}>{user?.email}</p>
          </div>
          <button onClick={handleSignOut}
            style={{ backgroundColor: "#fee2e2", color: "#dc2626", border: "none", padding: "8px 14px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>
            Sign Out
          </button>
        </div>

        {member && !member.is_approved && member.id && (
          <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontSize: "13px", color: "#92400e" }}>
            Your profile is pending admin approval before appearing on the members page.
          </div>
        )}

        {!member?.id && (
          <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", fontSize: "13px", color: "#1e40af" }}>
            Welcome! Fill in your details below and click Save to create your profile.
          </div>
        )}

        <div style={{ display: "flex", gap: "4px", marginBottom: "20px", backgroundColor: "white", padding: "4px", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "none", fontSize: "12px", fontWeight: "600", cursor: "pointer",
                backgroundColor: activeTab === t.id ? "#003366" : "transparent",
                color: activeTab === t.id ? "white" : "#666" }}>
              {t.label}
            </button>
          ))}
        </div>

        {error && <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: "6px", fontSize: "13px", marginBottom: "14px" }}>{error}</div>}
        {success && <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "10px 14px", borderRadius: "6px", fontSize: "13px", marginBottom: "14px" }}>{success}</div>}

        {activeTab === "profile" && (
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>

            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ width: "90px", height: "90px", borderRadius: "50%", overflow: "hidden", margin: "0 auto 12px", backgroundColor: "#e5e7eb", border: "3px solid #FFB81C" }}>
                {member?.photo_url
                  ? <img src={member.photo_url} alt={member.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "bold", color: "#003366" }}>
                      {member?.full_name?.charAt(0) || "?"}
                    </div>
                }
              </div>
              {member?.id && (
                <label style={{ backgroundColor: "#003366", color: "white", padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "inline-block" }}>
                  {uploading ? "Uploading..." : "Change Photo"}
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} disabled={uploading} />
                </label>
              )}
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>Full Name (with title e.g. Dr., Engr., Mr., Mrs.)</label>
                <input type="text" required value={member?.full_name || ""} onChange={e => setMember((m: any) => ({ ...m, full_name: e.target.value }))}
                  placeholder="Dr. Amina Yusuf"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>Position / Rank</label>
                <select value={member?.role || ""} onChange={e => setMember((m: any) => ({ ...m, role: e.target.value }))}
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
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>Department</label>
                <input type="text" value={member?.department || ""} onChange={e => setMember((m: any) => ({ ...m, department: e.target.value }))}
                  placeholder="e.g. Information Technology"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>Official Email</label>
                <input type="email" value={member?.email || ""} onChange={e => setMember((m: any) => ({ ...m, email: e.target.value }))}
                  placeholder="yourname@jspict.edu.ng"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>Biography and Research Interests</label>
                <textarea required value={member?.bio || ""} onChange={e => setMember((m: any) => ({ ...m, bio: e.target.value }))}
                  placeholder="Your academic background, research interests, qualifications and achievements..."
                  rows={6}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <button type="submit" disabled={saving}
                style={{ backgroundColor: "#FFB81C", color: "#003366", padding: "12px", borderRadius: "6px", border: "none", fontWeight: "bold", fontSize: "14px", cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving..." : member?.id ? "Save Changes" : "Create My Profile"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "publications" && (
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 style={{ color: "#003366", fontSize: "16px", fontWeight: "bold", margin: "0 0 12px" }}>My Publications</h3>
            <p style={{ color: "#888", fontSize: "13px", marginBottom: "16px" }}>
              Add your journal articles, conference papers, and books. These will appear on your member profile.
            </p>
            <div style={{ backgroundColor: "#f8f9fa", borderRadius: "8px", padding: "24px", textAlign: "center" }}>
              <p style={{ fontSize: "32px", margin: "0 0 8px" }}>📚</p>
              <p style={{ color: "#888", fontSize: "13px", margin: "0 0 8px" }}>Publication management coming soon</p>
              <p style={{ color: "#aaa", fontSize: "12px", margin: 0 }}>
                For now, include your publications in your biography above.
              </p>
            </div>
          </div>
        )}

        {activeTab === "articles" && (
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 style={{ color: "#003366", fontSize: "16px", fontWeight: "bold", margin: "0 0 12px" }}>My Articles</h3>
            <p style={{ color: "#888", fontSize: "13px", marginBottom: "16px" }}>
              Write and publish articles to share your knowledge with the community.
            </p>
            <a href="/dashboard/articles/new"
              style={{ display: "inline-block", backgroundColor: "#003366", color: "white", padding: "10px 20px", borderRadius: "6px", textDecoration: "none", fontSize: "13px", fontWeight: "600" }}>
              Write New Article
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
""".lstrip()

os.makedirs(os.path.dirname(path), exist_ok=True)
with open(path, "w") as f:
    f.write(content)
print(f"Done: {content.count(chr(10))} lines written to {path}")
