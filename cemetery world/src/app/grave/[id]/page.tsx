import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'
import GraveActions from './GraveActions'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { data: grave } = await supabase.from('graves').select('first_name_he, last_name_he, first_name, last_name').eq('id', params.id).single()
  const name = grave ? [grave.first_name_he, grave.last_name_he].filter(Boolean).join(' ') || [grave.first_name, grave.last_name].filter(Boolean).join(' ') : 'מצבה'
  return { title: `${name} — זיכרון עולמי` }
}

export default async function GravePage({ params }: { params: { id: string } }) {
  const { data: grave } = await supabase
    .from('graves')
    .select('*, grave_images(*), cemetery:cemeteries(*, city:cities(*, country:countries(*)))')
    .eq('id', params.id)
    .single()

  if (!grave) notFound()

  const images = (grave.grave_images as any[]) ?? []
  const cemetery = grave.cemetery as any
  const city = cemetery?.city
  const country = city?.country

  const fullName = [grave.first_name_he, grave.last_name_he].filter(Boolean).join(' ') ||
    [grave.first_name, grave.last_name].filter(Boolean).join(' ') || 'לא ידוע'

  const mapsUrl = grave.lat && grave.lng
    ? `https://www.google.com/maps?q=${grave.lat},${grave.lng}`
    : (cemetery?.lat && cemetery?.lng ? `https://www.google.com/maps?q=${cemetery.lat},${cemetery.lng}` : null)

  return (
    <main style={{ padding: '2rem 0 4rem' }}>
      <div className="container-site">
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '1.5rem', flexWrap: 'wrap' }} dir="rtl">
          <Link href="/">בית</Link>
          {country && <><span>›</span><Link href={`/country/${country.id}`}>{country.name_he}</Link></>}
          {city && <><span>›</span><Link href={`/city/${city.id}`}>{city.name_he || city.name}</Link></>}
          {cemetery && <><span>›</span><Link href={`/cemetery/${cemetery.id}`}>{cemetery.name_he || cemetery.name}</Link></>}
          <span>›</span><span style={{ color: 'var(--ink)' }}>{fullName}</span>
        </nav>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 40%) 1fr', gap: '3rem', alignItems: 'start' }}>
          {/* Images column */}
          <div>
            {images.length > 0 ? (
              <>
                <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 10, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
                  <img
                    src={(images.find((i: any) => i.is_primary) ?? images[0]).url}
                    alt={fullName}
                    style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: 520 }}
                  />
                </div>
                {images.length > 1 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                    {images.slice(1).map((img: any) => (
                      <div key={img.id} style={{ borderRadius: 6, overflow: 'hidden', aspectRatio: '1' }}>
                        <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ background: 'var(--stone)', borderRadius: 12, aspectRatio: '3/4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-muted)', gap: 8 }}>
                <span style={{ fontSize: 64, opacity: 0.2 }}>🪦</span>
                <span style={{ fontSize: '0.85rem' }}>אין תמונה</span>
              </div>
            )}
          </div>

          {/* Info column */}
          <div dir="rtl">
            <h1 style={{ fontFamily: "'Crimson Pro', serif", fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 600, marginBottom: 4, lineHeight: 1.2 }}>
              {fullName}
            </h1>
            {(grave.first_name || grave.last_name) && (grave.first_name_he || grave.last_name_he) && (
              <p style={{ fontSize: '1rem', color: 'var(--ink-muted)', marginBottom: '1.25rem' }}>
                {[grave.first_name, grave.last_name].filter(Boolean).join(' ')}
              </p>
            )}

            {/* Dates */}
            {(grave.birth_date || grave.birth_date_hebrew || grave.death_date || grave.death_date_hebrew) && (
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--stone)', borderRadius: 10, flexWrap: 'wrap' }}>
                {(grave.birth_date || grave.birth_date_hebrew) && (
                  <div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', marginBottom: 2 }}>נולד / נולדה</p>
                    <p style={{ fontWeight: 600 }}>{grave.birth_date_hebrew || grave.birth_date}</p>
                  </div>
                )}
                {(grave.death_date || grave.death_date_hebrew) && (
                  <div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', marginBottom: 2 }}>נפטר / נפטרה</p>
                    <p style={{ fontWeight: 600 }}>{grave.death_date_hebrew || grave.death_date}</p>
                  </div>
                )}
              </div>
            )}

            {/* Family */}
            {(grave.father_name || grave.mother_name || grave.spouse_name) && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>משפחה</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {grave.father_name && <p style={{ fontSize: '0.9rem' }}>אב: <strong>{grave.father_name}</strong></p>}
                  {grave.mother_name && <p style={{ fontSize: '0.9rem' }}>אם: <strong>{grave.mother_name}</strong></p>}
                  {grave.spouse_name && <p style={{ fontSize: '0.9rem' }}>בן/בת זוג: <strong>{grave.spouse_name}</strong></p>}
                </div>
              </div>
            )}

            {/* Inscription */}
            {grave.inscription && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>כיתוב על המצבה</p>
                  {!grave.inscription_readable && <span className="badge badge-unknown">לא קריא</span>}
                  {grave.inscription_language && <span className="badge badge-unknown">{grave.inscription_language}</span>}
                </div>
                <div style={{ background: '#f9f6f0', border: '1px solid var(--stone-dark)', borderRadius: 8, padding: '1.25rem', fontFamily: "'Crimson Pro', serif", fontSize: '1.05rem', lineHeight: 2, whiteSpace: 'pre-line' }}>
                  {grave.inscription}
                </div>
              </div>
            )}

            {/* Biography */}
            {(grave.biography_he || grave.biography) && (
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>תולדות</p>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.9, color: 'var(--ink)' }}>{grave.biography_he || grave.biography}</p>
              </div>
            )}

            {/* Condition */}
            {grave.condition && (
              <div style={{ marginBottom: '1.5rem' }}>
                <span className={`badge badge-${grave.condition === 'good' ? 'good' : grave.condition === 'fair' ? 'fair' : 'poor'}`}>
                  {grave.condition === 'good' ? '✓ מצב טוב' : grave.condition === 'fair' ? '⚠ מצב בינוני' : '✗ מצב רע'}
                </span>
              </div>
            )}

            {/* Actions (client component) */}
            <GraveActions graveId={grave.id} fullName={fullName} mapsUrl={mapsUrl} />

            <hr className="divider" />

            {/* Update request */}
            <div style={{ background: 'var(--stone)', borderRadius: 10, padding: '1rem 1.25rem' }}>
              <p style={{ fontSize: '0.88rem', fontWeight: 500, marginBottom: 4 }}>יש לך מידע נוסף על אדם זה?</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginBottom: 10 }}>שלח לנו עדכון ונוסיף אותו למאגר</p>
              <Link href={`/grave/${grave.id}/request-update`} style={{ color: 'var(--gold)', fontWeight: 500, fontSize: '0.9rem' }}>
                שלח בקשת עדכון ←
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
