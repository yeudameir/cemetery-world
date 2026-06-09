import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function AdminPage() {
  const [{ count: graves }, { count: cemeteries }, { count: countries }, { count: requests }] = await Promise.all([
    supabase.from('graves').select('*', { count: 'exact', head: true }),
    supabase.from('cemeteries').select('*', { count: 'exact', head: true }),
    supabase.from('countries').select('*', { count: 'exact', head: true }),
    supabase.from('update_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const { data: recentRequests } = await supabase
    .from('update_requests')
    .select('*, grave:graves(first_name_he, last_name_he, first_name, last_name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    { n: countries ?? 0, label: 'מדינות', icon: '🌍' },
    { n: cemeteries ?? 0, label: 'בתי עלמין', icon: '⚰' },
    { n: graves ?? 0, label: 'מצבות', icon: '🪦' },
    { n: requests ?? 0, label: 'בקשות ממתינות', icon: '📬', alert: (requests ?? 0) > 0 },
  ]

  const actions = [
    { href: '/admin/add-grave', icon: '➕', title: 'הוסף מצבה', desc: 'הוספה ידנית עם טופס' },
    { href: '/admin/add-cemetery', icon: '🏛', title: 'הוסף בית עלמין', desc: 'הוספת מיקום חדש' },
    { href: '/admin/import', icon: '📤', title: 'יבוא מקובץ CSV', desc: 'העלאת מאות מצבות בבת אחת' },
    { href: '/admin/requests', icon: '📬', title: 'בקשות עדכון', desc: `${requests ?? 0} ממתינות לבדיקה` },
  ]

  return (
    <main style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container-site">
        <div dir="rtl">
          <h1 style={{ fontFamily: "'Crimson Pro', serif", fontSize: '2.2rem', marginBottom: 4 }}>פאנל ניהול</h1>
          <p style={{ color: 'var(--ink-muted)', marginBottom: '2.5rem' }}>ברוך הבא. כאן תוכל לנהל את כל תוכן האתר.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: '2.5rem' }}>
            {stats.map(stat => (
              <div key={stat.label} style={{ background: stat.alert ? '#fff8e1' : 'white', borderRadius: 12, border: `1px solid ${stat.alert ? '#f9a825' : 'var(--stone-dark)'}`, padding: '1.25rem' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
                <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: '2rem', fontWeight: 600, lineHeight: 1, color: stat.alert ? '#f57f17' : 'var(--ink)' }}>{stat.n.toLocaleString()}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <h2 style={{ fontFamily: "'Crimson Pro', serif", fontSize: '1.4rem', marginBottom: '1rem' }}>פעולות מהירות</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: '2.5rem' }}>
            {actions.map(a => (
              <Link key={a.href} href={a.href} style={{ background: 'white', borderRadius: 12, border: '1px solid var(--stone-dark)', padding: '1.25rem', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{a.icon}</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 2 }}>{a.title}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>{a.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {recentRequests && recentRequests.length > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontFamily: "'Crimson Pro', serif", fontSize: '1.4rem' }}>בקשות עדכון אחרונות</h2>
                <Link href="/admin/requests" style={{ color: 'var(--gold)', fontSize: '0.9rem', fontWeight: 500 }}>כל הבקשות ←</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentRequests.map((req: any) => {
                  const grave = req.grave
                  const graveName = grave ? ([grave.first_name_he, grave.last_name_he].filter(Boolean).join(' ') || [grave.first_name, grave.last_name].filter(Boolean).join(' ') || 'לא ידוע') : 'לא ידוע'
                  return (
                    <Link key={req.id} href={`/admin/requests`} style={{ background: 'white', borderRadius: 10, border: '1px solid var(--stone-dark)', padding: '0.9rem 1.1rem', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', marginTop: 6, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>עדכון על: {graveName}</p>
                        <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.message}</p>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', flexShrink: 0 }}>
                        {new Date(req.created_at).toLocaleDateString('he-IL')}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
