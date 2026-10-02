"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/members", label: "Members" },
  { href: "/history", label: "History" },
  { href: "/struggles", label: "Struggles" },
  { href: "/publications", label: "Publications" },
  { href: "/archives", label: "Archives" },
  { href: "/articles", label: "Articles" },
  { href: "/journal", label: "Journal ✨" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav style={{ backgroundColor: "#003366", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "56px" }}>

          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <div style={{ width: "32px", height: "32px", backgroundColor: "#FFB81C", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#003366", fontSize: "14px", flexShrink: 0 }}>A</div>
            <div style={{ lineHeight: "1.2" }}>
              <div style={{ color: "white", fontWeight: "bold", fontSize: "13px" }}>ASUP JSPICT</div>
              <div style={{ color: "#9ca3af", fontSize: "10px" }}>Kazaure Chapter</div>
            </div>
          </Link>

          <div className="desktop-nav" style={{ display: "none", alignItems: "center", gap: "2px" }}>
            {links.map(l => (
              <Link key={l.href} href={l.href}
                style={{ color: l.href === "/journal" ? "#FFB81C" : "white", textDecoration: "none", fontSize: "12px", padding: "6px 8px", borderRadius: "4px", whiteSpace: "nowrap" }}>
                {l.label}
              </Link>
            ))}
            <Link href="/login"
              style={{ backgroundColor: "#FFB81C", color: "#003366", padding: "6px 12px", borderRadius: "4px", textDecoration: "none", fontSize: "12px", fontWeight: "bold", marginLeft: "8px", whiteSpace: "nowrap" }}>
              My Profile
            </Link>
          </div>

          <button onClick={() => setOpen(!open)} className="hamburger"
            style={{ background: "none", border: "none", cursor: "pointer", color: "white", padding: "8px" }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {open && (
          <div style={{ borderTop: "1px solid #1a4a7a", paddingBottom: "12px" }}>
            {links.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                style={{ display: "block", color: l.href === "/journal" ? "#FFB81C" : "white", textDecoration: "none", padding: "10px 12px", fontSize: "14px" }}>
                {l.label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setOpen(false)}
              style={{ display: "block", backgroundColor: "#FFB81C", color: "#003366", padding: "10px 12px", borderRadius: "6px", textDecoration: "none", fontSize: "14px", fontWeight: "bold", margin: "8px 0 0" }}>
              My Profile / Sign In
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .hamburger { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
