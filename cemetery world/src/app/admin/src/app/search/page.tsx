import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Search, MapPin } from 'lucide-react'

interface Props {
  searchParams: { q?: string; country?: string; lang?: string }
}

export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams.q?.trim() ?? ''

  let gravesQuery = supabase
    .from('graves')
    .select('*, grave_images(*), cemetery:cemeteries(name, name_he, city:cities(name, name_he, country:countries(name, name_he, flag_emoji)))')
    .order('created_at', { ascending: false })
    .limit(48)

  if (query) {
    gravesQuery = gravesQuery.or(
      `first_name.ilike.%${query}%,last_name.ilike.%${query}%,first_name_he.ilike.%${query}%,last_name_he.ilike.%${query}%`
    )
  }

  const { data: graves, count } = await gravesQuery

  return (
    <main style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container-site">
        {/* Header */}
        <div dir="rtl" style={{ marginBottom: '2rem' }}>
          <h1 className="section-title">חיפוש</h1>
          <p className="section-subtitle">חפש לפי שם, עיר, מדינה</p>
        </div>

        {/* Search form */}
        <form method="get" style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', maxWidth: 560, gap: 0, borderRadius: 10, overflow: 'hidden', border: '1.5px solid var(--stone-dark)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <input
              name="q"
              type="text"
              defaultValue={query}
              placeholder="חפש שם, עיר, מדינה..."
              dir="rtl"
              style={{ flex: 1, padding: '0.85rem 1.1rem', border: 'none', fontSize: '1rem', fontFamily: 'inherit', outline: 'none', background: 'white', color: 'var(--ink)' }}
              autoFocus
            />
            <button type="submit" style={{ padding: '0 1.4rem', background: 'var(--gold)', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 500 }}>
              <Search size={18} /> חפש
            </button>
          </div>
        </form>

        {/* Results count */}
        {query && (
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '1.5rem' }} dir="rtl">
            {graves?.length ? `נמצאו ${graves.length} תוצאות עבור "${query}"` : `לא נמצאו תוצאות עבור "${query}"`}
          </p>
        )}

        {/* Results grid */}
        {graves && graves.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {graves.map((grave: any) => {
              const img = grave.grave_images?.find((i: any) => i.is_primary) ?? grave.grave_images?.[0]
              const name = [grave.first_name_he, grave.last_name_he].filter(Boolean).join(' ') ||
                [grave.first_name, grave.last_name].filter(Boolean).join(' ') || 'לא ידוע'
              const cemetery = grave.cemetery as any
              const city = cemetery?.city
              const country = city?.country
              return (
                <Link key={grave.id} href={`/grave/${grave.id}`} className="card" style={{ display: 'block' }}>
                  <div style={{ aspectRatio: '3/4', background: 'var(--stone)', overflow: 'hidden' }}>
                    {img
                      ? <img src={img.url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, opacity: 0.2 }}>🪦</div>
                    }
                  </div>
                  <div style={{ padding: '0.75rem' }} dir="rtl">
                    <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 2, fontFamily: "'Crimson Pro', serif" }}>{name}</p>
                    {grave.death_date_hebrew && <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginBottom: 4 }}>{grave.death_date_hebrew}</p>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                      {country && <span>{country.flag_emoji}</span>}
                      <span>{cemetery?.name_he || cemetery?.name}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : query ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--ink-muted)' }} dir="rtl">
            <p style={{ fontSize: '3rem', marginBottom: 12, opacity: 0.3 }}>🔍</p>
            <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>לא נמצאו תוצאות</p>
            <p style={{ fontSize: '0.88rem' }}>נסה לחפש בשם אחר או בשפה אחרת</p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--ink-muted)' }} dir="rtl">
            <p style={{ fontSize: '3rem', marginBottom: 12, opacity: 0.3 }}>🪦</p>
            <p style={{ fontSize: '1rem' }}>הכנס שם כדי לחפש</p>
          </div>
        )}
      </div>
    </main>
  )
}
