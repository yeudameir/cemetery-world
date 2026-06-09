'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Search, Menu, X, Globe } from 'lucide-react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [lang, setLang] = useState<'he' | 'en'>('he')

  const t = {
    he: { home: 'בית', countries: 'מדינות', search: 'חיפוש', admin: 'ניהול', siteName: 'זיכרון עולמי' },
    en: { home: 'Home', countries: 'Countries', search: 'Search', admin: 'Admin', siteName: 'World Memory' },
  }[lang]

  return (
    <nav className="navbar">
      <div className="container-site">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🪦</span>
            <span style={{ fontFamily: "'Crimson Pro', serif", fontSize: '1.3rem', fontWeight: 600, color: 'var(--ink)' }}>
              {t.siteName}
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="desktop-nav">
            <Link href="/" style={{ padding: '0.4rem 0.8rem', borderRadius: 6, fontSize: '0.9rem', color: 'var(--ink-muted)', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-muted)')}>
              {t.home}
            </Link>
            <Link href="/countries" style={{ padding: '0.4rem 0.8rem', borderRadius: 6, fontSize: '0.9rem', color: 'var(--ink-muted)', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-muted)')}>
              {t.countries}
            </Link>
            <Link href="/search" style={{ padding: '0.4rem 0.8rem', borderRadius: 6, fontSize: '0.9rem', color: 'var(--ink-muted)', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-muted)')}>
              {t.search}
            </Link>

            <div style={{ width: 1, height: 20, background: 'var(--stone-dark)', margin: '0 4px' }} />

            {/* Language toggle */}
            <button onClick={() => setLang(l => l === 'he' ? 'en' : 'he')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.4rem 0.8rem', borderRadius: 6, border: '1px solid var(--stone-dark)', background: 'transparent', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
              <Globe size={14} />
              {lang === 'he' ? 'EN' : 'עב'}
            </button>

            {/* Search icon */}
            <Link href="/search" style={{ padding: '0.5rem', borderRadius: 6, display: 'flex', alignItems: 'center', color: 'var(--ink-muted)', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-muted)')}>
              <Search size={18} />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(o => !o)}
            style={{ display: 'none', padding: '0.4rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink)' }}
            className="mobile-menu-btn">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ borderTop: '1px solid var(--stone-dark)', padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Link href="/" style={{ padding: '0.6rem', borderRadius: 6, color: 'var(--ink)', fontSize: '0.95rem' }} onClick={() => setMenuOpen(false)}>{t.home}</Link>
            <Link href="/countries" style={{ padding: '0.6rem', borderRadius: 6, color: 'var(--ink)', fontSize: '0.95rem' }} onClick={() => setMenuOpen(false)}>{t.countries}</Link>
            <Link href="/search" style={{ padding: '0.6rem', borderRadius: 6, color: 'var(--ink)', fontSize: '0.95rem' }} onClick={() => setMenuOpen(false)}>{t.search}</Link>
            <hr style={{ border: 'none', borderTop: '1px solid var(--stone-dark)', margin: '0.5rem 0' }} />
            <Link href="/admin" style={{ padding: '0.6rem', borderRadius: 6, color: 'var(--gold)', fontSize: '0.95rem', fontWeight: 500 }} onClick={() => setMenuOpen(false)}>{t.admin}</Link>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
