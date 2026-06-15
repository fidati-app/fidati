export function devLog(message: string, detail?: unknown) {
  if (!__DEV__) return;
  if (detail !== undefined) {
    console.log(`[Fidati Pro] ${message}`, detail);
    return;
  }
  console.log(`[Fidati Pro] ${message}`);
}

/** Log compatto per errori Supabase / PostgREST in DEV. */
export function devLogSupabaseError(context: string, error: unknown) {
  if (!__DEV__) return;

  if (error && typeof error === 'object') {
    const postgrestError = error as { code?: string; message?: string };
    console.warn(
      `[Fidati Pro] ${context}:`,
      postgrestError.code ?? 'unknown',
      postgrestError.message ?? String(error),
    );
    return;
  }

  console.warn(`[Fidati Pro] ${context}:`, String(error));
}
