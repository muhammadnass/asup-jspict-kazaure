import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

export default async function Home() {
  const supabase = createClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, excerpt, created_at, author:author_id(full_name, photo_url, role, department)')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(3)

  const recentArticles = articles ?? []

  const features = [
    { title: 'Members', desc: 'Meet our chapter members and their profiles.', href: '/members', icon: '👥' },
    { title: 'Struggles', desc: 'Our history and challenges as a chapter.', href: '/struggles', icon: '📚' },
    { title: 'Research Outputs', desc: 'Research papers and publications by our members.', href: '/research-outputs', icon: '📰' },
    { title: 'Events', desc: 'Chapter events, workshops and institutional records.', href: '/events', icon: '🗂️' },
    { title: 'E-Learning', desc: 'Access lecture videos, notes and slides.', href: '/e-learning', icon: '🎓' },
    { title: 'Knowledge Hub', desc: 'Articles and insights from our members.', href: '/knowledge-hub', icon: '💡' },
  ]

  return (
    <div>
      {/* ── Hero ── */}
      <section style={{ background: "linear-gradient(135deg, #00214D 0%, #003366 60%, #004080 100%)", color: "white", padding: "48px 16px 56px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", overflow: "hidden", border: "3px solid #2E8B57", margin: "0 auto 20px", backgroundColor: "white" }}>
            <img src="/asup-logo.png" alt="ASUP Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <h1 style={{ fontSize: "clamp(22px, 5vw, 38px)", fontWeight: "800", color: "white", marginBottom: "8px", lineHeight: "1.2" }}>
            ASUP JSPICT Kazaure Chapter
          </h1>
          <p style={{ color: "#FFB81C", fontWeight: "600", marginBottom: "8px", fontSize: "clamp(13px, 2vw, 16px)" }}>
            Jigawa State Polytechnic for Information and Communication Technology
          </p>
          <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "32px", maxWidth: "560px", margin: "0 auto 32px", lineHeight: "1.7" }}>
            Academic Staff Union of Polytechnics — advancing excellence, protecting staff rights, and fostering professional development at JSPICT.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/members"
              style={{ backgroundColor: "#FFB81C", color: "#00214D", padding: "12px 28px", borderRadius: "6px", fontWeight: "700", fontSize: "14px", textDecoration: "none" }}>
              View Members
            </Link>
            <a href="https://www.jspict.edu.ng" target="_blank" rel="noopener noreferrer"
              style={{ backgroundColor: "transparent", color: "white", padding: "12px 28px", borderRadius: "6px", fontWeight: "700", fontSize: "14px", textDecoration: "none", border: "2px solid rgba(255,255,255,0.4)" }}>
              Visit JSPICT →
            </a>
          </div>
        </div>
      </section>

      {/* ── JSPICT Enrolment Banner ── */}
      <section style={{ backgroundColor: "#2E8B57", padding: "20px 16px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <p style={{ color: "white", fontWeight: "700", fontSize: "14px", margin: 0 }}>
              🎓 New Programmes at JSPICT — Now Enrolling!
            </p>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "12px", margin: "2px 0 0" }}>
              ND Artificial Intelligence (commencing next semester) · International Informatics Diploma (UK certification, run locally)
            </p>
          </div>
          <a href="https://www.jspict.edu.ng" target="_blank" rel="noopener noreferrer"
            style={{ backgroundColor: "white", color: "#2E8B57", padding: "10px 20px", borderRadius: "6px", fontWeight: "700", fontSize: "13px", textDecoration: "none", whiteSpace: "nowrap" }}>
            Apply Now →
          </a>
        </div>
      </section>

      {/* ── Quick nav ── */}
      <section style={{ padding: "40px 16px", backgroundColor: "#f8f9fa" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "20px", fontWeight: "700", color: "#00214D", marginBottom: "24px" }}>Explore Our Chapter</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
            {features.map(f => (
              <Link key={f.href} href={f.href}
                style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px 16px", textAlign: "center", textDecoration: "none", border: "2px solid transparent", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "block" }}>
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>{f.icon}</div>
                <h3 style={{ fontWeight: "700", color: "#00214D", fontSize: "13px", marginBottom: "4px" }}>{f.title}</h3>
                <p style={{ color: "#6b7280", fontSize: "11px", lineHeight: "1.5", margin: 0 }}>{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Courses Section ── */}
      <section style={{ padding: "40px 16px", backgroundColor: "white" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <p style={{ fontSize: "11px", fontWeight: "700", color: "#2E8B57", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>JSPICT Programmes</p>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#00214D", margin: 0 }}>Study at JSPICT Kazaure</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {[
              { title: "ND Artificial Intelligence", badge: "NEW", desc: "Groundbreaking new programme preparing students for the AI-driven economy. Commencing next semester.", color: "#FFB81C" },
              { title: "International Informatics Diploma", badge: "UK CERT", desc: "UK-certified programme from Informatics, run locally at JSPICT campus. Same qualification as UK graduates.", color: "#2E8B57" },
              { title: "ND/HND Computer Science", badge: "POPULAR", desc: "Full-stack computing education from foundations to advanced software development.", color: "#00214D" },
              { title: "ND Computer Engineering", badge: "TECHNICAL", desc: "Hardware, embedded systems and networks — building the digital infrastructure of tomorrow.", color: "#003d99" },
            ].map(course => (
              <div key={course.title} style={{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "20px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", backgroundColor: course.color }} />
                <span style={{ display: "inline-block", backgroundColor: course.color, color: "white", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "10px", marginBottom: "8px", letterSpacing: "0.05em" }}>
                  {course.badge}
                </span>
                <h3 style={{ fontWeight: "700", color: "#00214D", fontSize: "14px", marginBottom: "8px" }}>{course.title}</h3>
                <p style={{ color: "#6b7280", fontSize: "12px", lineHeight: "1.6", marginBottom: "12px" }}>{course.desc}</p>
                <a href="https://www.jspict.edu.ng" target="_blank" rel="noopener noreferrer"
                  style={{ color: course.color, fontSize: "12px", fontWeight: "700", textDecoration: "none" }}>
                  Learn More →
                </a>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <a href="https://www.jspict.edu.ng" target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-block", backgroundColor: "#00214D", color: "white", padding: "12px 32px", borderRadius: "6px", fontWeight: "700", fontSize: "14px", textDecoration: "none" }}>
              View All Programmes at JSPICT
            </a>
          </div>
        </div>
      </section>

      {/* ── Recent Articles / Knowledge Hub ── */}
      <section style={{ padding: "40px 16px", backgroundColor: "#f8f9fa" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: "700", color: "#FFB81C", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Knowledge Hub</p>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#00214D", margin: 0 }}>Recent Articles</h2>
            </div>
            <Link href="/knowledge-hub" style={{ color: "#00214D", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
              View all →
            </Link>
          </div>

          {recentArticles.length === 0 ? (
            <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "40px", textAlign: "center" }}>
              <p style={{ fontSize: "36px", marginBottom: "12px" }}>✍️</p>
              <p style={{ color: "#6b7280", fontSize: "14px" }}>No articles published yet.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {recentArticles.map((article: any) => {
                const author = article.author
                const date = new Date(article.created_at).toLocaleDateString('en-NG', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })
                return (
                  <Link key={article.id} href={`/articles/${article.id}`}
                    style={{ backgroundColor: "white", borderRadius: "12px", overflow: "hidden", textDecoration: "none", display: "flex", flexDirection: "column", border: "1px solid #e5e7eb" }}>
                    <div style={{ height: "4px", background: "linear-gradient(90deg, #00214D, #FFB81C)" }} />
                    <div style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1 }}>
                      <h3 style={{ fontWeight: "700", color: "#00214D", fontSize: "13px", lineHeight: "1.5", marginBottom: "8px" }}>
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p style={{ color: "#6b7280", fontSize: "12px", lineHeight: "1.6", marginBottom: "16px", flex: 1 }}>
                          {article.excerpt}
                        </p>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "12px", borderTop: "1px solid #f3f4f6", marginTop: "auto" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#dbeafe", overflow: "hidden", flexShrink: 0 }}>
                          {author?.photo_url
                            ? <img src={author.photo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "#00214D" }}>
                                {author?.full_name?.charAt(0) || 'A'}
                              </div>
                          }
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ fontSize: "11px", fontWeight: "600", color: "#374151", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {author?.full_name || 'ASUP Member'}
                          </p>
                          <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>{date}</p>
                        </div>
                        <span style={{ color: "#00214D", fontSize: "11px", fontWeight: "700", whiteSpace: "nowrap" }}>Read →</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── About ── */}
      <section style={{ padding: "40px 16px", backgroundColor: "white" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", backgroundColor: "#f8f9fa", borderRadius: "12px", padding: "28px 32px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#00214D", marginBottom: "12px" }}>About Our Chapter</h2>
          <p style={{ color: "#4b5563", fontSize: "14px", lineHeight: "1.8", marginBottom: "20px" }}>
            The ASUP JSPICT Kazaure Chapter represents the interests of academic staff at Jigawa State Polytechnic for Information and Communication Technology, ensuring quality education delivery and promoting professional excellence.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ backgroundColor: "#dbeafe", borderRadius: "8px", padding: "16px" }}>
              <h4 style={{ fontWeight: "700", color: "#00214D", fontSize: "13px", marginBottom: "4px" }}>Our Mission</h4>
              <p style={{ color: "#4b5563", fontSize: "12px", margin: 0, lineHeight: "1.6" }}>To protect staff rights and promote excellence through collective action and advocacy.</p>
            </div>
            <div style={{ backgroundColor: "#fef3c7", borderRadius: "8px", padding: "16px" }}>
              <h4 style={{ fontWeight: "700", color: "#00214D", fontSize: "13px", marginBottom: "4px" }}>Our Vision</h4>
              <p style={{ color: "#4b5563", fontSize: "12px", margin: 0, lineHeight: "1.6" }}>A sector where staff are adequately remunerated and their contributions fully recognized.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
