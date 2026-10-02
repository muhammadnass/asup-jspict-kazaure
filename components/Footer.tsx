export default function Footer() {
  return (
    <footer className="bg-green text-cream/90 mt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid gap-8 sm:grid-cols-3 text-sm font-body">
        <div>
          <p className="font-display text-lg text-gold mb-2">ASUP &mdash; ICT Kazaure</p>
          <p className="text-cream/70">
            Academic Staff Union of Polytechnics, Jigawa State Polytechnic
            Kazaure Chapter (ICT campus).
          </p>
        </div>
        <div>
          <p className="uppercase tracking-wide text-cream/50 text-xs mb-2">
            Chapter
          </p>
          <ul className="space-y-1 text-cream/80">
            <li>Jigawa State Polytechnic, ICT Kazaure</li>
            <li>Affiliate of ASUP National / NLC</li>
          </ul>
        </div>
        <div>
          <p className="uppercase tracking-wide text-cream/50 text-xs mb-2">
            Contact
          </p>
          <ul className="space-y-1 text-cream/80">
            <li>chapter.secretary@asup-ictkazaure.example</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10 py-4 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} ASUP JSPICT Kazaure State Polytechnic, ICT
        Kazaure Chapter. All rights reserved.
      </div>
    </footer>
  );
}
