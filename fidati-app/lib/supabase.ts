import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

if (__DEV__) {
  console.log('[Supabase] config check:');
  console.log(
    `  EXPO_PUBLIC_SUPABASE_URL: ${supabaseUrl ? `ok (${supabaseUrl})` : 'MANCANTE'}`,
  );
  console.log(
    `  EXPO_PUBLIC_SUPABASE_ANON_KEY: ${
      supabaseAnonKey
        ? `ok (len=${supabaseAnonKey.length}, prefisso=${supabaseAnonKey.slice(0, 14)}...)`
        : 'MANCANTE'
    }`,
  );
  console.log(`  isSupabaseEnabled: ${isSupabaseEnabled}`);
}
