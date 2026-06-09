import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function CountriesPage() {
  const { data: countries } = await supabase.from('countries').select('*').order('name')

  const counts: Record<string, number> = {}
  for (const c of countries ?? []) {
    const { count } = await supabase
      .from('graves')
      .select('*, cemetery:cemeteries(city:cities(country_id))', { count: 'exact', head: true })
    counts[c.id] = count ?? 0
  }

  return (
    <main style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container-site">
        <div dir="rtl" style={{ marginBottom: '2rem' }}>
          <h1 className="section-title">מדינות</h1>
          <p className="section-subtitle">בחר מדינה לצפייה בבתי העלמין וברשימת המצבות</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {(countries ?? []).map(c => (
            <Link key={c.id} href={`/country/${c.id}`} className="card" style={{ padding: '1.4rem', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 36 }}>{c.flag_emoji}</span>
              <div>
                <p style={{ fontWeight: 600, fontSize: '1.05rem' }}>{c.name_he}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>{c.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
