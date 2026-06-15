import { supabase } from '@/lib/supabase';
import type { Permission } from '@/hooks/usePermissions';

export async function fetchAdminPermissions(adminUserId: string): Promise<Permission[]> {
  const { data, error } = await supabase
    .from('admin_permissions')
    .select('permission')
    .eq('admin_user_id', adminUserId);
  if (error) throw error;
  return (data ?? []).map((r) => r.permission as Permission);
}

export async function saveAdminPermissions(adminUserId: string, permissions: Permission[]) {
  const { error } = await supabase.rpc('save_admin_permissions', {
    p_admin_user_id: adminUserId,
    p_permissions: permissions,
  });
  if (error) throw error;
}
