export function normalizePhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

/** Minimo 8 cifre prima di interrogare Supabase. */
export function isValidPhoneForAvailabilityCheck(phone: string): boolean {
  return normalizePhoneDigits(phone).length >= 8;
}
