import { isSupabaseEnabled } from '@/lib/supabase';
import {
  logFallback,
  logQueryError,
  logQueryStart,
  logQuerySuccess,
  QueryMeta,
  registerHomeFetch,
} from '@/lib/supabaseDebug';

export async function withMockFallback<T>(
  meta: QueryMeta,
  fetcher: () => Promise<T | null | undefined>,
  fallback: T,
): Promise<T> {
  if (!isSupabaseEnabled) {
    logFallback(meta, 'env mancanti (EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY)');
    registerHomeFetch(meta.table, 'mock');
    return fallback;
  }

  logQueryStart(meta);

  try {
    const result = await fetcher();

    if (result == null) {
      logFallback(meta, 'risposta null');
      registerHomeFetch(meta.table, 'mock');
      return fallback;
    }

    if (Array.isArray(result) && result.length === 0) {
      logFallback(meta, '0 record');
      registerHomeFetch(meta.table, 'mock');
      return fallback;
    }

    const count = Array.isArray(result) ? result.length : 1;
    logQuerySuccess(meta, count);
    registerHomeFetch(meta.table, 'db');
    return result;
  } catch (error) {
    logQueryError(meta, error);
    logFallback(meta, 'errore query');
    registerHomeFetch(meta.table, 'mock');
    return fallback;
  }
}
