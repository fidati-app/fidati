import { supabase } from '@/lib/supabase';
import type { ReportRow, ReportTicketEvent } from '@/types';

export type ReportStatus = 'open' | 'reviewing' | 'waiting_user' | 'resolved' | 'dismissed';
export type ReportPriority = 'low' | 'normal' | 'high' | 'urgent';

export async function fetchReports(status = 'all', priority = 'all'): Promise<ReportRow[]> {
  let query = supabase
    .from('reports')
    .select(`
      id, legacy_id, reason, details, status, priority, target_type, target_id,
      created_at, updated_at, reporter_customer_id, reporter_professional_id,
      assigned_admin_id,
      customers:reporter_customer_id(name, email),
      professionals:reporter_professional_id(name, email),
      assigned_admin:assigned_admin_id(full_name, email)
    `)
    .order('created_at', { ascending: false });

  if (status !== 'all') query = query.eq('status', status);
  if (priority !== 'all') query = query.eq('priority', priority);

  const { data, error } = await query.limit(200);
  if (error) throw error;
  return (data ?? []) as ReportRow[];
}

export async function fetchReportById(id: string): Promise<ReportRow | null> {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      id, legacy_id, reason, details, status, priority, target_type, target_id,
      created_at, updated_at, reporter_customer_id, reporter_professional_id,
      assigned_admin_id,
      customers:reporter_customer_id(name, email, phone),
      professionals:reporter_professional_id(name, email, phone),
      assigned_admin:assigned_admin_id(id, full_name, email)
    `)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as ReportRow | null) ?? null;
}

export async function fetchReportEvents(reportId: string): Promise<ReportTicketEvent[]> {
  const { data, error } = await supabase
    .from('report_ticket_events')
    .select('id, event_type, previous_value, new_value, note, created_at, admin_users(full_name, email)')
    .eq('report_id', reportId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ReportTicketEvent[];
}

export async function fetchReportNotes(reportId: string) {
  const { data, error } = await supabase
    .from('admin_notes')
    .select('id, body, created_at, admin_users(full_name)')
    .eq('target_type', 'report')
    .eq('target_id', reportId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchReportAuditLogs(reportId: string) {
  const { data, error } = await supabase
    .from('admin_audit_logs')
    .select('id, action, metadata, created_at, admin_users(full_name, role)')
    .eq('target_type', 'report')
    .eq('target_id', reportId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateReportTicket(input: {
  reportId: string;
  status?: ReportStatus;
  priority?: ReportPriority;
  assignedAdminId?: string | null;
  note?: string;
}) {
  const { error } = await supabase.rpc('update_report_ticket', {
    p_report_id: input.reportId,
    p_status: input.status ?? null,
    p_priority: input.priority ?? null,
    p_assigned_admin_id: input.assignedAdminId ?? null,
    p_note: input.note ?? null,
  });
  if (error) throw error;
}

/** @deprecated use updateReportTicket */
export async function updateReportStatus(reportId: string, status: string) {
  await updateReportTicket({ reportId, status: status as ReportStatus });
}
