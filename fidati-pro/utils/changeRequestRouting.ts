import type { ProInternalNotification } from '@/services/professionalInternalNotificationsService';

export type ChangeRequestFlowKind =
  | 'document_front'
  | 'document_back'
  | 'selfie'
  | 'portfolio_photo'
  | 'service_price'
  | 'availability'
  | 'urgent_jobs'
  | 'zones'
  | 'profile_photo'
  | 'profile_data'
  | 'generic';

export type ChangeRequestRouteInput = Pick<
  ProInternalNotification,
  'type' | 'target_section' | 'message' | 'related_entity_type' | 'related_entity_id' | 'field_key' | 'reason'
>;

function inferFieldKeyFromMessage(message: string): string | null {
  const lower = message.toLowerCase();
  if (lower.includes('selfie')) return 'selfie';
  if (lower.includes('retro') || lower.includes('back')) return 'document_back';
  if (lower.includes('fronte') || lower.includes('front')) return 'document_front';
  if (lower.includes('disponibilit') && lower.includes('urgent')) return 'urgent_jobs';
  if (lower.includes('disponibilit')) return 'availability';
  if (lower.includes('zona') || lower.includes('citt')) return 'zones';
  if (lower.includes('foto profilo')) return 'profile_photo';
  return null;
}

export function resolveFieldKey(input: ChangeRequestRouteInput): string | null {
  if (input.field_key) return input.field_key;

  if (input.type === 'portfolio_change_requested' || input.related_entity_type === 'work_photo') {
    return 'portfolio_photo';
  }
  if (input.type === 'service_change_requested' || input.related_entity_type === 'service') {
    return 'service_price';
  }
  if (input.type === 'document_change_requested') {
    return inferFieldKeyFromMessage(input.message) ?? 'document_front';
  }
  if (input.target_section === 'documents') {
    return inferFieldKeyFromMessage(input.message) ?? 'document_front';
  }
  if (input.target_section === 'portfolio') return 'portfolio_photo';
  if (input.target_section === 'services') return 'service_price';
  if (input.target_section === 'availability') return 'availability';
  if (input.target_section === 'zones') return 'zones';
  if (input.target_section === 'profile') return 'profile_data';

  return inferFieldKeyFromMessage(input.message);
}

export function resolveChangeRequestFlow(input: ChangeRequestRouteInput): ChangeRequestFlowKind {
  const key = resolveFieldKey(input);

  if (__DEV__) {
    console.log('[CHANGE_REQUEST] route', {
      id: 'related_entity_id' in input ? input.related_entity_id : undefined,
      type: input.type,
      field: key,
      entity: input.related_entity_type,
    });
  }

  switch (key) {
    case 'document_front':
      return 'document_front';
    case 'document_back':
      return 'document_back';
    case 'selfie':
      return 'selfie';
    case 'portfolio_photo':
    case 'work_photos':
      return 'portfolio_photo';
    case 'service_price':
    case 'services':
    case 'prices':
      return 'service_price';
    case 'availability':
      return 'availability';
    case 'urgent_jobs':
      return 'urgent_jobs';
    case 'zones':
    case 'cities':
      return 'zones';
    case 'profile_photo':
      return 'profile_photo';
    case 'profile_data':
      return 'profile_data';
    default:
      if (input.related_entity_type === 'work_photo' || input.related_entity_type === 'portfolio_photo') {
        return 'portfolio_photo';
      }
      if (input.related_entity_type === 'service') return 'service_price';
      return 'generic';
  }
}

export function flowScreenTitle(flow: ChangeRequestFlowKind): string {
  switch (flow) {
    case 'document_front':
      return 'Aggiorniamo il fronte';
    case 'document_back':
      return 'Aggiorniamo il retro';
    case 'selfie':
      return 'Aggiorniamo il selfie';
    case 'portfolio_photo':
      return 'Sistemiamo questa foto';
    case 'service_price':
      return 'Controlliamo questo prezzo';
    case 'availability':
      return 'Aggiorniamo la disponibilità';
    case 'urgent_jobs':
      return 'Lavori urgenti';
    case 'zones':
      return 'Zone operative';
    case 'profile_photo':
      return 'Foto profilo';
    case 'profile_data':
      return 'Dati profilo';
    default:
      return 'Sistemiamo un dettaglio';
  }
}

export function fieldKeyToDocSlot(fieldKey: string): 'front' | 'back' | 'selfie' | null {
  switch (fieldKey) {
    case 'document_front':
      return 'front';
    case 'document_back':
      return 'back';
    case 'selfie':
      return 'selfie';
    default:
      return null;
  }
}

/** Cosa può modificare il pro nel flow zone. */
export type ZonesFixScope = 'operational_only' | 'base_city' | 'both';

export function resolveZonesFixScope(input: ChangeRequestRouteInput): ZonesFixScope {
  const key = resolveFieldKey(input);
  const combined = `${input.message ?? ''} ${input.reason ?? ''}`.toLowerCase();

  const mentionsBase =
    key === 'base_city' ||
    combined.includes('città principale') ||
    combined.includes('citta principale') ||
    combined.includes('città base') ||
    combined.includes('citta base');

  const mentionsZones =
    key === 'zones' ||
    key === 'cities' ||
    combined.includes('zone operative') ||
    combined.includes('zone serv') ||
    (combined.includes('zona') && !mentionsBase);

  if (mentionsBase && mentionsZones) return 'both';
  if (mentionsBase) return 'base_city';
  return 'operational_only';
}
