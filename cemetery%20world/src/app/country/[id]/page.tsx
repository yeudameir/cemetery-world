import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

export default async function CountryPage({ params }: { params: { id: string } }) {
  const { data: country } = await supabase.from('countries').select('*').eq('id', params.id).single()
  if (!country) notFound()

  const { data: cities } = await supabase
    .from('cities')
    .select('*, cemeteries(id)')
    .eq('country_id', params.id)
    .order('name')

  return (
    <main style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container-site">
        <nav style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '1.5rem' }} dir="rtl">
          <Link href="/">בית</Link> › <Link href="/countries">מדינות</Link> › <span style={{ color: 'var(--ink)' }}>{country.name_he}</span>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '2.5rem' }}>
          <span style={{ fontSize: 52 }}>{country.flag_emoji}</span>
          <div dir="rtl">
            <h1 style={{ fontFamily: "'Crimson Pro', serif", fontSize: '2.5rem', fontWeight: 600, lineHeight: 1.1 }}>{country.name_he}</h1>
            <p style={{ color: 'var(--ink-muted)' }}>{country.name} · {cities?.length ?? 0} ערים</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
          {(cities ?? []).map(city => (
            <Link key={city.id} href={`/city/${city.id}`} className="card" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: 12 }}>
              <MapPin size={20} color="var(--gold)" style={{ flexShrink: 0 }} />
              <div dir="rtl">
                <p style={{ fontWeight: 600 }}>{city.name_he || city.name}</p>
                {city.name_he && <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{city.name}</p>}
                <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{(city.cemeteries as any[])?.length ?? 0} בתי עלמין</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
