import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Search, Globe, BookOpen, MapPin } from 'lucide-react'

async function getStats() {
  const [{ count: countries }, { count: cemeteries }, { count: graves }] = await Promise.all([
    supabase.from('countries').select('*', { count: 'exact', head: true }),
    supabase.from('cemeteries').select('*', { count: 'exact', head: true }),
    supabase.from('graves').select('*', { count: 'exact', head: true }),
  ])
  return { countries: countries ?? 0, cemeteries: cemeteries ?? 0, graves: graves ?? 0 }
}

async function getCountries() {
  const { data } = await supabase.from('countries').select('*').order('name').limit(12)
  return data ?? []
}

async function getRecentGraves() {
  const { data } = await supabase
    .from('graves')
    .select('*, grave_images(*), cemetery:cemeteries(name, name_he)')
    .order('created_at', { ascending: false })
    .limit(8)
  return data ?? []
}

export default async function HomePage() {
  const [stats, countries, recentGraves] = await Promise.all([getStats(), getCountries(), getRecentGraves()])

  return (
    <main>
      <section style={{ background: 'linear-gradient(135deg, #1a1614 0%, #2d2420 50%, #1e2a1e 100%)', color: 'white', padding: '6rem 0 4rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(154,124,63,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(61,90,62,0.15) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div className="container-site" style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: 'var(--gold-light)', textTransform: 'uppercase', fontWeight: 500 }}>
              מאגר בתי עלמין יהודיים בעולם
            </span>
          </div>
          <h1 style={{ fontFamily: "'Crimson Pro', serif", fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 600, lineHeight: 1.15, marginBottom: '1.5rem' }} dir="rtl">
            שומרים על הזיכרון<br />
            <span style={{ color: 'var(--gold-light)' }}>לדורות הבאים</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', maxWidth: 560, margin: '0 auto 2.5rem', lineHeight: 1.8 }} dir="rtl">
            מאגר המצבות היהודיות הגדול בעולם — מרוקו, פולין, תוניסיה ועוד עשרות מדינות.
          </p>
          <form action="/search" method="get" style={{ display: 'flex', maxWidth: 520, margin: '0 auto 3rem', borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
            <input name="q" type="text" placeholder="חפש שם, עיר, מדינה..." dir="rtl"
              style={{ flex: 1, padding: '1rem 1.25rem', border: 'none', fontSize: '1rem', fontFamily: 'inherit', outline: 'none', background: 'white', color: 'var(--ink)' }} />
            <button type="submit" style={{ padding: '0 1.5rem', background: 'var(--gold)', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 500 }}>
              <Search size={18} />חפש
            </button>
          </form>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
            {[{ n: stats.countries, label: 'מדינות' }, { n: stats.cemeteries, label: 'בתי עלמין' }, { n: stats.graves, label: 'מצבות' }].map(({ n, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: '2.2rem', fontWeight: 600, color: 'var(--gold-light)', lineHeight: 1 }}>{n.toLocaleString()}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 0' }}>
        <div className="container-site">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }} dir="rtl">
            <div>
              <h2 className="section-title">מדינות</h2>
              <p className="section-subtitle">בחר מדינה לצפייה בבתי העלמין</p>
            </div>
            <Link href="/countries" style={{ color: 'var(--gold)', fontSize: '0.9rem', fontWeight: 500 }}>כל המדינות ←</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {countries.map(country => (
              <Link key={country.id} href={`/country/${country.id}`} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>{country.flag_emoji}</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 2 }}>{country.name_he}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{country.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {recentGraves.length > 0 && (
        <section style={{ padding: '4rem 0', background: 'var(--stone)' }}>
          <div className="container-site">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }} dir="rtl">
              <div>
                <h2 className="section-title">נוספו לאחרונה</h2>
                <p className="section-subtitle">מצבות שנוספו למאגר לאחרונה</p>
              </div>
              <Link href="/search" style={{ color: 'var(--gold)', fontSize: '0.9rem', fontWeight: 500 }}>כל המצבות ←</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {recentGraves.map((grave: any) => {
                const img = grave.grave_images?.find((i: any) => i.is_primary) ?? grave.grave_images?.[0]
                const name = [grave.first_name_he, grave.last_name_he].filter(Boolean).join(' ') || [grave.first_name, grave.last_name].filter(Boolean).join(' ') || 'לא ידוע'
                return (
                  <Link key={grave.id} href={`/grave/${grave.id}`} className="card" style={{ display: 'block' }}>
                    <div style={{ aspectRatio: '3/4', background: 'var(--stone)', overflow: 'hidden' }}>
                      {img ? <img src={img.url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, opacity: 0.2 }}>🪦</div>}
                    </div>
                    <div style={{ padding: '0.75rem' }} dir="rtl">
                      <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 2 }}>{name}</p>
                      {grave.cemetery && <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{grave.cemetery.name_he || grave.cemetery.name}</p>}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <section style={{ padding: '4rem 0' }}>
        <div className="container-site">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }} dir="rtl">
            {[
              { icon: '🌍', title: 'מדינות ברחבי העולם', text: 'מרוקו, פולין, תוניסיה, צרפת ועוד. כל קהילה, כל עיר.' },
              { icon: '📖', title: 'תולדות ומסמכים', text: 'לכל מצבה — ביוגרפיה, תמלול הכיתוב, פרטי המשפחה ומידע היסטורי.' },
              { icon: '📍', title: 'מיקום מדויק', text: 'קישור ישיר לגוגל מפות לכל מצבה ולכל בית עלמין.' },
              { icon: '🔍', title: 'חיפוש מתקדם', text: 'חפש לפי שם, עיר, מדינה, שנה, שם משפחה ועוד.' },
            ].map(f => (
              <div key={f.title} style={{ padding: '1.5rem', borderRadius: 12, border: '1px solid var(--stone-dark)', background: 'white' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--ink-muted)', lineHeight: 1.7 }}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
