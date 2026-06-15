import { supabase } from '@/lib/supabaseClient';

export async function isEmailAlreadyRegistered(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;

  const { data, error } = await supabase.rpc('check_auth_email_registered', {
    p_email: normalized,
  });

  if (error) {
    throw error;
  }

  return Boolean(data);
}
