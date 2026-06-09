'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle } from 'lucide-react'

export default function AddCountryPage() {
  const [form, setForm] = useState({ name: '', name_he: '', flag_emoji: '' })
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.name_he) { setError('שם המדינה חובה'); return }
    setSaving(true); setError('')
    const { error: err } = await supabase.from('countries').insert({
      name: form.name,
      name_he: form.name_he,
      flag_emoji: form.flag_emoji || '🏳️',
    })
    setSaving(false)
    if (err) { setError('שגיאה: ' + err.message); return }
    setDone(true)
  }

  if (done) return (
    <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }} dir="rtl">
        <CheckCircle size={48} color="var(--moss)" style={{ margin: '0 auto 1rem', display: 'block' }} />
        <h2 style={{ fontFamily: "'Crimson Pro', serif", fontSize: '1.8rem', marginBottom: 8 }}>המדינה נוספה!</h2>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: '1.5rem' }}>
          <button onClick={() => { setDone(false); setForm({ name: '', name_he: '', flag_emoji: '' }) }} className="btn-secondary">הוסף עוד מדינה</button>
          <a href="/admin" className="btn-primary">חזור לניהול</a>
        </div>
      </div>
    </main>
  )

  return (
    <main style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container-site" style={{ maxWidth: 560 }}>
        <div dir="rtl">
          <a href="/admin" style={{ color: 'var(--gold)', fontSize: '0.9rem', display: 'inline-block', marginBottom: '1.5rem' }}>← חזור לניהול</a>
          <h1 style={{ fontFamily: "'Crimson Pro', serif", fontSize: '2rem', marginBottom: 4 }}>הוספת מדינה</h1>
          <p style={{ color: 'var(--ink-muted)', marginBottom: '2rem' }}>הוסף מדינה חדשה למאגר.</p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label">שם המדינה (לועזי) *</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Morocco" dir="ltr" required />
            </div>
            <div>
              <label className="label">שם המדינה (עברית) *</label>
              <input className="input" value={form.name_he} onChange={e => setForm(f => ({ ...f, name_he: e.target.value }))} placeholder="מרוקו" required />
            </div>
            <div>
              <label className="label">אמוג׳י דגל</label>
              <input className="input" value={form.flag_emoji} onChange={e => setForm(f => ({ ...f, flag_emoji: e.target.value }))} placeholder="🇲🇦" style={{ fontSize: '1.5rem' }} />
              <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: 4 }}>העתק אמוג׳י דגל מ-emojipedia.org או השאר ריק</p>
            </div>
            {error && <p style={{ color: 'red', fontSize: '0.85rem' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'שומר...' : 'הוסף מדינה'}</button>
              <a href="/admin" className="btn-secondary">ביטול</a>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
