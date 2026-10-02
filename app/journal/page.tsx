export default function JournalPage() {
  const features = [
    ["🔬", "Peer-reviewed research articles across ICT and allied disciplines"],
    ["🌍", "Scopus and Web of Science indexing target"],
    ["📬", "Open submission for all Nigerian polytechnic academics"],
    ["⚡", "Fast review turnaround — 4 to 6 weeks"],
    ["🆓", "Free to publish for ASUP Jigawa chapter members"],
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "60px 16px", textAlign: "center" }}>

        <div style={{ fontSize: "64px", marginBottom: "16px" }}>📖</div>

        <div style={{ display: "inline-block", backgroundColor: "#FFB81C", color: "#003366", padding: "4px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", marginBottom: "16px", letterSpacing: "1px" }}>
          COMING SOON
        </div>

        <h1 style={{ color: "#003366", fontSize: "28px", fontWeight: "bold", margin: "0 0 12px" }}>
          ASUP Jigawa ICT Journal
        </h1>

        <p style={{ color: "#555", fontSize: "16px", lineHeight: "1.7", maxWidth: "520px", margin: "0 auto 32px" }}>
          We are establishing an official peer-reviewed academic journal for ASUP Jigawa State Polytechnic ICT Kazaure chapter,
          targeting <strong>Scopus</strong> indexing and open to researchers across all disciplines.
        </p>

        <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: "32px", textAlign: "left" }}>
          <h3 style={{ color: "#003366", fontSize: "16px", fontWeight: "bold", marginBottom: "16px" }}>What to expect:</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {features.map(([icon, text], i) => (
              <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "20px" }}>{icon}</span>
                <p style={{ margin: 0, fontSize: "14px", color: "#555", lineHeight: "1.5" }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: "#003366", borderRadius: "12px", padding: "24px", color: "white" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "bold", margin: "0 0 8px" }}>Get notified when we launch</h3>
          <p style={{ fontSize: "13px", color: "#9ca3af", margin: "0 0 16px" }}>
            Contact the chapter PRO to be added to the journal launch notification list.
          </p>
          <a href="mailto:msnasir.international@jspict.edu.ng"
            style={{ backgroundColor: "#FFB81C", color: "#003366", padding: "10px 20px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold", fontSize: "13px" }}>
            Contact PRO
          </a>
        </div>
      </div>
    </div>
  );
}
