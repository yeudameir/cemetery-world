import Link from 'next/link'
import { MapPin, Calendar, Eye, EyeOff } from 'lucide-react'
import type { GraveWithImages } from '@/lib/supabase'

interface Props {
  grave: GraveWithImages
  lang?: 'he' | 'en'
}

const conditionBadge: Record<string, string> = {
  good: 'badge-good',
  fair: 'badge-fair',
  poor: 'badge-poor',
}

const conditionLabel: Record<string, { he: string; en: string }> = {
  good:      { he: 'מצב טוב',    en: 'Good condition' },
  fair:      { he: 'מצב בינוני', en: 'Fair condition' },
  poor:      { he: 'מצב רע',     en: 'Poor condition' },
  illegible: { he: 'לא קריא',    en: 'Illegible' },
}

export default function GraveCard({ grave, lang = 'he' }: Props) {
  const primaryImage = grave.grave_images?.find(i => i.is_primary) ?? grave.grave_images?.[0]
  
  const name = lang === 'he'
    ? [grave.first_name_he, grave.last_name_he].filter(Boolean).join(' ') || [grave.first_name, grave.last_name].filter(Boolean).join(' ')
    : [grave.first_name, grave.last_name].filter(Boolean).join(' ') || [grave.first_name_he, grave.last_name_he].filter(Boolean).join(' ')

  const displayName = name || (lang === 'he' ? 'לא ידוע' : 'Unknown')

  const deathYear = grave.death_date ? new Date(grave.death_date).getFullYear() : null

  return (
    <Link href={`/grave/${grave.id}`} className="card" style={{ display: 'block' }}>
      {/* Image */}
      <div style={{ aspectRatio: '3/4', background: 'var(--stone)', overflow: 'hidden', position: 'relative' }}>
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={displayName}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-muted)', gap: 8 }}>
            <span style={{ fontSize: 48, opacity: 0.3 }}>🪦</span>
            <span style={{ fontSize: '0.75rem' }}>{lang === 'he' ? 'אין תמונה' : 'No image'}</span>
          </div>
        )}

        {/* Image count badge */}
        {grave.grave_images && grave.grave_images.length > 1 && (
          <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: 'white', borderRadius: 20, padding: '2px 8px', fontSize: '0.72rem' }}>
            +{grave.grave_images.length - 1}
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '0.9rem 1rem' }}>
        <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: '1.1rem', fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }} dir={lang === 'he' ? 'rtl' : 'ltr'}>
          {displayName}
        </p>

        {/* Death year */}
        {(deathYear || grave.death_date_hebrew) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: 6 }}>
            <Calendar size={12} />
            <span>{grave.death_date_hebrew || `נ׳ ${deathYear}`}</span>
          </div>
        )}

        {/* Location */}
        {grave.cemetery && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--ink-muted)', marginBottom: 8 }}>
            <MapPin size={12} />
            <span>{lang === 'he' ? grave.cemetery.name_he || grave.cemetery.name : grave.cemetery.name}</span>
          </div>
        )}

        {/* Badges row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {grave.condition && conditionLabel[grave.condition] && (
            <span className={`badge ${conditionBadge[grave.condition] ?? 'badge-unknown'}`}>
              {conditionLabel[grave.condition][lang]}
            </span>
          )}
          {!grave.inscription_readable && (
            <span className="badge badge-unknown" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <EyeOff size={10} />
              {lang === 'he' ? 'לא קריא' : 'Illegible'}
            </span>
          )}
          {grave.inscription_language && (
            <span className="badge badge-unknown">{grave.inscription_language}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
