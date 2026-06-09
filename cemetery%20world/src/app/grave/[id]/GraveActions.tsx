'use client'
import { MapPin, Printer, Share2 } from 'lucide-react'

interface Props {
  graveId: string
  fullName: string
  mapsUrl: string | null
}

export default function GraveActions({ graveId, fullName, mapsUrl }: Props) {
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: fullName, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert('הקישור הועתק ללוח')
    }
  }

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
      {mapsUrl && (
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
          <MapPin size={16} /> פתח בגוגל מפות
        </a>
      )}
      <button onClick={() => window.print()} className="btn-secondary no-print">
        <Printer size={16} /> הדפסה
      </button>
      <button onClick={handleShare} className="btn-secondary no-print">
        <Share2 size={16} /> שתף
      </button>
    </div>
  )
}
