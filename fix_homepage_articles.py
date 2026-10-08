import os

base = "/home/muhammad-sanusi/Documents/Projects/ASUP website/asup-jigawa"
path = f"{base}/app/page.tsx"

content = """
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

export default async function Home() {
  const supabase = createClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, excerpt, created_at, members(full_name, photo_url, role)')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(3)

  const recentArticles = articles ?? []

  const features = [
    { title: 'Members', desc: 'Meet our chapter members and their profiles.', href: '/members', icon: '👥' },
    { title: 'History', desc: 'Explore our chapter milestones and struggles.', href: '/history', icon: '📚' },
    { title: 'Publications', desc: 'Research papers and articles by our members.', href: '/publications', icon: '📰' },
    { title: 'Archives', desc: 'Historical records and institutional documents.', href: '/archives', icon: '🗂️' },
  ]

  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-asup-primary to-blue-900 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 bg-asup-secondary rounded-full flex items-center justify-center font-bold text-asup-primary text-2xl mx-auto mb-4">A</div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 leading-tight">
            ASUP JSPICT Kazaure Chapter
          </h1>
          <p className="text-asup-secondary font-semibold mb-2 text-sm sm:text-base">
            Jigawa State Polytechnic for Information and Communication Technology
          </p>
          <p className="text-gray-300 text-sm mb-6 max-w-xl mx-auto">
            Academic Staff Union of Polytechnics — advancing excellence, protecting staff rights, and fostering professional development.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/members" className="bg-asup-secondary text-asup-primary px-6 py-2.5 rounded font-bold text-sm hover:bg-yellow-400 transition">
              View Members
            </Link>
            <Link href="/register" className="border border-white text-white px-6 py-2.5 rounded font-bold text-sm hover:bg-white hover:text-asup-primary transition">
              Create Your Profile
            </Link>
          </div>
        </div>
      </section>

      {/* ── Quick nav ── */}
      <section className="py-10 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-xl font-bold text-asup-primary mb-6">Explore Our Chapter</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {features.map(f => (
              <Link key={f.href} href={f.href}
                className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md border-2 border-transparent hover:border-asup-secondary transition text-center">
                <div className="text-3xl mb-2">{f.icon}</div>
                <h3 className="font-bold text-asup-primary text-sm mb-1">{f.title}</h3>
                <p className="text-gray-500 text-xs hidden sm:block">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent Articles ── */}
      <section className="py-10 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Section header */}
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-xs font-bold text-asup-secondary uppercase tracking-widest mb-1">Knowledge Hub</p>
              <h2 className="text-xl font-bold text-asup-primary">Recent Articles</h2>
            </div>
            <Link href="/articles" className="text-asup-primary text-sm font-semibold hover:underline">
              View all →
            </Link>
          </div>

          {recentArticles.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <p className="text-4xl mb-3">✍️</p>
              <p className="text-gray-500 text-sm mb-1">No articles published yet.</p>
              <p className="text-gray-400 text-xs">Sign in to be the first to share your knowledge.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {recentArticles.map((article: any) => {
                const author = article.members
                const date = new Date(article.created_at).toLocaleDateString('en-NG', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })
                return (
                  <Link key={article.id} href={`/articles/${article.id}`}
                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition border border-gray-100 flex flex-col">

                    {/* Colour band */}
                    <div className="h-1.5 bg-gradient-to-r from-asup-primary to-asup-secondary" />

                    <div className="p-5 flex flex-col flex-1">
                      {/* Title */}
                      <h3 className="font-bold text-asup-primary text-sm leading-snug mb-2 line-clamp-3">
                        {article.title}
                      </h3>

                      {/* Excerpt */}
                      {article.excerpt && (
                        <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-3 flex-1">
                          {article.excerpt}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100">
                        {/* Avatar */}
                        <div className="w-7 h-7 rounded-full bg-blue-100 overflow-hidden flex-shrink-0">
                          {author?.photo_url
                            ? <img src={author.photo_url} className="w-full h-full object-cover" alt="" />
                            : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-asup-primary">
                                {author?.full_name?.charAt(0) || 'A'}
                              </div>
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-700 truncate">
                            {author?.full_name || 'ASUP Member'}
                          </p>
                          <p className="text-xs text-gray-400">{date}</p>
                        </div>
                        <span className="ml-auto text-asup-primary text-xs font-bold whitespace-nowrap">
                          Read →
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Write CTA */}
          <div className="mt-6 text-center">
            <Link href="/login"
              className="inline-block bg-asup-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-900 transition">
              Sign In to Write an Article
            </Link>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section className="py-10 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-bold text-asup-primary mb-3">About Our Chapter</h2>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            The ASUP JSPICT Kazaure Chapter represents the interests of academic staff at Jigawa State Polytechnic for Information and Communication Technology, ensuring quality education delivery and promoting professional excellence.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-bold text-asup-primary text-sm mb-1">Our Mission</h4>
              <p className="text-gray-600 text-xs">To protect staff rights and promote excellence through collective action and advocacy.</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-bold text-asup-primary text-sm mb-1">Our Vision</h4>
              <p className="text-gray-600 text-xs">A sector where staff are adequately remunerated and their contributions fully recognized.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Join CTA ── */}
      <section className="bg-asup-secondary py-8 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h3 className="text-asup-primary font-bold text-lg mb-2">Are you a staff member?</h3>
          <p className="text-asup-primary text-sm mb-4">
            Create your staff profile and join our official chapter directory.
          </p>
          <Link href="/register"
            className="bg-asup-primary text-white px-6 py-2.5 rounded font-bold text-sm hover:bg-blue-900 transition inline-block">
            Create Your Profile
          </Link>
        </div>
      </section>
    </div>
  )
}
""".lstrip()

with open(path, "w") as f:
    f.write(content)
print(f"✅ Homepage updated: {content.count(chr(10))} lines")
print("   Features added:")
print("   - Recent articles section (latest 3)")
print("   - Article cards with title, excerpt, author, date")
print("   - Read full article link")
print("   - View all articles link")
print("   - Write article CTA")
