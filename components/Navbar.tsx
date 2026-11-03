"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/members", label: "Members" },
  { href: "/struggles", label: "Struggles" },
  { href: "/research-outputs", label: "Research Outputs" },
  { href: "/events", label: "Events" },
  { href: "/knowledge-hub", label: "Knowledge Hub" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <nav style={{
      backgroundColor: "#00214D",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.25)" : "0 2px 8px rgba(0,0,0,0.15)",
      transition: "box-shadow 0.3s ease",
      borderBottom: "3px solid #2E8B57",
    }}>
      {/* Top bar */}
      <div style={{ backgroundColor: "#001535", padding: "4px 16px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ color: "#9ca3af", fontSize: "11px", margin: 0 }}>
            Official website of ASUP — JSPICT Kazaure Chapter
          </p>
          <Link href="/members"
            style={{ color: "#FFB81C", fontSize: "11px", textDecoration: "none", fontWeight: "600" }}>
            Member Portal →
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "64px" }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "50%", overflow: "hidden", border: "2px solid #2E8B57", flexShrink: 0, backgroundColor: "white" }}>
              <Image src="/asup-logo.png" alt="ASUP Logo" width={44} height={44} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ lineHeight: "1.2" }}>
              <div style={{ color: "white", fontWeight: "800", fontSize: "14px", letterSpacing: "0.02em" }}>ASUP JSPICT</div>
              <div style={{ color: "#2E8B57", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Kazaure Chapter</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="desktop-nav" style={{ display: "none", alignItems: "center", gap: "2px" }}>
            {links.map(l => {
              const isActive = pathname === l.href;
              return (
                <Link key={l.href} href={l.href}
                  style={{
                    color: isActive ? "#FFB81C" : "#d1d5db",
                    textDecoration: "none",
                    fontSize: "12px",
                    fontWeight: isActive ? "700" : "500",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    whiteSpace: "nowrap",
                    borderBottom: isActive ? "2px solid #2E8B57" : "2px solid transparent",
                    transition: "color 0.2s, border-color 0.2s",
                  }}>
                  {l.label}
                </Link>
              );
            })}
            <Link href="/members"
              style={{
                backgroundColor: "#2E8B57",
                color: "white",
                padding: "8px 16px",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "12px",
                fontWeight: "700",
                marginLeft: "10px",
                whiteSpace: "nowrap",
                border: "none",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#236e45")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#2E8B57")}>
              My Profile
            </Link>
          </div>

          {/* Hamburger */}
          <button onClick={() => setOpen(!open)} className="hamburger"
            style={{ background: "none", border: "none", cursor: "pointer", color: "white", padding: "8px", display: "flex", alignItems: "center" }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div style={{ borderTop: "1px solid #1a3a60", paddingBottom: "16px", paddingTop: "8px" }}>
            {links.map(l => {
              const isActive = pathname === l.href;
              return (
                <Link key={l.href} href={l.href}
                  style={{
                    display: "block",
                    color: isActive ? "#FFB81C" : "#d1d5db",
                    textDecoration: "none",
                    padding: "12px 16px",
                    fontSize: "15px",
                    fontWeight: isActive ? "700" : "400",
                    borderLeft: isActive ? "3px solid #2E8B57" : "3px solid transparent",
                    backgroundColor: isActive ? "rgba(46,139,87,0.1)" : "transparent",
                  }}>
                  {l.label}
                </Link>
              );
            })}
            <div style={{ padding: "8px 16px 0" }}>
              <Link href="/members"
                style={{
                  display: "block",
                  backgroundColor: "#2E8B57",
                  color: "white",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "15px",
                  fontWeight: "700",
                  textAlign: "center",
                }}>
                My Profile / Sign In
              </Link>
            </div>
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
