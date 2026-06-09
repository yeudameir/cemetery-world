import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Types ────────────────────────────────────────────────────────────────────

export type Country = {
  id: string
  name: string
  name_he: string
  flag_emoji: string
  created_at: string
}

export type City = {
  id: string
  country_id: string
  name: string
  name_he: string
  lat: number | null
  lng: number | null
  created_at: string
}

export type Cemetery = {
  id: string
  city_id: string
  name: string
  name_he: string
  community: string | null
  founded_year: number | null
  condition: string | null
  cover_image: string | null
  lat: number | null
  lng: number | null
  description: string | null
  description_he: string | null
  created_at: string
}

export type Grave = {
  id: string
  cemetery_id: string
  first_name: string | null
  last_name: string | null
  first_name_he: string | null
  last_name_he: string | null
  birth_date: string | null
  death_date: string | null
  birth_date_hebrew: string | null
  death_date_hebrew: string | null
  inscription: string | null
  inscription_readable: boolean
  biography: string | null
  biography_he: string | null
  father_name: string | null
  mother_name: string | null
  spouse_name: string | null
  inscription_language: string | null
  condition: string | null
  lat: number | null
  lng: number | null
  created_at: string
  updated_at: string
}

export type GraveImage = {
  id: string
  grave_id: string
  url: string
  is_primary: boolean
  caption: string | null
  created_at: string
}

export type UpdateRequest = {
  id: string
  grave_id: string
  message: string
  sender_name: string | null
  sender_email: string | null
  status: string
  created_at: string
}

// ─── Extended types with joins ────────────────────────────────────────────────

export type GraveWithImages = Grave & {
  grave_images: GraveImage[]
  cemetery?: Cemetery & {
    city?: City & {
      country?: Country
    }
  }
}

export type CemeteryWithCity = Cemetery & {
  city: City & { country: Country }
  _count?: { graves: number }
}
