import { supabase } from '@/lib/supabase';

async function logAdminAction(action: string, targetType: string, targetId: string, metadata: Record<string, unknown> = {}) {
  await supabase.rpc('add_admin_audit_log', {
    p_action: action,
    p_target_type: targetType,
    p_target_id: targetId,
    p_metadata: metadata,
  });
}

export async function updateProfessionalProfile(
  professionalId: string,
  patch: {
    name?: string;
    phone?: string | null;
    category_label?: string;
    base_city?: string | null;
    account_status?: string;
    verification_status?: string;
  },
  before?: Record<string, unknown>,
) {
  const { error } = await supabase.from('professionals').update(patch).eq('id', professionalId);
  if (error) throw error;
  await logAdminAction('update_professional', 'professional', professionalId, { before, after: patch });
}

export async function addProfessionalZone(professionalId: string, zoneName: string, sortOrder: number) {
  const { data, error } = await supabase
    .from('professional_zones')
    .insert({ professional_id: professionalId, zone_name: zoneName.trim(), sort_order: sortOrder })
    .select('*')
    .single();
  if (error) throw error;
  await logAdminAction('add_zone', 'professional', professionalId, { zone: zoneName });
  return data;
}

export async function removeProfessionalZone(zoneId: string, professionalId: string, zoneName: string) {
  const { error } = await supabase.from('professional_zones').delete().eq('id', zoneId);
  if (error) throw error;
  await logAdminAction('remove_zone', 'professional', professionalId, { zone: zoneName });
}

export async function upsertProfessionalService(
  professionalId: string,
  service: {
    id?: string;
    title: string;
    price_from: number;
    price_max?: number | null;
    duration_label?: string;
    is_active?: boolean;
    is_custom?: boolean;
    sort_order?: number;
  },
) {
  if (service.id) {
    const { error } = await supabase.from('professional_services').update(service).eq('id', service.id);
    if (error) throw error;
    await logAdminAction('update_service', 'professional', professionalId, { service });
    return service.id;
  }
  const { data, error } = await supabase
    .from('professional_services')
    .insert({ ...service, professional_id: professionalId })
    .select('id')
    .single();
  if (error) throw error;
  await logAdminAction('add_service', 'professional', professionalId, { service });
  return data.id as string;
}

export async function deleteProfessionalService(serviceId: string, professionalId: string, title: string) {
  const { error } = await supabase.from('professional_services').delete().eq('id', serviceId);
  if (error) throw error;
  await logAdminAction('delete_service', 'professional', professionalId, { title });
}

export async function updateAvailabilityDay(
  professionalId: string,
  dayOfWeek: number,
  patch: { is_available?: boolean; start_time?: string | null; end_time?: string | null; status?: string },
) {
  const { error } = await supabase
    .from('professional_availability')
    .update(patch)
    .eq('professional_id', professionalId)
    .eq('day_of_week', dayOfWeek);
  if (error) throw error;
  await logAdminAction('update_availability', 'professional', professionalId, { dayOfWeek, ...patch });
}

export async function setAcceptsUrgentJobs(professionalId: string, value: boolean) {
  const { error } = await supabase.from('professionals').update({ accepts_urgent_jobs: value }).eq('id', professionalId);
  if (error) throw error;
  await logAdminAction('update_urgent_jobs', 'professional', professionalId, { accepts_urgent_jobs: value });
}

export async function updateWorkPhotoTitle(photoId: string, professionalId: string, title: string | null) {
  const { error } = await supabase.from('professional_work_photos').update({ title }).eq('id', photoId);
  if (error) throw error;
  await logAdminAction('update_work_photo', 'professional', professionalId, { photoId, title });
}

export async function deleteWorkPhoto(photoId: string, professionalId: string) {
  const { error } = await supabase.from('professional_work_photos').delete().eq('id', photoId);
  if (error) throw error;
  await logAdminAction('delete_work_photo', 'professional', professionalId, { photoId });
}

export async function saveAdminNote(targetType: string, targetId: string, body: string) {
  const { error } = await supabase.from('admin_notes').insert({
    admin_id: (await supabase.rpc('current_admin_id')).data,
    target_type: targetType,
    target_id: targetId,
    body,
  });
  if (error) throw error;
}

export async function linkStaffByEmail(email: string, fullName: string, role: string) {
  const { data, error } = await supabase.rpc('link_admin_by_email', {
    p_email: email,
    p_full_name: fullName,
    p_role: role,
  });
  if (error) throw error;
  return data as string;
}

export async function updateStaffMember(
  adminId: string,
  patch: { full_name?: string; role?: string; is_active?: boolean },
) {
  const { error } = await supabase.from('admin_users').update(patch).eq('id', adminId);
  if (error) throw error;
  await logAdminAction('update_staff', 'admin_user', adminId, patch);
}

export async function updateServiceCategory(
  categoryId: string,
  patch: { name?: string; slug?: string; is_active?: boolean; sort_order?: number },
) {
  const { error } = await supabase.from('service_categories').update(patch).eq('id', categoryId);
  if (error) throw error;
  await logAdminAction('update_category', 'service_category', categoryId, patch);
}

export async function updateBookingRequestStatus(requestId: string, status: string) {
  const { error } = await supabase.from('booking_requests').update({ status }).eq('id', requestId);
  if (error) throw error;
  await logAdminAction('update_request_status', 'booking_request', requestId, { status });
}
