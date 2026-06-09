'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, Plus, CheckCircle } from 'lucide-react'

type Option = { id: string; name: string; name_he?: string }

export default function AddGravePage() {
  const [countries, setCountries] = useState<Option[]>([])
  const [cities, setCities] = useState<Option[]>([])
  const [cemeteries, setCemeteries] = useState<Option[]>([])
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [images, setImages] = useState<{ url: string; is_primary: boolean }[]>([])

  const [form, setForm] = useState({
    cemetery_id: '',
    first_name: '', last_name: '',
    first_name_he: '', last_name_he: '',
    birth_date: '', death_date: '',
    birth_date_hebrew: '', death_date_hebrew: '',
    inscription: '', inscription_readable: true,
    biography: '', biography_he: '',
    father_name: '', mother_name: '', spouse_name: '',
    inscription_language: 'Hebrew',
    condition: 'fair',
    lat: '', lng: '',
  })

  const set = (key: string, val: string | boolean) => setForm(f => ({ ...f, [key]: val }))

  useEffect(() => {
    supabase.from('countries').select('id, name, name_he').order('name').then(({ data }) => setCountries(data ?? []))
  }, [])

  useEffect(() => {
    if (!selectedCountry) return
    supabase.from('cities').select('id, name, name_he').eq('country_id', selectedCountry).order('name').then(({ data }) => setCities(data ?? []))
    setSelectedCity(''); setCemeteries([]); set('cemetery_id', '')
  }, [selectedCountry])

  useEffect(() => {
    if (!selectedCity) return
    supabase.from('cemeteries').select('id, name, name_he').eq('city_id', selectedCity).order('name').then(({ data }) => setCemeteries(data ?? []))
    set('cemetery_id', '')
  }, [selectedCity])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `graves/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase.storage.from('grave-images').upload(path, file)
      if (!error && data) {
        const { data: pub } = supabase.storage.from('grave-images').getPublicUrl(path)
        setImages(prev => [...prev, { url: pub.publicUrl, is_primary: prev.length === 0 }])
      }
    }
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.cemetery_id) { alert('בחר בית עלמין'); return }
    setSaving(true)

    const { data: grave, error } = await supabase.from('graves').insert({
      cemetery_id: form.cemetery_id,
      first_name: form.first_name || null,
      last_name: form.last_name || null,
      first_name_he: form.first_name_he || null,
      last_name_he: form.last_name_he || null,
      birth_date: form.birth_date || null,
      death_date: form.death_date || null,
      birth_date_hebrew: form.birth_date_hebrew || null,
      death_date_hebrew: form.death_date_hebrew || null,
      inscription: form.inscription || null,
      inscription_readable: form.inscription_readable,
      biography: form.biography || null,
      biography_he: form.biography_he || null,
      father_name: form.father_name || null,
      mother_name: form.mother_name || null,
      spouse_name: form.spouse_name || null,
      inscription_language: form.inscription_language || null,
      condition: form.condition || null,
      lat: form.lat ? parseFloat(form.lat) : null,
      lng: form.lng ? parseFloat(form.lng) : null,
    }).select().single()

    if (error || !grave) { setSaving(false); alert('שגיאה: ' + error?.message); return }

    if (images.length) {
      await supabase.from('grave_images').insert(images.map(img => ({ grave_id: grave.id, url: img.url, is_primary: img.is_primary })))
    }

    setSaving(false); setDone(true)
  }

  if (done) return (
    <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }} dir="rtl">
        <CheckCircle size={48} color="var(--moss)" style={{ margin: '0 auto 1rem', display: 'block' }} />
        <h2 style={{ fontFamily: "'Crimson Pro', serif", fontSize: '1.8rem', marginBottom: 8 }}>המצבה נשמרה!</h2>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: '1.5rem' }}>
          <button onClick={() => { setDone(false); setForm(f => ({ ...f, first_name: '', last_name: '', first_name_he: '', last_name_he: '', inscription: '', biography: '', biography_he: '' })); setImages([]) }} className="btn-secondary">הוסף עוד מצבה</button>
          <a href="/admin" className="btn-primary">חזור לניהול</a>
        </div>
      </div>
    </main>
  )

  const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )

  return (
    <main style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container-site" style={{ maxWidth: 860 }}>
        <div dir="rtl">
          <h1 style={{ fontFamily: "'Crimson Pro', serif", fontSize: '2rem', marginBottom: 4 }}>הוספת מצבה</h1>
          <p style={{ color: 'var(--ink-muted)', marginBottom: '2rem' }}>מלא את הפרטים הידועים. אין צורך למלא הכל — מלא כמה שיש.</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Location */}
            <section style={{ background: 'var(--stone)', borderRadius: 12, padding: '1.25rem' }}>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--ink-muted)' }}>📍 מיקום</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <F label="מדינה *">
                  <select className="input" value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} required>
                    <option value="">בחר מדינה</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.name_he || c.name}</option>)}
                  </select>
                </F>
                <F label="עיר *">
                  <select className="input" value={selectedCity} onChange={e => setSelectedCity(e.target.value)} disabled={!selectedCountry} required>
                    <option value="">בחר עיר</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name_he || c.name}</option>)}
                  </select>
                </F>
                <F label="בית עלמין *">
                  <select className="input" value={form.cemetery_id} onChange={e => set('cemetery_id', e.target.value)} disabled={!selectedCity} required>
                    <option value="">בחר בית עלמין</option>
                    {cemeteries.map(c => <option key={c.id} value={c.id}>{c.name_he || c.name}</option>)}
                  </select>
                </F>
              </div>
            </section>

            {/* Name */}
            <section style={{ background: 'white', borderRadius: 12, border: '1px solid var(--stone-dark)', padding: '1.25rem' }}>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--ink-muted)' }}>👤 שם</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <F label="שם פרטי (עברית)"><input className="input" value={form.first_name_he} onChange={e => set('first_name_he', e.target.value)} placeholder="ישראל" /></F>
                <F label="שם משפחה (עברית)"><input className="input" value={form.last_name_he} onChange={e => set('last_name_he', e.target.value)} placeholder="כהן" /></F>
                <F label="שם פרטי (לועזי)"><input className="input" value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Israel" dir="ltr" /></F>
                <F label="שם משפחה (לועזי)"><input className="input" value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Cohen" dir="ltr" /></F>
              </div>
            </section>

            {/* Dates */}
            <section style={{ background: 'white', borderRadius: 12, border: '1px solid var(--stone-dark)', padding: '1.25rem' }}>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--ink-muted)' }}>📅 תאריכים</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                <F label="לידה (לועזי)"><input className="input" type="date" value={form.birth_date} onChange={e => set('birth_date', e.target.value)} dir="ltr" /></F>
                <F label="פטירה (לועזי)"><input className="input" type="date" value={form.death_date} onChange={e => set('death_date', e.target.value)} dir="ltr" /></F>
                <F label="לידה (עברי)"><input className="input" value={form.birth_date_hebrew} onChange={e => set('birth_date_hebrew', e.target.value)} placeholder="כ׳ אב תרנ״ב" /></F>
                <F label="פטירה (עברי)"><input className="input" value={form.death_date_hebrew} onChange={e => set('death_date_hebrew', e.target.value)} placeholder="י׳ תשרי תש״י" /></F>
              </div>
            </section>

            {/* Family */}
            <section style={{ background: 'white', borderRadius: 12, border: '1px solid var(--stone-dark)', padding: '1.25rem' }}>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--ink-muted)' }}>👨‍👩‍👧 משפחה</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <F label="שם האב"><input className="input" value={form.father_name} onChange={e => set('father_name', e.target.value)} /></F>
                <F label="שם האם"><input className="input" value={form.mother_name} onChange={e => set('mother_name', e.target.value)} /></F>
                <F label="בן/בת זוג"><input className="input" value={form.spouse_name} onChange={e => set('spouse_name', e.target.value)} /></F>
              </div>
            </section>

            {/* Inscription */}
            <section style={{ background: 'white', borderRadius: 12, border: '1px solid var(--stone-dark)', padding: '1.25rem' }}>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--ink-muted)' }}>✍️ כיתוב על המצבה</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, alignItems: 'end', marginBottom: 12 }}>
                <F label="שפת הכיתוב">
                  <select className="input" value={form.inscription_language} onChange={e => set('inscription_language', e.target.value)}>
                    {['Hebrew', 'French', 'Arabic', 'Ladino', 'English', 'Polish', 'Romanian', 'Unknown'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </F>
                <F label="ניתן לקריאה?">
                  <select className="input" value={form.inscription_readable ? 'yes' : 'no'} onChange={e => set('inscription_readable', e.target.value === 'yes')}>
                    <option value="yes">כן</option>
                    <option value="no">לא</option>
                  </select>
                </F>
                <F label="מצב שימור">
                  <select className="input" value={form.condition} onChange={e => set('condition', e.target.value)}>
                    <option value="good">טוב</option>
                    <option value="fair">בינוני</option>
                    <option value="poor">רע</option>
                    <option value="illegible">לא קריא</option>
                  </select>
                </F>
              </div>
              <F label="טקסט הכיתוב">
                <textarea className="input" value={form.inscription} onChange={e => set('inscription', e.target.value)} rows={5} placeholder="הכנס את הטקסט שעל המצבה כפי שהוא..." />
              </F>
            </section>

            {/* Biography */}
            <section style={{ background: 'white', borderRadius: 12, border: '1px solid var(--stone-dark)', padding: '1.25rem' }}>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--ink-muted)' }}>📖 תולדות ומידע נוסף</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <F label="תולדות בעברית"><textarea className="input" value={form.biography_he} onChange={e => set('biography_he', e.target.value)} rows={4} placeholder="כתוב כאן כל מה שידוע על האדם..." /></F>
                <F label="תולדות באנגלית (אופציונלי)"><textarea className="input" value={form.biography} onChange={e => set('biography', e.target.value)} rows={3} placeholder="Biography in English..." dir="ltr" /></F>
              </div>
            </section>

            {/* GPS */}
            <section style={{ background: 'white', borderRadius: 12, border: '1px solid var(--stone-dark)', padding: '1.25rem' }}>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4, color: 'var(--ink-muted)' }}>📍 קואורדינטות GPS (אופציונלי)</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginBottom: 12 }}>אם תדע מיקום מדויק של המצבה — לחץ ימני בגוגל מפות → "מה יש כאן?" ותקבל את הקואורדינטות.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <F label="קו רוחב (Latitude)"><input className="input" value={form.lat} onChange={e => set('lat', e.target.value)} placeholder="33.5731" dir="ltr" /></F>
                <F label="קו אורך (Longitude)"><input className="input" value={form.lng} onChange={e => set('lng', e.target.value)} placeholder="-7.5898" dir="ltr" /></F>
              </div>
            </section>

            {/* Images */}
            <section style={{ background: 'white', borderRadius: 12, border: '1px solid var(--stone-dark)', padding: '1.25rem' }}>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--ink-muted)' }}>📷 תמונות</p>
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, border: '2px dashed var(--stone-dark)', borderRadius: 10, padding: '2rem', cursor: 'pointer', marginBottom: 12, background: 'var(--parchment)' }}>
                <Upload size={28} color="var(--ink-muted)" />
                <p style={{ fontWeight: 500 }}>{uploading ? 'מעלה...' : 'לחץ להעלאת תמונות'}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>ניתן להעלות מספר תמונות בבת אחת</p>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
              </label>
              {images.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 8 }}>
                  {images.map((img, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', aspectRatio: '1', border: img.is_primary ? '2px solid var(--gold)' : '1px solid var(--stone-dark)', cursor: 'pointer' }} onClick={() => setImages(prev => prev.map((x, j) => ({ ...x, is_primary: j === i })))}>
                      <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {img.is_primary && <span style={{ position: 'absolute', bottom: 4, right: 4, background: 'var(--gold)', color: 'white', fontSize: '0.6rem', padding: '1px 6px', borderRadius: 4 }}>ראשי</span>}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn-primary" disabled={saving} style={{ opacity: saving ? 0.7 : 1, fontSize: '1rem', padding: '0.75rem 2rem' }}>
                {saving ? 'שומר...' : '💾 שמור מצבה'}
              </button>
              <a href="/admin" className="btn-secondary">ביטול</a>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
