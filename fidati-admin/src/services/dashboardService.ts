import { safeCount, safeSelect, safeSum } from '@/lib/safeSupabase';
import { supabase } from '@/lib/supabase';
import type { DashboardStats, PaymentRow, ProfessionalPreview, ReportPreview } from '@/types';

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [
    professionalsTotal,
    professionalsVerified,
    professionalsUnverified,
    pendingVerifications,
    rejectedVerifications,
    bannedProfessionals,
    customersTotal,
    requestsTotal,
    openRequests,
    completedRequests,
    openReports,
    paymentsTotal,
    revenueTotal,
    activeStaff,
  ] = await Promise.all([
    safeCount('professionals'),
    safeCount('professionals', [{ column: 'verification_status', value: 'verified' }]),
    safeCount('professionals', [{ column: 'verification_status', value: 'unverified' }]),
    safeCount('professionals', [{ column: 'verification_status', value: 'pending_review' }]),
    safeCount('professionals', [{ column: 'verification_status', value: 'rejected' }]),
    safeCount('professionals', [{ column: 'account_status', value: 'banned' }]),
    safeCount('customers'),
    safeCount('booking_requests'),
    safeCount('booking_requests', [{ column: 'status', value: 'pending' }]),
    safeCount('booking_requests', [{ column: 'status', value: 'completed' }]),
    safeCount('reports', undefined, { column: 'status', values: ['open', 'reviewing'] }),
    safeCount('payments'),
    safeSum('payments', 'amount'),
    safeCount('admin_users', [{ column: 'is_active', value: true }]),
  ]);

  const commissionEstimate = revenueTotal * 0.12;

  return {
    professionalsTotal,
    professionalsVerified,
    professionalsUnverified,
    pendingVerifications,
    rejectedVerifications,
    bannedProfessionals,
    customersTotal,
    requestsTotal,
    openRequests,
    completedRequests,
    openReports,
    paymentsTotal,
    revenueTotal,
    commissionEstimate,
    activeStaff,
  };
}

export async function fetchRecentAuditLogs(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select('id, action, target_type, target_id, metadata, created_at, admin_users(full_name, email, role)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.warn('[audit]', error.message);
      return [];
    }
    return data ?? [];
  } catch {
    return [];
  }
}

export async function fetchProfessionalsGrowthByDays(days: 7 | 30 | 90) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceIso = since.toISOString();

  const rows = await safeSelect<{ created_at: string; verification_status: string }>(
    'professionals',
    'created_at, verification_status',
    { order: { column: 'created_at', ascending: true }, limit: 5000 },
  );

  const filtered = rows.filter((r) => r.created_at >= sinceIso);
  const bucketKey = days <= 7 ? 'day' : days <= 30 ? 'day' : 'week';

  const buckets = new Map<string, { label: string; total: number; verified: number }>();

  for (const row of filtered) {
    const d = new Date(row.created_at);
    let key: string;
    let label: string;
    if (bucketKey === 'day') {
      key = row.created_at.slice(0, 10);
      label = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short' }).format(d);
    } else {
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      key = weekStart.toISOString().slice(0, 10);
      label = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short' }).format(weekStart);
    }
    const cur = buckets.get(key) ?? { label, total: 0, verified: 0 };
    cur.total += 1;
    if (row.verification_status === 'verified') cur.verified += 1;
    buckets.set(key, cur);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);
}

/** @deprecated use fetchProfessionalsGrowthByDays */
export async function fetchProfessionalsGrowth() {
  return safeSelect<{ created_at: string; verification_status: string }>('professionals', 'created_at, verification_status', {
    order: { column: 'created_at', ascending: true },
    limit: 5000,
  }).then((rows) => {
    const byMonth = new Map<string, { total: number; verified: number }>();
    for (const row of rows) {
      const month = row.created_at.slice(0, 7);
      const current = byMonth.get(month) ?? { total: 0, verified: 0 };
      current.total += 1;
      if (row.verification_status === 'verified') current.verified += 1;
      byMonth.set(month, current);
    }
    return Array.from(byMonth.entries()).map(([month, values]) => ({ month, ...values }));
  });
}

export async function fetchRecentProfessionals(limit = 5): Promise<ProfessionalPreview[]> {
  return safeSelect<ProfessionalPreview>(
    'professionals',
    'id, name, category_label, verification_status, created_at, base_city, account_status',
    { limit, order: { column: 'created_at', ascending: false } },
  );
}

export async function fetchRecentReports(limit = 5): Promise<ReportPreview[]> {
  return safeSelect<ReportPreview>('reports', 'id, reason, status, target_type, created_at', {
    limit,
    order: { column: 'created_at', ascending: false },
  });
}

export async function fetchRecentPayments(limit = 5): Promise<PaymentRow[]> {
  return safeSelect<PaymentRow>('payments', 'id, amount, status, created_at', {
    limit,
    order: { column: 'created_at', ascending: false },
  });
}

export async function fetchPendingVerificationPreview(limit = 5): Promise<ProfessionalPreview[]> {
  return safeSelect<ProfessionalPreview>(
    'professionals',
    'id, name, category_label, verification_requested_at, base_city, verification_status, created_at',
    {
      limit,
      filters: [{ column: 'verification_status', value: 'pending_review' }],
      order: { column: 'verification_requested_at', ascending: true },
    },
  );
}

export async function checkSystemHealth() {
  const checks = { supabase: false, storage: false, rls: false };
  try {
    const { error } = await supabase.from('professionals').select('id', { head: true, count: 'exact' }).limit(1);
    checks.supabase = !error;
    checks.rls = !error;
  } catch {
    /* ignore */
  }
  try {
    const { error } = await supabase.storage.from('professional-portfolio').list('', { limit: 1 });
    checks.storage = !error;
  } catch {
    /* ignore */
  }
  return checks;
}
