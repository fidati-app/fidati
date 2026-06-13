import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const STORAGE_PROBE_KEY = '@fidati_pro/storage_probe';

/** Messaggio se AsyncStorage non è utilizzabile (es. native module mancante). */
export let asyncStorageError: string | null = null;

let storageProbePromise: Promise<boolean> | null = null;

/**
 * Verifica che AsyncStorage risponda prima di persistere la sessione Supabase.
 * Evita crash su getItem / refresh token quando il native module non è disponibile.
 */
export function probeAsyncStorage(): Promise<boolean> {
  if (!storageProbePromise) {
    storageProbePromise = (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_PROBE_KEY, 'ok');
        await AsyncStorage.removeItem(STORAGE_PROBE_KEY);
        asyncStorageError = null;
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'AsyncStorage non disponibile su questo dispositivo.';
        asyncStorageError =
          'Storage locale non disponibile. Chiudi Expo Go, riavvia Metro con `npx expo start -c` e riapri l’app. ' +
          `(Dettaglio: ${message})`;
        if (__DEV__) {
          console.error('[Fidati Pro] AsyncStorage probe failed:', err);
        }
        return false;
      }
    })();
  }
  return storageProbePromise;
}

const supabaseAuthStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (err) {
      if (__DEV__) {
        console.warn('[Fidati Pro] AsyncStorage.getItem failed:', err);
      }
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (err) {
      if (__DEV__) {
        console.warn('[Fidati Pro] AsyncStorage.setItem failed:', err);
      }
      throw err;
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      if (__DEV__) {
        console.warn('[Fidati Pro] AsyncStorage.removeItem failed:', err);
      }
    }
  },
};

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: supabaseAuthStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

if (__DEV__) {
  console.log('[Fidati Pro] env EXPO_PUBLIC_SUPABASE_URL present:', Boolean(supabaseUrl));
  console.log('[Fidati Pro] env EXPO_PUBLIC_SUPABASE_ANON_KEY present:', Boolean(supabaseAnonKey));
  console.log('[Fidati Pro] isSupabaseConfigured:', isSupabaseConfigured);
}
