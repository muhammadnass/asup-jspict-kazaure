'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const path = usePathname()

  const links = [
    { href: '/', label: 'Home' },
    { href: '/members', label: 'Members' },
    { href: '/history', label: 'History' },
    { href: '/publications', label: 'Publications' },
    { href: '/archives', label: 'Archives' },
  ]

  const active = (href: string) =>
    path === href ? 'text-asup-secondary font-bold' : 'text-white hover:text-asup-secondary'

  return (
    <nav className="bg-asup-primary shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-asup-secondary rounded-full flex items-center justify-center font-bold text-asup-primary text-sm">A</div>
            <span className="font-bold text-white text-sm">ASUP <span className="hidden sm:inline">Jigawa ICT</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            {links.map(l => (
              <Link key={l.href} href={l.href} className={`transition ${active(l.href)}`}>{l.label}</Link>
            ))}
            <Link href="/admin" className="bg-asup-secondary text-asup-primary px-3 py-1.5 rounded text-xs font-bold hover:bg-yellow-400 transition">Admin</Link>
          </div>
          <button onClick={() => setOpen(!open)} className="md:hidden text-white p-2" aria-label="Toggle menu">
            {open ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
        {open && (
          <div className="md:hidden border-t border-blue-800 py-2 space-y-1">
            {links.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={`block px-3 py-2.5 rounded text-sm transition ${active(l.href)}`}>{l.label}</Link>
            ))}
            <Link href="/admin" onClick={() => setOpen(false)} className="block bg-asup-secondary text-asup-primary px-3 py-2.5 rounded text-sm font-bold mt-1">Admin Portal</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
