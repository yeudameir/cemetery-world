'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function RequestUpdatePage({ params }: { params: { id: string } }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.message.trim()) { setError('אנא כתוב הודעה'); return }
    setLoading(true); setError('')
    const { error: err } = await supabase.from('update_requests').insert({
      grave_id: params.id,
      message: form.message,
      sender_name: form.name || null,
      sender_email: form.email || null,
      status: 'pending',
    })
    setLoading(false)
    if (err) { setError('שגיאה בשליחה. נסה שוב.'); return }
    setDone(true)
  }

  if (done) return (
    <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }} dir="rtl">
        <CheckCircle size={48} color="var(--moss)" style={{ margin: '0 auto 1rem', display: 'block' }} />
        <h2 style={{ fontFamily: "'Crimson Pro', serif", fontSize: '1.8rem', marginBottom: 8 }}>תודה רבה!</h2>
        <p style={{ color: 'var(--ink-muted)', marginBottom: '1.5rem' }}>קיבלנו את הבקשה שלך. נבדוק ונעדכן בהקדם.</p>
        <Link href={`/grave/${params.id}`} className="btn-primary">חזור למצבה</Link>
      </div>
    </main>
  )

  return (
    <main style={{ padding: '3rem 0' }}>
      <div className="container-site" style={{ maxWidth: 600 }}>
        <div dir="rtl">
          <Link href={`/grave/${params.id}`} style={{ color: 'var(--gold)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 4, marginBottom: '1.5rem' }}>
            ← חזור למצבה
          </Link>
          <h1 style={{ fontFamily: "'Crimson Pro', serif", fontSize: '2rem', marginBottom: 8 }}>שליחת עדכון</h1>
          <p style={{ color: 'var(--ink-muted)', marginBottom: '2rem' }}>יש לך מידע נוסף? תאריכים, שמות, תולדות? נשמח לשמוע.</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label">שמך (אופציונלי)</label>
              <input className="input" type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ישראל ישראלי" />
            </div>
            <div>
              <label className="label">אימייל (אופציונלי — לצורך מענה)</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="example@email.com" dir="ltr" />
            </div>
            <div>
              <label className="label">המידע שלך *</label>
              <textarea className="input" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="למשל: שם האב הוא משה, נולד בשנת 1892, היה סנדלר..." rows={6} />
            </div>
            {error && <p style={{ color: 'red', fontSize: '0.85rem' }}>{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading} style={{ alignSelf: 'flex-start', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'שולח...' : 'שלח עדכון'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
