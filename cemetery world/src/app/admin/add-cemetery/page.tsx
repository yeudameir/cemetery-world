'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle, Upload } from 'lucide-react'

type Country = { id: string; name: string; name_he: string; flag_emoji: string }
type City = { id: string; name: string; name_he: string }

export default function AddCemeteryPage() {
  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [selectedCountry, setSelectedCountry] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    city_id: '', name: '', name_he: '',
    community: 'Jewish', founded_year: '',
    condition: 'fair', description: '', description_he: '',
    lat: '', lng: '', cover_image: '',
  })

  useEffect(() => {
    supabase.from('countries').select('*').order('name_he').then(({ data }) => setCountries(data ?? []))
  }, [])

  useEffect(() => {
    if (!selectedCountry) return
    supabase.from('cities').select('*').eq('country_id', selectedCountry).order('name').then(({ data }) => setCities(data ?? []))
    setForm(f => ({ ...f, city_id: '' }))
  }, [selectedCountry])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `cemeteries/${Date.now()}.${ext}`
    const { data, error: err } = await supabase.storage.from('grave-images').upload(path, file)
    if (!err && data) {
      const { data: pub } = supabase.storage.from('grave-images').getPublicUrl(path)
      setForm(f => ({ ...f, cover_image: pub.publicUrl }))
    }
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.city_id || !form.name) { setError('בחר עיר והכנס שם בית עלמין'); return }
    setSaving(true); setError('')
    const { error: err } = await supabase.from('cemeteries').insert({
      city_id: form.city_id,
      name: form.name,
      name_he: form.name_he || null,
      community: form.community || null,
      founded_year: form.founded_year ? parseInt(form.founded_year) : null,
      condition: form.condition || null,
      description: form.description || null,
      description_he: form.description_he || null,
      lat: form.lat ? parseFloat(form.lat) : null,
      lng: form.lng ? parseFloat(form.lng) : null,
      cover_image: form.cover_image || null,
    })
    setSaving(false)
    if (err) { setError('שגיאה: ' + err.message); return }
    setDone(true)
  }

  if (done) return (
    <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }} dir="rtl">
        <CheckCircle size={48} color="var(--moss)" style={{ margin: '0 auto 1rem', display: 'block' }} />
        <h2 style={{ fontFamily: "'Crimson Pro', serif", fontSize: '1.8rem', marginBottom: 8 }}>בית העלמין נוסף!</h2>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: '1.5rem' }}>
          <button onClick={() => { setDone(false); setForm(f => ({ ...f, name: '', name_he: '', description: '', description_he: '', cover_image: '' })) }} className="btn-secondary">הוסף עוד</button>
          <a href="/admin/add-grave" className="btn-primary">הוסף מצבה ←</a>
        </div>
      </div>
    </main>
  )

  return (
    <main style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container-site" style={{ maxWidth: 700 }}>
        <div dir="rtl">
          <a href="/admin" style={{ color: 'var(--gold)', fontSize: '0.9rem', display: 'inline-block', marginBottom: '1.5rem' }}>← חזור לניהול</a>
          <h1 style={{ fontFamily: "'Crimson Pro', serif", fontSize: '2rem', marginBottom: 4 }}>הוספת בית עלמין</h1>
          <p style={{ color: 'var(--ink-muted)', marginBottom: '2rem' }}>מלא את הפרטים של בית העלמין.</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Location */}
            <section style={{ background: 'var(--stone)', borderRadius: 12, padding: '1.25rem' }}>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--ink-muted)' }}>📍 מיקום</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">מדינה *</label>
                  <select className="input" value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} required>
                    <option value="">בחר מדינה</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.flag_emoji} {c.name_he}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">עיר *</label>
                  <select className="input" value={form.city_id} onChange={e => setForm(f => ({ ...f, city_id: e.target.value }))} disabled={!selectedCountry} required>
                    <option value="">בחר עיר</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name_he || c.name}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* Name */}
            <section style={{ background: 'white', borderRadius: 12, border: '1px solid var(--stone-dark)', padding: '1.25rem' }}>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--ink-muted)' }}>📛 שם</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">שם (לועזי) *</label>
                  <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jewish Cemetery of Sefrou" dir="ltr" required />
                </div>
                <div>
                  <label className="label">שם (עברית)</label>
                  <input className="input" value={form.name_he} onChange={e => setForm(f => ({ ...f, name_he: e.target.value }))} placeholder="בית עלמין היהודי של צפרו" />
                </div>
              </div>
            </section>

            {/* Details */}
            <section style={{ background: 'white', borderRadius: 12, border: '1px solid var(--stone-dark)', padding: '1.25rem' }}>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--ink-muted)' }}>📋 פרטים</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label className="label">קהילה</label>
                  <select className="input" value={form.community} onChange={e => setForm(f => ({ ...f, community: e.target.value }))}>
                    <option value="Jewish">יהודי</option>
                    <option value="Muslim">מוסלמי</option>
                    <option value="Christian">נוצרי</option>
                    <option value="Mixed">מעורב</option>
                  </select>
                </div>
                <div>
                  <label className="label">שנת הקמה</label>
                  <input className="input" value={form.founded_year} onChange={e => setForm(f => ({ ...f, founded_year: e.target.value }))} placeholder="1850" dir="ltr" type="number" />
                </div>
                <div>
                  <label className="label">מצב שימור</label>
                  <select className="input" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}>
                    <option value="good">טוב</option>
                    <option value="fair">בינוני</option>
                    <option value="poor">רע</option>
                    <option value="abandoned">נטוש</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label className="label">תיאור (עברית)</label>
                  <textarea className="input" value={form.description_he} onChange={e => setForm(f => ({ ...f, description_he: e.target.value }))} rows={3} placeholder="תיאור קצר של בית העלמין..." />
                </div>
              </div>
            </section>

            {/* GPS */}
            <section style={{ background: 'white', borderRadius: 12, border: '1px solid var(--stone-dark)', padding: '1.25rem' }}>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4, color: 'var(--ink-muted)' }}>📍 קואורדינטות GPS</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginBottom: 12 }}>לחץ ימני בגוגל מפות על בית העלמין → "מה יש כאן?" לקבלת הקואורדינטות</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">קו רוחב (Latitude)</label>
                  <input className="input" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))} placeholder="33.8309" dir="ltr" />
                </div>
                <div>
                  <label className="label">קו אורך (Longitude)</label>
                  <input className="input" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: e.target.value }))} placeholder="-4.8360" dir="ltr" />
                </div>
              </div>
            </section>

            {/* Cover image */}
            <section style={{ background: 'white', borderRadius: 12, border: '1px solid var(--stone-dark)', padding: '1.25rem' }}>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--ink-muted)' }}>📷 תמונת כניסה (אופציונלי)</p>
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, border: '2px dashed var(--stone-dark)', borderRadius: 10, padding: '1.5rem', cursor: 'pointer', background: form.cover_image ? '#f0fff4' : 'var(--parchment)' }}>
                <Upload size={24} color={form.cover_image ? 'var(--moss)' : 'var(--ink-muted)'} />
                <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{uploading ? 'מעלה...' : form.cover_image ? '✓ תמונה הועלתה' : 'לחץ להעלאת תמונה'}</p>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
              </label>
              {form.cover_image && <img src={form.cover_image} alt="" style={{ marginTop: 10, borderRadius: 8, maxHeight: 150, objectFit: 'cover', width: '100%' }} />}
            </section>

            {error && <p style={{ color: 'red', fontSize: '0.85rem' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn-primary" disabled={saving} style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
                {saving ? 'שומר...' : '💾 שמור בית עלמין'}
              </button>
              <a href="/admin" className="btn-secondary">ביטול</a>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
