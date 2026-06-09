import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

export default async function CityPage({ params }: { params: { id: string } }) {
  const { data: city } = await supabase
    .from('cities')
    .select('*, country:countries(*)')
    .eq('id', params.id)
    .single()

  if (!city) notFound()

  const { data: cemeteries } = await supabase
    .from('cemeteries')
    .select('*, graves(id)')
    .eq('city_id', params.id)
    .order('name')

  const country = city.country as any

  return (
    <main style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container-site">
        <nav style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '1.5rem' }} dir="rtl">
          <Link href="/">בית</Link> ›{' '}
          {country && <><Link href={`/country/${country.id}`}>{country.name_he}</Link> › </>}
          <span style={{ color: 'var(--ink)' }}>{city.name_he || city.name}</span>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2.5rem' }} dir="rtl">
          <div>
            <h1 style={{ fontFamily: "'Crimson Pro', serif", fontSize: '2.5rem', fontWeight: 600 }}>
              {city.name_he || city.name}
            </h1>
            {city.name_he && <p style={{ color: 'var(--ink-muted)' }}>{city.name}{country && ` · ${country.name_he}`}</p>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {(cemeteries ?? []).map((cem: any) => (
            <Link key={cem.id} href={`/cemetery/${cem.id}`} className="card" style={{ padding: '1.4rem' }}>
              {cem.cover_image && (
                <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: 12, height: 120 }}>
                  <img src={cem.cover_image} alt={cem.name_he} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div dir="rtl">
                <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 4 }}>{cem.name_he || cem.name}</p>
                {cem.community && <span className="badge badge-unknown" style={{ marginBottom: 8 }}>{cem.community}</span>}
                <div style={{ display: 'flex', gap: 12, fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                  {cem.founded_year && <span>הוקם {cem.founded_year}</span>}
                  <span>{(cem.graves as any[])?.length ?? 0} מצבות</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
