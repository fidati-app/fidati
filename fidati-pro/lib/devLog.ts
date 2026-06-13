export function devLog(message: string, detail?: unknown) {
  if (!__DEV__) return;
  if (detail !== undefined) {
    console.log(`[Fidati Pro] ${message}`, detail);
    return;
  }
  console.log(`[Fidati Pro] ${message}`);
}

/** Log strutturato per errori Supabase / PostgREST in DEV. */
export function devLogSupabaseError(context: string, error: unknown) {
  if (!__DEV__) return;

  if (error && typeof error === 'object') {
    const postgrestError = error as {
      code?: string;
      message?: string;
      details?: string;
      hint?: string;
    };

    console.log(`[Fidati Pro] ${context} error.code:`, postgrestError.code ?? '(none)');
    console.log(`[Fidati Pro] ${context} error.message:`, postgrestError.message ?? String(error));
    if (postgrestError.details) {
      console.log(`[Fidati Pro] ${context} error.details:`, postgrestError.details);
    }
    if (postgrestError.hint) {
      console.log(`[Fidati Pro] ${context} error.hint:`, postgrestError.hint);
    }
    return;
  }

  console.log(`[Fidati Pro] ${context} error.message:`, String(error));
}
