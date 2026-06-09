'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle } from 'lucide-react'

type Country = { id: string; name: string; name_he: string; flag_emoji: string }

export default function AddCityPage() {
  const [countries, setCountries] = useState<Country[]>([])
  const [form, setForm] = useState({ country_id: '', name: '', name_he: '', lat: '', lng: '' })
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('countries').select('*').order('name_he').then(({ data }) => setCountries(data ?? []))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.country_id || !form.name) { setError('בחר מדינה והכנס שם עיר'); return }
    setSaving(true); setError('')
    const { error: err } = await supabase.from('cities').insert({
      country_id: form.country_id,
      name: form.name,
      name_he: form.name_he || null,
      lat: form.lat ? parseFloat(form.lat) : null,
      lng: form.lng ? parseFloat(form.lng) : null,
    })
    setSaving(false)
    if (err) { setError('שגיאה: ' + err.message); return }
    setDone(true)
  }

  if (done) return (
    <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }} dir="rtl">
        <CheckCircle size={48} color="var(--moss)" style={{ margin: '0 auto 1rem', display: 'block' }} />
        <h2 style={{ fontFamily: "'Crimson Pro', serif", fontSize: '1.8rem', marginBottom: 8 }}>העיר נוספה!</h2>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: '1.5rem' }}>
          <button onClick={() => { setDone(false); setForm(f => ({ ...f, name: '', name_he: '', lat: '', lng: '' })) }} className="btn-secondary">הוסף עוד עיר</button>
          <a href="/admin/add-cemetery" className="btn-primary">הוסף בית עלמין ←</a>
        </div>
      </div>
    </main>
  )

  return (
    <main style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container-site" style={{ maxWidth: 560 }}>
        <div dir="rtl">
          <a href="/admin" style={{ color: 'var(--gold)', fontSize: '0.9rem', display: 'inline-block', marginBottom: '1.5rem' }}>← חזור לניהול</a>
          <h1 style={{ fontFamily: "'Crimson Pro', serif", fontSize: '2rem', marginBottom: 4 }}>הוספת עיר</h1>
          <p style={{ color: 'var(--ink-muted)', marginBottom: '2rem' }}>הוסף עיר למדינה קיימת.</p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label">מדינה *</label>
              <select className="input" value={form.country_id} onChange={e => setForm(f => ({ ...f, country_id: e.target.value }))} required>
                <option value="">בחר מדינה</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.flag_emoji} {c.name_he} ({c.name})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">שם העיר (לועזי) *</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Sefrou" dir="ltr" required />
            </div>
            <div>
              <label className="label">שם העיר (עברית)</label>
              <input className="input" value={form.name_he} onChange={e => setForm(f => ({ ...f, name_he: e.target.value }))} placeholder="צפרו" />
            </div>
            <div style={{ background: 'var(--stone)', borderRadius: 10, padding: '1rem' }}>
              <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 8 }}>📍 קואורדינטות GPS (אופציונלי)</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">קו רוחב</label>
                  <input className="input" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))} placeholder="33.8309" dir="ltr" />
                </div>
                <div>
                  <label className="label">קו אורך</label>
                  <input className="input" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: e.target.value }))} placeholder="-4.8360" dir="ltr" />
                </div>
              </div>
            </div>
            {error && <p style={{ color: 'red', fontSize: '0.85rem' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'שומר...' : 'הוסף עיר'}</button>
              <a href="/admin" className="btn-secondary">ביטול</a>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
