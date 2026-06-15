import { supabase } from '@/lib/supabase';
import type { ProfessionalRow, VerificationQueueItem } from '@/types';

const PRO_SELECT = `
  id, name, category_label, email, phone, image_url, base_city, verified,
  verification_status, verification_rejected_reason, verification_requested_at,
  account_status, client_visibility_status, client_visibility_reason, client_visibility_changed_at,
  has_pro_app, rating, review_count, jobs_completed, price_per_hour, created_at,
  service_categories ( slug, name )
`;

export async function fetchProfessionals(filters: {
  search?: string;
  status?: string;
  city?: string;
  category?: string;
  categoryId?: string;
  accountStatus?: string;
  hasProApp?: string;
  sort?: 'created_at' | 'verification_status' | 'base_city' | 'rating';
  dateFrom?: string;
  dateTo?: string;
  minRating?: number;
}) {
  const {
    search = '',
    status = 'all',
    city = '',
    category = '',
    categoryId = '',
    accountStatus = 'all',
    hasProApp = 'all',
    sort = 'created_at',
    dateFrom = '',
    dateTo = '',
    minRating = 0,
  } = filters;

  let query = supabase.from('professionals').select(PRO_SELECT);

  if (status !== 'all') {
    if (status === 'banned') query = query.eq('account_status', 'banned');
    else query = query.eq('verification_status', status);
  }
  if (accountStatus !== 'all') query = query.eq('account_status', accountStatus);
  if (city.trim()) query = query.ilike('base_city', `%${city.trim()}%`);
  if (category.trim()) query = query.ilike('category_label', `%${category.trim()}%`);
  if (categoryId) query = query.eq('category_id', categoryId);
  if (hasProApp === 'yes') query = query.eq('has_pro_app', true);
  if (hasProApp === 'no') query = query.eq('has_pro_app', false);
  if (dateFrom) query = query.gte('created_at', dateFrom);
  if (dateTo) query = query.lte('created_at', `${dateTo}T23:59:59`);
  if (minRating > 0) query = query.gte('rating', minRating);
  if (search.trim()) {
    query = query.or(
      `name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%,phone.ilike.%${search.trim()}%,category_label.ilike.%${search.trim()}%`,
    );
  }

  query = query.order(sort, { ascending: sort === 'created_at' ? false : sort !== 'rating' }).limit(300);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ProfessionalRow[];
}

export async function fetchVerificationsByStatus(status: string) {
  let query = supabase.from('professionals').select(PRO_SELECT).order('verification_requested_at', { ascending: false });
  if (status === 'banned') query = query.eq('account_status', 'banned');
  else if (status === 'all') query = query.neq('verification_status', 'unverified');
  else query = query.eq('verification_status', status);
  const { data, error } = await query.limit(200);
  if (error) throw error;
  return (data ?? []) as VerificationQueueItem[];
}

export async function fetchPendingVerifications() {
  const { data, error } = await supabase
    .from('professionals')
    .select(PRO_SELECT)
    .eq('verification_status', 'pending_review')
    .order('verification_requested_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as VerificationQueueItem[];
}

export async function fetchProfessionalById(id: string) {
  const { data, error } = await supabase.from('professionals').select(PRO_SELECT).eq('id', id).maybeSingle();
  if (error) throw error;
  return data as ProfessionalRow | null;
}

export async function fetchProfessionalDetailBundle(professionalId: string) {
  const [docRes, photosRes, zonesRes, servicesRes, availabilityRes, proMetaRes, auditRes] = await Promise.all([
    supabase.from('professional_verification_documents').select('*').eq('professional_id', professionalId).maybeSingle(),
    supabase.from('professional_work_photos').select('*').eq('professional_id', professionalId).order('sort_order'),
    supabase.from('professional_zones').select('id, zone_name, sort_order').eq('professional_id', professionalId).order('sort_order'),
    supabase.from('professional_services').select('id, title, price_from, price_max, duration_label, is_active, is_custom').eq('professional_id', professionalId).order('sort_order'),
    supabase.from('professional_availability').select('day_of_week, day_label, short_label, time_ranges, status, is_available, start_time, end_time').eq('professional_id', professionalId).order('day_of_week'),
    supabase.from('professionals').select('accepts_urgent_jobs').eq('id', professionalId).maybeSingle(),
    supabase.from('admin_audit_logs').select('id, action, metadata, created_at, admin_users(full_name)').eq('target_type', 'professional').eq('target_id', professionalId).order('created_at', { ascending: false }).limit(20),
  ]);

  for (const res of [docRes, photosRes, zonesRes, servicesRes, availabilityRes, proMetaRes, auditRes]) {
    if (res.error) throw res.error;
  }

  return {
    document: docRes.data,
    workPhotos: photosRes.data ?? [],
    zones: zonesRes.data ?? [],
    services: servicesRes.data ?? [],
    availability: availabilityRes.data ?? [],
    acceptsUrgentJobs: proMetaRes.data?.accepts_urgent_jobs ?? false,
    auditLogs: auditRes.data ?? [],
  };
}

export async function approveVerification(professionalId: string) {
  const { error } = await supabase.rpc('approve_professional_verification', {
    p_professional_id: professionalId,
  });
  if (error) {
    if (import.meta.env.DEV) {
      console.error('[ADMIN_APPROVE] error full', error);
    }
    throw new Error(error.message || 'Approvazione verifica fallita');
  }
}

export async function rejectVerification(professionalId: string, reason: string) {
  const { error } = await supabase.rpc('reject_professional_verification', {
    p_professional_id: professionalId,
    p_reason: reason,
  });
  if (error) throw error;
}

export async function requestVerificationChanges(
  professionalId: string,
  message: string,
  areas?: string[],
  preset?: string,
) {
  if (areas && areas.length > 0) {
    const { error } = await supabase.rpc('request_professional_changes', {
      p_professional_id: professionalId,
      p_areas: areas,
      p_message: message,
      p_preset: preset ?? null,
    });
    if (error) throw error;
    return;
  }
  const { error } = await supabase.rpc('request_verification_changes', {
    p_professional_id: professionalId,
    p_message: message,
  });
  if (error) throw error;
}

export async function banProfessional(professionalId: string, reason?: string) {
  const { error } = await supabase.rpc('ban_professional', {
    p_professional_id: professionalId,
    p_reason: reason ?? null,
  });
  if (error) throw error;
}

/** Signed URL for private document images (valid 1h). */
export async function getSignedDocumentUrl(storagePathOrUrl: string | null | undefined) {
  if (!storagePathOrUrl) return null;

  if (storagePathOrUrl.startsWith('http')) {
    const match = storagePathOrUrl.match(/professional-documents\/(.+)$/);
    if (!match) return storagePathOrUrl;
    const path = match[1];
    const { data, error } = await supabase.storage.from('professional-documents').createSignedUrl(path, 3600);
    if (error) return storagePathOrUrl;
    return data.signedUrl;
  }

  const { data, error } = await supabase.storage
    .from('professional-documents')
    .createSignedUrl(storagePathOrUrl, 3600);
  if (error) throw error;
  return data.signedUrl;
}
