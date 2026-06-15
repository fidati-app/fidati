import { supabase } from '@/lib/supabase';

export type NotificationType =
  | 'verification_approved'
  | 'verification_rejected'
  | 'verification_changes_requested'
  | 'service_change_requested'
  | 'portfolio_change_requested'
  | 'document_change_requested'
  | 'account_banned'
  | 'account_suspended'
  | 'general';

export type TargetSection =
  | 'profile'
  | 'services'
  | 'portfolio'
  | 'documents'
  | 'zones'
  | 'availability';

export async function createProfessionalNotification(input: {
  professionalId: string;
  type: NotificationType;
  title: string;
  message: string;
  targetSection: TargetSection;
  relatedEntityType?: string;
  relatedEntityId?: string;
  fieldKey?: string;
  reason?: string;
}) {
  const { data, error } = await supabase.rpc('create_professional_notification', {
    p_professional_id: input.professionalId,
    p_type: input.type,
    p_title: input.title,
    p_message: input.message,
    p_target_section: input.targetSection,
    p_related_entity_type: input.relatedEntityType ?? null,
    p_related_entity_id: input.relatedEntityId ?? null,
    p_field_key: input.fieldKey ?? null,
    p_reason: input.reason ?? input.message ?? null,
  });
  if (error) throw error;
  return data as string;
}

export async function requestProfessionalChanges(input: {
  professionalId: string;
  areas: string[];
  message: string;
  preset?: string;
}) {
  const { error } = await supabase.rpc('request_professional_changes', {
    p_professional_id: input.professionalId,
    p_areas: input.areas,
    p_message: input.message,
    p_preset: input.preset ?? null,
  });
  if (error) throw error;
}

export async function requestServiceChange(
  professionalId: string,
  serviceId: string,
  message: string,
  preset?: string,
) {
  await createProfessionalNotification({
    professionalId,
    type: 'service_change_requested',
    title: 'Modifica servizio richiesta',
    message: preset ? `${preset}: ${message}` : message,
    targetSection: 'services',
    relatedEntityType: 'service',
    relatedEntityId: serviceId,
    fieldKey: 'service_price',
    reason: message,
  });
  await supabase.rpc('add_admin_audit_log', {
    p_action: 'request_service_change',
    p_target_type: 'professional',
    p_target_id: professionalId,
    p_metadata: { service_id: serviceId, message, preset, field_key: 'service_price' },
  });
}

export async function requestPortfolioChange(
  professionalId: string,
  photoId: string,
  message: string,
  preset?: string,
) {
  await createProfessionalNotification({
    professionalId,
    type: 'portfolio_change_requested',
    title: 'Modifica foto lavoro richiesta',
    message: preset ? `${preset}: ${message}` : message,
    targetSection: 'portfolio',
    relatedEntityType: 'portfolio_photo',
    relatedEntityId: photoId,
    fieldKey: 'portfolio_photo',
    reason: message,
  });
  await supabase.rpc('add_admin_audit_log', {
    p_action: 'request_portfolio_change',
    p_target_type: 'professional',
    p_target_id: professionalId,
    p_metadata: { photo_id: photoId, message, preset, field_key: 'portfolio_photo' },
  });
}

export async function requestDocumentChange(
  professionalId: string,
  fieldKey: 'document_front' | 'document_back' | 'selfie',
  message: string,
  preset?: string,
) {
  await createProfessionalNotification({
    professionalId,
    type: 'document_change_requested',
    title: 'Modifica documento richiesta',
    message: preset ? `${preset}: ${message}` : message,
    targetSection: 'documents',
    relatedEntityType: 'verification_document',
    fieldKey,
    reason: message,
  });
  await supabase.rpc('add_admin_audit_log', {
    p_action: 'request_document_change',
    p_target_type: 'professional',
    p_target_id: professionalId,
    p_metadata: { message, preset, field_key: fieldKey },
  });
}
