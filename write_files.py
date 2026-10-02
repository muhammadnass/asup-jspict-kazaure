import os

base = "/home/muhammad-sanusi/Documents/Projects/ASUP website/asup-jigawa"

files = {}

# ─── LOGIN PAGE ───────────────────────────────────────────────
files[f"{base}/app/login/page.tsx"] = '''\
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError("Incorrect email or password."); setLoading(false); return; }
    router.push("/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "32px", width: "100%", maxWidth: "400px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ width: "48px", height: "48px", backgroundColor: "#003366", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#FFB81C", fontWeight: "bold", fontSize: "20px" }}>A</div>
          <h1 style={{ color: "#003366", fontSize: "20px", fontWeight: "bold", margin: "0 0 4px" }}>Member Sign In</h1>
          <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>ASUP Jigawa ICT Kazaure Staff Portal</p>
        </div>
        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 12px", borderRadius: "6px", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "4px" }}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }} />
          </div>
          <button type="submit" disabled={loading}
            style={{ backgroundColor: "#003366", color: "white", padding: "11px", borderRadius: "6px", border: "none", fontWeight: "bold", fontSize: "14px", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p style={{ textAlign: "center", fontSize: "13px", color: "#888", margin: "16px 0 0" }}>
          No account yet?{" "}
          <a href="/register" style={{ color: "#003366", fontWeight: "600" }}>Create one here</a>
        </p>
        <p style={{ textAlign: "center", fontSize: "13px", color: "#888", margin: "8px 0 0" }}>
          Admin?{" "}
          <a href="/admin/login" style={{ color: "#003366", fontWeight: "600" }}>Admin portal →</a>
        </p>
      </div>
    </div>
  );
}
'''

# ─── JOURNAL PAGE ─────────────────────────────────────────────
files[f"{base}/app/journal/page.tsx"] = '''\
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
'''

# ─── ARTICLES PAGE ────────────────────────────────────────────
os.makedirs(f"{base}/app/articles", exist_ok=True)
files[f"{base}/app/articles/page.tsx"] = '''\
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const revalidate = 60;

export default async function ArticlesPage() {
  const supabase = createClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("*, members(full_name, photo_url)")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 16px" }}>

        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "12px", fontWeight: "bold", color: "#FFB81C", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 6px" }}>Knowledge Hub</p>
          <h1 style={{ color: "#003366", fontSize: "28px", fontWeight: "bold", margin: "0 0 8px" }}>Member Articles</h1>
          <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
            Research insights and knowledge shared by ASUP Jigawa ICT Kazaure chapter members and the broader academic community.
          </p>
        </div>

        {!articles || articles.length === 0 ? (
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "48px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: "40px", margin: "0 0 12px" }}>✍️</p>
            <h3 style={{ color: "#003366", margin: "0 0 8px" }}>No articles yet</h3>
            <p style={{ color: "#888", fontSize: "14px", margin: "0 0 16px" }}>Be the first to share your knowledge with the community.</p>
            <a href="/login" style={{ backgroundColor: "#003366", color: "white", padding: "10px 20px", borderRadius: "6px", textDecoration: "none", fontSize: "13px", fontWeight: "600" }}>
              Sign in to Write
            </a>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {(articles as any[]).map((article) => (
              <Link key={article.id} href={`/articles/${article.id}`} style={{ textDecoration: "none" }}>
                <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0", cursor: "pointer" }}>
                  <h2 style={{ color: "#003366", fontSize: "18px", fontWeight: "bold", margin: "0 0 8px" }}>{article.title}</h2>
                  {article.excerpt && (
                    <p style={{ color: "#666", fontSize: "14px", margin: "0 0 12px", lineHeight: "1.6" }}>{article.excerpt}</p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#e5e7eb", overflow: "hidden", flexShrink: 0 }}>
                      {article.members?.photo_url
                        ? <img src={article.members.photo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", color: "#003366" }}>{article.members?.full_name?.charAt(0)}</div>
                      }
                    </div>
                    <span style={{ fontSize: "13px", color: "#888" }}>{article.members?.full_name ?? "ASUP Member"}</span>
                    <span style={{ fontSize: "13px", color: "#ccc", marginLeft: "auto" }}>
                      {new Date(article.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
'''

# ─── NAVBAR ───────────────────────────────────────────────────
files[f"{base}/components/Navbar.tsx"] = '''\
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
              <div style={{ color: "white", fontWeight: "bold", fontSize: "13px" }}>ASUP</div>
              <div style={{ color: "#9ca3af", fontSize: "10px" }}>Jigawa ICT Kazaure</div>
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
'''

# ─── WRITE ALL FILES ──────────────────────────────────────────
for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    lines = content.count("\n")
    print(f"✅ Written ({lines} lines): {os.path.basename(os.path.dirname(path))}/{os.path.basename(path)}")

print("\n🎉 All files written successfully!")
