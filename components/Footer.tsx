import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#00214D", color: "#d1d5db" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 16px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "32px", marginBottom: "32px" }}>

          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", border: "2px solid #2E8B57", flexShrink: 0, backgroundColor: "white" }}>
                <Image src="/asup-logo.png" alt="ASUP Logo" width={40} height={40} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div>
                <div style={{ color: "white", fontWeight: "800", fontSize: "13px" }}>ASUP JSPICT</div>
                <div style={{ color: "#2E8B57", fontSize: "10px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Kazaure Chapter</div>
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "#9ca3af", lineHeight: "1.6", margin: 0 }}>
              Academic Staff Union of Polytechnics — Jigawa State Polytechnic for Information and Communication Technology, Kazaure Chapter.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p style={{ color: "#FFB81C", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
              Quick Links
            </p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { href: "/members", label: "Members" },
                { href: "/struggles", label: "Struggles" },
                { href: "/research-outputs", label: "Research Outputs" },
                { href: "/events", label: "Events" },
                { href: "/knowledge-hub", label: "Knowledge Hub" },
                { href: "/e-learning", label: "E-Learning" },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} style={{ color: "#9ca3af", textDecoration: "none", fontSize: "13px" }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Chapter Info */}
          <div>
            <p style={{ color: "#FFB81C", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
              Chapter Info
            </p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "#9ca3af" }}>
              <li>Jigawa State Polytechnic ICT</li>
              <li>Kazaure, Jigawa State</li>
              <li>Affiliate of ASUP National</li>
              <li>Member of NLC</li>
            </ul>
          </div>

          {/* JSPICT Link */}
          <div>
            <p style={{ color: "#FFB81C", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
              JSPICT Polytechnic
            </p>
            <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "12px", lineHeight: "1.6" }}>
              Interested in studying at JSPICT? Explore our programmes including ND Artificial Intelligence and International Informatics Diploma.
            </p>
            <a href="https://www.jspict.edu.ng" target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-block", backgroundColor: "#2E8B57", color: "white", padding: "8px 16px", borderRadius: "6px", textDecoration: "none", fontSize: "13px", fontWeight: "600", textAlign: "center" }}>
              Visit JSPICT Website →
            </a>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
          <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
            © {new Date().getFullYear()} ASUP JSPICT Kazaure Chapter. All rights reserved.
          </p>
          <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
            Official website of ASUP — Jigawa State Polytechnic ICT
          </p>
        </div>
      </div>
    </footer>
  );
}
