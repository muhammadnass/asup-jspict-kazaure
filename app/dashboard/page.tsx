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

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("members").select("*").eq("user_id", user.id).single();
      if (data) setMember(data);
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    const { error } = await supabase.from("members").update({
      full_name: member.full_name,
      role: member.role,
      bio: member.bio,
    }).eq("id", member.id);
    if (error) setError(error.message);
    else setSuccess("Profile updated successfully!");
    setSaving(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !member) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${member.id}.${ext}`;
    const { error: upErr } = await supabase.storage.from("member-photos").upload(path, file, { upsert: true });
    if (upErr) { setError(upErr.message); setUploading(false); return; }
    const { data } = supabase.storage.from("member-photos").getPublicUrl(path);
    await supabase.from("members").update({ photo_url: data.publicUrl }).eq("id", member.id);
    setMember((m: any) => ({ ...m, photo_url: data.publicUrl }));
    setUploading(false);
    setSuccess("Photo updated!");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <div style={{ textAlign: "center", padding: "60px", color: "#003366" }}>Loading...</div>;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 16px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ color: "#003366", fontSize: "22px", fontWeight: "bold", margin: "0 0 4px" }}>My Profile</h1>
            <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>ASUP Jigawa ICT Kazaure</p>
          </div>
          <button onClick={handleSignOut}
            style={{ backgroundColor: "#fee2e2", color: "#dc2626", border: "none", padding: "8px 14px", borderRadius: "6px", fontSize: "13px", cursor: "pointer", fontWeight: "600" }}>
            Sign Out
          </button>
        </div>

        {!member ? (
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "32px", textAlign: "center" }}>
            <p style={{ color: "#888" }}>No profile found. Please contact the admin.</p>
          </div>
        ) : (
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>

            {/* Approval status */}
            {!member.is_approved && (
              <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#92400e" }}>
                ⏳ Your profile is pending admin approval before appearing on the members page.
              </div>
            )}

            {error && <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 12px", borderRadius: "6px", fontSize: "13px", marginBottom: "16px" }}>{error}</div>}
            {success && <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "10px 12px", borderRadius: "6px", fontSize: "13px", marginBottom: "16px" }}>{success}</div>}

            {/* Photo */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ width: "100px", height: "100px", borderRadius: "50%", overflow: "hidden", margin: "0 auto 12px", backgroundColor: "#e5e7eb", border: "3px solid #FFB81C" }}>
                {member.photo_url
                  ? <img src={member.photo_url} alt={member.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", fontWeight: "bold", color: "#003366" }}>{member.full_name?.charAt(0)}</div>
                }
              </div>
              <label style={{ backgroundColor: "#003366", color: "white", padding: "7px 16px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                {uploading ? "Uploading..." : "Change Photo"}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
              </label>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>Full Name</label>
                <input type="text" required value={member.full_name}
                  onChange={e => setMember((m: any) => ({ ...m, full_name: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>Position / Rank</label>
                <select value={member.role} onChange={e => setMember((m: any) => ({ ...m, role: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}>
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
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>Biography</label>
                <textarea required value={member.bio}
                  onChange={e => setMember((m: any) => ({ ...m, bio: e.target.value }))}
                  rows={5}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <button type="submit" disabled={saving}
                style={{ backgroundColor: "#FFB81C", color: "#003366", padding: "11px", borderRadius: "6px", border: "none", fontWeight: "bold", fontSize: "14px", cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>

            {/* Write Article Link */}
            <div style={{ marginTop: "20px", padding: "16px", backgroundColor: "#eff6ff", borderRadius: "8px", textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: "#1e40af", margin: "0 0 8px", fontWeight: "600" }}>📝 Share your knowledge</p>
              <a href="/dashboard/articles/new"
                style={{ backgroundColor: "#003366", color: "white", padding: "8px 16px", borderRadius: "6px", fontSize: "13px", textDecoration: "none", fontWeight: "600" }}>
                Write an Article
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
