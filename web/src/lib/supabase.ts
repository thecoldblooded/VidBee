import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Download = {
  id: string
  user_id: string
  url: string
  title: string
  thumbnail: string
  format: string
  quality: string
  status: 'pending' | 'downloading' | 'completed' | 'failed'
  progress: number
  file_size: number
  download_speed: string
  eta: string
  error_message: string
  created_at: string
  updated_at: string
  completed_at: string | null
}

export type DownloadHistory = {
  id: string
  user_id: string
  url: string
  title: string
  thumbnail: string
  format: string
  quality: string
  file_size: number
  duration: number
  downloaded_at: string
}
