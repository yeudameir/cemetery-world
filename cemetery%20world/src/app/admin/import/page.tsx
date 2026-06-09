'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, CheckCircle, AlertCircle, Download } from 'lucide-react'

const EXAMPLE_CSV = `cemetery_id,first_name_he,last_name_he,first_name,last_name,birth_date_hebrew,death_date_hebrew,birth_date,death_date,inscription,inscription_readable,inscription_language,condition,father_name,mother_name,spouse_name,biography_he,lat,lng
your-cemetery-uuid,ישראל,כהן,Israel,Cohen,כ' אב תרנ"ב,י' תשרי תש"י,1892-08-03,1950-09-21,"פ.נ. ישראל בן משה כהן",true,Hebrew,good,משה,רחל,שרה,היה סנדלר ממרוקו,33.5731,-7.5898`

type Row = Record<string, string>

export default function ImportPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [importing, setImporting] = useState(false)
  const [done, setDone] = useState(0)
  const [file, setFile] = useState<File | null>(null)

  const parseCSV = (text: string): Row[] => {
    const lines = text.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    return lines.slice(1).map(line => {
      const vals = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|^(?=,)|(?<=,)$)/g) ?? []
      const row: Row = {}
      headers.forEach((h, i) => { row[h] = (vals[i] ?? '').replace(/^"|"$/g, '').trim() })
      return row
    }).filter(r => Object.values(r).some(v => v))
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const parsed = parseCSV(ev.target?.result as string)
        setRows(parsed)
        setErrors([])
      } catch {
        setErrors(['שגיאה בקריאת הקובץ'])
      }
    }
    reader.readAsText(f, 'UTF-8')
  }

  const handleImport = async () => {
    if (!rows.length) return
    setImporting(true)
    let count = 0
    const errs: string[] = []

    for (const row of rows) {
      if (!row.cemetery_id) { errs.push(`שורה ${count + 1}: חסר cemetery_id`); continue }
      const { error } = await supabase.from('graves').insert({
        cemetery_id: row.cemetery_id,
        first_name: row.first_name || null,
        last_name: row.last_name || null,
        first_name_he: row.first_name_he || null,
        last_name_he: row.last_name_he || null,
        birth_date: row.birth_date || null,
        death_date: row.death_date || null,
        birth_date_hebrew: row.birth_date_hebrew || null,
        death_date_hebrew: row.death_date_hebrew || null,
        inscription: row.inscription || null,
        inscription_readable: row.inscription_readable !== 'false',
        inscription_language: row.inscription_language || null,
        condition: row.condition || null,
        father_name: row.father_name || null,
        mother_name: row.mother_name || null,
        spouse_name: row.spouse_name || null,
        biography_he: row.biography_he || null,
        biography: row.biography || null,
        lat: row.lat ? parseFloat(row.lat) : null,
        lng: row.lng ? parseFloat(row.lng) : null,
      })
      if (error) errs.push(`שורה ${count + 1} (${row.first_name_he || row.first_name}): ${error.message}`)
      else count++
    }

    setDone(count)
    setErrors(errs)
    setImporting(false)
  }

  const downloadExample = () => {
    const blob = new Blob([EXAMPLE_CSV], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'example-graves.csv'; a.click()
  }

  return (
    <main style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container-site" style={{ maxWidth: 800 }}>
        <div dir="rtl">
          <h1 style={{ fontFamily: "'Crimson Pro', serif", fontSize: '2rem', marginBottom: 4 }}>יבוא מקובץ CSV</h1>
          <p style={{ color: 'var(--ink-muted)', marginBottom: '2rem' }}>העלה קובץ CSV עם פרטי מצבות לייבוא מהיר.</p>

          {/* Download example */}
          <div style={{ background: 'var(--stone)', borderRadius: 10, padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>קובץ לדוגמה</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>הורד קובץ לדוגמה עם כל העמודות</p>
            </div>
            <button onClick={downloadExample} className="btn-secondary">
              <Download size={16} /> הורד דוגמה
            </button>
          </div>

          {/* Important: cemetery_id */}
          <div style={{ background: '#fff8e1', border: '1px solid #f9a825', borderRadius: 10, padding: '1rem', marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 4, color: '#e65100' }}>⚠️ שים לב</p>
            <p style={{ fontSize: '0.82rem', color: '#795548' }}>
              כל שורה דורשת <strong>cemetery_id</strong> — המזהה של בית העלמין ב-Supabase.
              <br />ניתן למצוא אותו בניהול ← בתי עלמין.
            </p>
          </div>

          {/* File upload */}
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, border: '2px dashed var(--stone-dark)', borderRadius: 10, padding: '2.5rem', cursor: 'pointer', marginBottom: '1.5rem', background: file ? '#f0fff4' : 'var(--parchment)' }}>
            <Upload size={32} color={file ? 'var(--moss)' : 'var(--ink-muted)'} />
            <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>
              {file ? `📄 ${file.name} — ${rows.length} שורות` : 'לחץ לבחירת קובץ CSV'}
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>קובץ CSV בקידוד UTF-8</p>
            <input type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} />
          </label>

          {/* Preview */}
          {rows.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 8 }}>תצוגה מקדימה ({rows.length} שורות)</p>
              <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--stone-dark)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--stone)' }}>
                      {['שם עברית', 'שם לועזי', 'פטירה', 'בית עלמין ID'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, borderBottom: '1px solid var(--stone-dark)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 5).map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--stone-dark)' }}>
                        <td style={{ padding: '8px 12px' }}>{[r.first_name_he, r.last_name_he].filter(Boolean).join(' ') || '—'}</td>
                        <td style={{ padding: '8px 12px', direction: 'ltr' }}>{[r.first_name, r.last_name].filter(Boolean).join(' ') || '—'}</td>
                        <td style={{ padding: '8px 12px' }}>{r.death_date_hebrew || r.death_date || '—'}</td>
                        <td style={{ padding: '8px 12px', direction: 'ltr', fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--ink-muted)' }}>{r.cemetery_id?.slice(0, 8) || '❌ חסר'}...</td>
                      </tr>
                    ))}
                    {rows.length > 5 && <tr><td colSpan={4} style={{ padding: '8px 12px', color: 'var(--ink-muted)', textAlign: 'center' }}>...ועוד {rows.length - 5} שורות</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Results */}
          {done > 0 && (
            <div style={{ background: '#f0fff4', border: '1px solid #66bb6a', borderRadius: 10, padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle size={20} color="var(--moss)" />
              <p style={{ fontWeight: 600 }}>יובאו בהצלחה {done} מצבות!</p>
            </div>
          )}
          {errors.length > 0 && (
            <div style={{ background: '#fff3e0', border: '1px solid #ff9800', borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <AlertCircle size={18} color="#e65100" />
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{errors.length} שגיאות</p>
              </div>
              {errors.map((e, i) => <p key={i} style={{ fontSize: '0.8rem', color: '#5d4037' }}>{e}</p>)}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-primary" onClick={handleImport} disabled={!rows.length || importing} style={{ opacity: (!rows.length || importing) ? 0.6 : 1 }}>
              {importing ? `מייבא... (${done}/${rows.length})` : `ייבא ${rows.length} מצבות`}
            </button>
            <a href="/admin" className="btn-secondary">ביטול</a>
          </div>
        </div>
      </div>
    </main>
  )
}
