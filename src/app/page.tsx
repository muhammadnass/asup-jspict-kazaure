import Link from 'next/link'

export default function Home() {
  const features = [
    { title: 'Members', desc: 'Meet our chapter members.', href: '/members', icon: '👥' },
    { title: 'History', desc: 'Chapter milestones and struggles.', href: '/history', icon: '📚' },
    { title: 'Publications', desc: 'Research by our members.', href: '/publications', icon: '📰' },
    { title: 'Archives', desc: 'Historical records.', href: '/archives', icon: '🗂️' },
  ]
  return (
    <div>
      <section className="bg-gradient-to-br from-asup-primary to-blue-900 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 bg-asup-secondary rounded-full flex items-center justify-center font-bold text-asup-primary text-2xl mx-auto mb-4">A</div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 leading-tight">ASUP JSPICT Kazaure State Polytechnic</h1>
          <p className="text-asup-secondary font-semibold mb-2 text-sm sm:text-base">ICT Kazaure Chapter</p>
          <p className="text-gray-300 text-sm mb-6 max-w-xl mx-auto">Academic Staff Union of Polytechnics — advancing excellence and protecting staff rights.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/members" className="bg-asup-secondary text-asup-primary px-6 py-2.5 rounded font-bold text-sm hover:bg-yellow-400 transition">View Members</Link>
            <Link href="/history" className="border border-white text-white px-6 py-2.5 rounded font-bold text-sm hover:bg-white hover:text-asup-primary transition">Our History</Link>
          </div>
        </div>
      </section>
      <section className="py-10 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-xl font-bold text-asup-primary mb-6">Explore Our Chapter</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {features.map(f => (
              <Link key={f.href} href={f.href} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md border-2 border-transparent hover:border-asup-secondary transition text-center">
                <div className="text-3xl mb-2">{f.icon}</div>
                <h3 className="font-bold text-asup-primary text-sm mb-1">{f.title}</h3>
                <p className="text-gray-500 text-xs hidden sm:block">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="py-10 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-asup-primary mb-3">About Our Chapter</h2>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">The ASUP JSPICT Kazaure State Polytechnic ICT Kazaure Chapter represents the interests of academic staff, ensuring quality education delivery and promoting professional excellence.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-bold text-asup-primary text-sm mb-1">Our Mission</h4>
              <p className="text-gray-600 text-xs">To protect staff rights and promote excellence through collective action.</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-bold text-asup-primary text-sm mb-1">Our Vision</h4>
              <p className="text-gray-600 text-xs">A sector where staff are adequately remunerated and contributions recognized.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-asup-secondary py-8 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h3 className="text-asup-primary font-bold text-lg mb-2">Are you a staff member?</h3>
          <p className="text-asup-primary text-sm mb-4">Create your staff profile and join our official chapter directory.</p>
          <Link href="/register" className="bg-asup-primary text-white px-6 py-2.5 rounded font-bold text-sm hover:bg-blue-900 transition inline-block">Create Your Profile</Link>
        </div>
      </section>
    </div>
  )
}
