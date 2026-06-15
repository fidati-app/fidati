import { supabase } from '@/lib/supabaseClient';

import { normalizePhoneDigits } from '@/utils/phoneUtils';

export async function isPhoneAlreadyRegistered(phone: string): Promise<boolean> {
  const digits = normalizePhoneDigits(phone.trim());
  if (!digits) return false;

  const { data, error } = await supabase.rpc('check_auth_phone_registered', {
    p_phone: digits,
  });

  if (error) {
    throw error;
  }

  return Boolean(data);
}
