"use client";

import { useState } from "react";
import type { Member } from "@/lib/types";

export default function MemberCard({ member }: { member: Member }) {
  const [open, setOpen] = useState(false);

  const initials = member.full_name
    ?.split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

  return (
    <>
      {/* Card */}
      <div
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
        className="card-hover"
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,33,77,0.08)",
          cursor: "pointer",
          border: "1px solid #e8edf2",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Green top accent */}
        <div style={{ height: "4px", background: "linear-gradient(90deg, #00214D, #2E8B57)" }} />

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", flex: 1 }}>
          {/* Photo */}
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            overflow: "hidden", marginBottom: "12px",
            border: "3px solid #FFB81C",
            backgroundColor: "#e5f0ff",
            flexShrink: 0,
          }}>
            {member.photo_url ? (
              <img src={member.photo_url} alt={member.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "bold", color: "#00214D" }}>
                {initials}
              </div>
            )}
          </div>

          {/* Name */}
          <h3 style={{ color: "#00214D", fontWeight: "700", fontSize: "15px", margin: "0 0 4px", lineHeight: "1.3" }}>
            {member.full_name}
          </h3>

          {/* Role */}
          <span style={{
            display: "inline-block",
            backgroundColor: "#e8f5ee",
            color: "#2E8B57",
            fontSize: "11px",
            fontWeight: "700",
            padding: "3px 10px",
            borderRadius: "20px",
            marginBottom: "8px",
          }}>
            {member.role || "Member"}
          </span>

          {/* Department */}
          {member.department && (
            <p style={{ color: "#64748b", fontSize: "12px", margin: "0 0 10px" }}>
              {member.department}
            </p>
          )}

          {/* Bio preview */}
          {member.bio && (
            <p style={{
              color: "#6b7280", fontSize: "12px", lineHeight: "1.5",
              margin: "0 0 12px",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            } as React.CSSProperties}>
              {member.bio}
            </p>
          )}

          {/* View Profile CTA */}
          <div style={{ marginTop: "auto", paddingTop: "8px" }}>
            <span style={{ color: "#2E8B57", fontSize: "12px", fontWeight: "700" }}>
              View Full Profile →
            </span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            backgroundColor: "rgba(0,0,0,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "540px",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            {/* Modal header band */}
            <div style={{ height: "6px", background: "linear-gradient(90deg, #00214D, #2E8B57)" }} />

            <div style={{ padding: "28px" }}>
              {/* Close */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
                <button
                  onClick={() => setOpen(false)}
                  style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  ✕
                </button>
              </div>

              {/* Photo + Name */}
              <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "24px" }}>
                <div style={{ width: "96px", height: "96px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "4px solid #FFB81C", backgroundColor: "#e5f0ff" }}>
                  {member.photo_url ? (
                    <img src={member.photo_url} alt={member.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "bold", color: "#00214D" }}>
                      {initials}
                    </div>
                  )}
                </div>
                <div>
                  <h2 style={{ color: "#00214D", fontWeight: "800", fontSize: "20px", margin: "0 0 6px" }}>{member.full_name}</h2>
                  <span style={{ display: "inline-block", backgroundColor: "#e8f5ee", color: "#2E8B57", fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "20px" }}>
                    {member.role || "Member"}
                  </span>
                  {member.department && (
                    <p style={{ color: "#64748b", fontSize: "13px", margin: "6px 0 0" }}>{member.department}</p>
                  )}
                </div>
              </div>

              {/* Details */}
              {member.email && (
                <div style={{ marginBottom: "16px" }}>
                  <p style={{ color: "#2E8B57", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>Email</p>
                  <a href={`mailto:${member.email}`} style={{ color: "#00214D", fontSize: "14px", textDecoration: "none" }}>{member.email}</a>
                </div>
              )}

              {member.bio && (
                <div style={{ marginBottom: "16px" }}>
                  <p style={{ color: "#2E8B57", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Biography</p>
                  <p style={{ color: "#374151", fontSize: "14px", lineHeight: "1.7", margin: 0 }}>{member.bio}</p>
                </div>
              )}

              {/* CV Download */}
              {member.cv_url && (
                <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #e5e7eb" }}>
                  <a
                    href={member.cv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "8px",
                      backgroundColor: "#00214D", color: "white",
                      padding: "10px 20px", borderRadius: "8px",
                      textDecoration: "none", fontSize: "13px", fontWeight: "700",
                    }}
                  >
                    📄 Download CV
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
