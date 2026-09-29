'use client'

import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/history", label: "History" },
  { href: "/struggles", label: "Struggles" },
  { href: "/publications", label: "Publications" },
  { href: "/archives", label: "Archives" },
  { href: "/members", label: "Members" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav style={{ backgroundColor: "#003366", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "56px" }}>
          
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <div style={{ width: "32px", height: "32px", backgroundColor: "#FFB81C", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#003366", fontSize: "14px" }}>A</div>
            <span style={{ color: "white", fontWeight: "bold", fontSize: "14px" }}>ASUP Jigawa ICT</span>
          </Link>

          {/* Desktop links */}
          <div style={{ display: "none" }} className="desktop-nav">
            {links.map(l => (
              <Link key={l.href} href={l.href} style={{ color: "white", textDecoration: "none", fontSize: "13px", marginLeft: "20px" }}>
                {l.label}
              </Link>
            ))}
            <Link href="/admin" style={{ backgroundColor: "#FFB81C", color: "#003366", padding: "6px 12px", borderRadius: "4px", textDecoration: "none", fontSize: "12px", fontWeight: "bold", marginLeft: "20px" }}>
              Admin
            </Link>
          </div>

          {/* Hamburger */}
          <button onClick={() => setOpen(!open)} style={{ background: "none", border: "none", cursor: "pointer", color: "white", padding: "8px" }} className="hamburger">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div style={{ borderTop: "1px solid #1a4a7a", paddingBottom: "8px" }}>
            {links.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                style={{ display: "block", color: "white", textDecoration: "none", padding: "10px 12px", fontSize: "14px" }}>
                {l.label}
              </Link>
            ))}
            <Link href="/admin" onClick={() => setOpen(false)}
              style={{ display: "block", backgroundColor: "#FFB81C", color: "#003366", padding: "10px 12px", borderRadius: "4px", textDecoration: "none", fontSize: "14px", fontWeight: "bold", margin: "4px 0" }}>
              Admin Portal
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; align-items: center; }
          .hamburger { display: none !important; }
        }
      `}</style>
    </nav>
  );
}