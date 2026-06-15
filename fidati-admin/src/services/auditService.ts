import { supabase } from '@/lib/supabase';

export type AuditFilters = {
  search?: string;
  adminId?: string;
  action?: string;
  targetType?: string;
  dateFrom?: string;
  dateTo?: string;
  targetId?: string;
  limit?: number;
};

export async function fetchAuditLogsFiltered(filters: AuditFilters = {}) {
  let query = supabase
    .from('admin_audit_logs')
    .select('id, action, target_type, target_id, metadata, created_at, admin_users(id, full_name, email, role)')
    .order('created_at', { ascending: false })
    .limit(filters.limit ?? 500);

  if (filters.adminId) query = query.eq('admin_id', filters.adminId);
  if (filters.action && filters.action !== 'all') query = query.eq('action', filters.action);
  if (filters.targetType && filters.targetType !== 'all') query = query.eq('target_type', filters.targetType);
  if (filters.targetId) query = query.eq('target_id', filters.targetId);
  if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
  if (filters.dateTo) query = query.lte('created_at', `${filters.dateTo}T23:59:59`);

  const { data, error } = await query;
  if (error) throw error;

  let rows = data ?? [];
  if (filters.search?.trim()) {
    const q = filters.search.toLowerCase();
    rows = rows.filter((row) => {
      const admin = row.admin_users as { full_name?: string; email?: string } | null;
      return (
        row.action.toLowerCase().includes(q) ||
        row.target_type.toLowerCase().includes(q) ||
        admin?.full_name?.toLowerCase().includes(q) ||
        admin?.email?.toLowerCase().includes(q) ||
        JSON.stringify(row.metadata).toLowerCase().includes(q)
      );
    });
  }
  return rows;
}

export async function fetchAuditActions() {
  const { data, error } = await supabase.from('admin_audit_logs').select('action').limit(1000);
  if (error) return [];
  const unique = [...new Set((data ?? []).map((r) => r.action as string))];
  return unique.sort();
}
