import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client singleton. Configure via environment variables.
 * env:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY
 */
let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (client) return client;
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !key) {
    throw new Error('Supabase env missing: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }
  client = createClient(url, key, {
    auth: { persistSession: false },
  });
  return client;
}

export interface BetaApplication {
  id?: string;
  created_at?: string;
  x_username: string;
  email: string;
  top_protocol: string;
  followed_seifu: boolean;
  followed_miles: boolean;
}

export async function saveBetaApplication(app: BetaApplication) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('beta_applications').insert(app).select('*').single();
  if (error) throw error;
  return data as BetaApplication;
}
