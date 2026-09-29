export default function Footer() {
  return (
    <footer className="bg-asup-primary text-white mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div>
            <h4 className="text-asup-secondary font-bold text-sm mb-2">ASUP Jigawa ICT</h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              Academic Staff Union of Polytechnics — Jigawa State Polytechnic ICT Kazaure Chapter.
            </p>
          </div>
          <div>
            <h4 className="text-asup-secondary font-bold text-sm mb-2">Quick Links</h4>
            <ul className="space-y-1">
              {['/', '/members', '/history', '/publications', '/archives'].map((href, i) => (
                <li key={href}>
                  <a href={href} className="text-gray-400 text-xs hover:text-asup-secondary transition">
                    {['Home', 'Members', 'History', 'Publications', 'Archives'][i]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-asup-secondary font-bold text-sm mb-2">Contact</h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              Jigawa State Polytechnic<br />
              ICT Kazaure, Jigawa State<br />
              Nigeria
            </p>
          </div>
        </div>
        <div className="border-t border-blue-800 pt-4 text-center">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} ASUP — Jigawa State Polytechnic ICT Kazaure Chapter
          </p>
        </div>
      </div>
    </footer>
  )
}
