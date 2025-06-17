// template/src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'    // loads .env

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)
