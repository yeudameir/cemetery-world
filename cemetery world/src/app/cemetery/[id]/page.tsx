import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Calendar } from 'lucide-react'

export default async function CemeteryPage({ params }: { params: { id: string } }) {
  const { data: cemetery } = await supabase
    .from('cemeteries')
    .select('*, city:cities(*, country:countries(*))')
    .eq('id', params.id)
    .single()

  if (!cemetery) notFound()

  const { data: graves, count } = await supabase
    .from('graves')
    .select('*, grave_images(*)', { count: 'exact' })
    .eq('cemetery_id', params.id)
    .order('last_name_he', { ascending: true })

  const city = cemetery.city as any
  const country = city?.country

  const mapsUrl = cemetery.lat && cemetery.lng
    ? `https://www.google.com/maps?q=${cemetery.lat},${cemetery.lng}`
    : null

  return (
    <main style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container-site">
        {/* Breadcrumb */}
        <nav style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '1.5rem' }} dir="rtl">
          <Link href="/">בית</Link> ›{' '}
          {country && <><Link href={`/country/${country.id}`}>{country.name_he}</Link> › </>}
          {city && <><Link href={`/city/${city.id}`}>{city.name_he || city.name}</Link> › </>}
          <span style={{ color: 'var(--ink)' }}>{cemetery.name_he || cemetery.name}</span>
        </nav>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          {cemetery.cover_image && (
            <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: '1.5rem', maxHeight: 300 }}>
              <img src={cemetery.cover_image} alt={cemetery.name_he} style={{ width: '100%', objectFit: 'cover', maxHeight: 300 }} />
            </div>
          )}
          <div dir="rtl">
            <h1 style={{ fontFamily: "'Crimson Pro', serif", fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 600, marginBottom: 8 }}>
              {cemetery.name_he || cemetery.name}
            </h1>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: 12 }}>
              {city && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.88rem', color: 'var(--ink-muted)' }}><MapPin size={14} />{city.name_he || city.name}{country && `, ${country.name_he}`}</span>}
              {cemetery.founded_year && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.88rem', color: 'var(--ink-muted)' }}><Calendar size={14} />הוקם {cemetery.founded_year}</span>}
              <span style={{ fontSize: '0.88rem', color: 'var(--ink-muted)' }}>🪦 {count ?? 0} מצבות במאגר</span>
            </div>
            {cemetery.community && <span className="badge badge-unknown" style={{ marginBottom: 12 }}>{cemetery.community}</span>}
            {cemetery.condition && (
              <span className={`badge badge-${cemetery.condition === 'good' ? 'good' : cemetery.condition === 'fair' ? 'fair' : 'poor'}`} style={{ margin: '0 8px' }}>
                {cemetery.condition === 'good' ? 'מצב טוב' : cemetery.condition === 'fair' ? 'מצב בינוני' : 'מצב רע'}
              </span>
            )}
            {(cemetery.description_he || cemetery.description) && (
              <p style={{ fontSize: '0.95rem', color: 'var(--ink-muted)', lineHeight: 1.8, maxWidth: 700, marginTop: 12 }}>
                {cemetery.description_he || cemetery.description}
              </p>
            )}
            {mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
                <MapPin size={16} /> פתח בגוגל מפות
              </a>
            )}
          </div>
        </div>

        {/* Graves grid */}
        <hr className="divider" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }} dir="rtl">
          <h2 style={{ fontFamily: "'Crimson Pro', serif", fontSize: '1.5rem' }}>מצבות ({count ?? 0})</h2>
        </div>

        {graves && graves.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14 }}>
            {graves.map((grave: any) => {
              const img = grave.grave_images?.find((i: any) => i.is_primary) ?? grave.grave_images?.[0]
              const name = [grave.first_name_he, grave.last_name_he].filter(Boolean).join(' ') ||
                [grave.first_name, grave.last_name].filter(Boolean).join(' ') || 'לא ידוע'
              return (
                <Link key={grave.id} href={`/grave/${grave.id}`} className="card" style={{ display: 'block' }}>
                  <div style={{ aspectRatio: '3/4', background: 'var(--stone)', overflow: 'hidden' }}>
                    {img ? <img src={img.url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, opacity: 0.2 }}>🪦</div>}
                  </div>
                  <div style={{ padding: '0.7rem' }} dir="rtl">
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', fontFamily: "'Crimson Pro', serif" }}>{name}</p>
                    {grave.death_date_hebrew && <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{grave.death_date_hebrew}</p>}
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-muted)' }} dir="rtl">
            <p style={{ fontSize: '2.5rem', marginBottom: 8, opacity: 0.3 }}>🪦</p>
            <p>טרם נוספו מצבות לבית עלמין זה</p>
            <Link href="/admin/add-grave" style={{ color: 'var(--gold)', fontWeight: 500, fontSize: '0.9rem', marginTop: 8, display: 'inline-block' }}>הוסף מצבה ←</Link>
          </div>
        )}
      </div>
    </main>
  )
}
