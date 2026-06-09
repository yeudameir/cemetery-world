import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'זיכרון עולמי — מאגר בתי עלמין יהודיים',
  description: 'מאגר המצבות היהודיות הגדול בעולם. מרוקו, פולין, תוניסיה ועוד.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <Navbar />
        {children}
        <footer style={{ background: '#1a1614', color: 'rgba(255,255,255,0.5)', padding: '2.5rem 0', marginTop: '4rem' }}>
          <div className="container-site" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', marginBottom: 8 }}>🪦</p>
            <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>זיכרון עולמי</p>
            <p style={{ fontSize: '0.8rem' }}>שומרים על הזיכרון לדורות הבאים</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
