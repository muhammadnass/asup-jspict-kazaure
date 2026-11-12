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
        <div style={{ height: "4px", background: "linear-gradient(90deg, #00214D, #2E8B57)" }} />
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", flex: 1 }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", overflow: "hidden", marginBottom: "12px", border: "3px solid #FFB81C", backgroundColor: "#e5f0ff", flexShrink: 0 }}>
            {member.photo_url ? (
              <img src={member.photo_url} alt={member.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "bold", color: "#00214D" }}>
                {initials}
              </div>
            )}
          </div>
          <h3 style={{ color: "#00214D", fontWeight: "700", fontSize: "15px", margin: "0 0 4px", lineHeight: "1.3" }}>
            {member.full_name}
          </h3>
          <span style={{ display: "inline-block", backgroundColor: "#e8f5ee", color: "#2E8B57", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px", marginBottom: "8px" }}>
            {member.role || "Member"}
          </span>
          {member.department && (
            <p style={{ color: "#64748b", fontSize: "12px", margin: "0 0 10px" }}>{member.department}</p>
          )}
          {member.bio && (
            <p style={{ color: "#6b7280", fontSize: "12px", lineHeight: "1.5", margin: "0 0 12px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } as React.CSSProperties}>
              {member.bio}
            </p>
          )}
          <div style={{ marginTop: "auto", paddingTop: "8px" }}>
            <span style={{ color: "#2E8B57", fontSize: "12px", fontWeight: "700" }}>View Full Profile →</span>
          </div>
        </div>
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="modal-wrap"
          style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", overscrollBehavior: "contain" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="modal-inner"
            style={{ backgroundColor: "white", borderRadius: "16px", width: "100%", maxWidth: "540px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", WebkitOverflowScrolling: "touch" }}
          >
            <div style={{ height: "6px", background: "linear-gradient(90deg, #00214D, #2E8B57)", borderRadius: "16px 16px 0 0" }} />
            <div style={{ padding: "24px 20px 28px" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
                <button onClick={() => setOpen(false)}
                  style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  ✕
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "4px solid #FFB81C", backgroundColor: "#e5f0ff" }}>
                  {member.photo_url ? (
                    <img src={member.photo_url} alt={member.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: "bold", color: "#00214D" }}>
                      {initials}
                    </div>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ color: "#00214D", fontWeight: "800", fontSize: "clamp(16px, 4vw, 20px)", margin: "0 0 6px", lineHeight: "1.3" }}>{member.full_name}</h2>
                  <span style={{ display: "inline-block", backgroundColor: "#e8f5ee", color: "#2E8B57", fontSize: "12px", fontWeight: "700", padding: "4px 12px", borderRadius: "20px" }}>
                    {member.role || "Member"}
                  </span>
                  {member.department && (
                    <p style={{ color: "#64748b", fontSize: "13px", margin: "6px 0 0" }}>{member.department}</p>
                  )}
                </div>
              </div>
              {member.email && (
                <div style={{ marginBottom: "16px" }}>
                  <p style={{ color: "#2E8B57", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>Email</p>
                  <a href={`mailto:${member.email}`} style={{ color: "#00214D", fontSize: "14px", textDecoration: "none", wordBreak: "break-all" }}>{member.email}</a>
                </div>
              )}
              {member.bio && (
                <div style={{ marginBottom: "16px" }}>
                  <p style={{ color: "#2E8B57", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>Biography</p>
                  <p style={{ color: "#374151", fontSize: "14px", lineHeight: "1.7", margin: 0 }}>{member.bio}</p>
                </div>
              )}
              {member.cv_url && (
                <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #e5e7eb" }}>
                  <a href={member.cv_url} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "#00214D", color: "white", padding: "12px 24px", borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: "700", width: "100%", justifyContent: "center" }}>
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
