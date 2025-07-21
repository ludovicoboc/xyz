import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helper function for error handling
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error)
  throw new Error(error.message || 'Erro na operação com banco de dados')
}