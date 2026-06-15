import { supabase } from '@/lib/supabase';

export async function fetchAdminUsers() {
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, email, full_name, role, is_active, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchAuditLogs(limit = 100) {
  const { data, error } = await supabase
    .from('admin_audit_logs')
    .select('id, action, target_type, target_id, metadata, created_at, admin_users(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function fetchServiceCategories() {
  const { data, error } = await supabase
    .from('service_categories')
    .select('id, slug, name, professional_count, is_active, sort_order')
    .order('sort_order');

  if (error) throw error;
  return data ?? [];
}
