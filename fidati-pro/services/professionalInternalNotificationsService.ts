import { devLog, devLogSupabaseError } from '@/lib/devLog';
import { supabase } from '@/lib/supabaseClient';

export const PROFILE_FIXES_TITLE = 'Piccole cose da sistemare';
export const PROFILE_FIXES_SUBTITLE =
  'Ci siamo quasi. Ti chiediamo solo di sistemare alcuni dettagli per completare la verifica.';

export type NotificationStatus = 'unread' | 'read' | 'correction_submitted' | 'resolved';

export type ProInternalNotification = {
  id: string;
  professional_id: string;
  type: string;
  title: string;
  message: string;
  target_section: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  status: NotificationStatus;
  created_at: string;
  field_key?: string | null;
  reason?: string | null;
};

export const ADMIN_CHANGE_REQUEST_TYPES = [
  'verification_changes_requested',
  'service_change_requested',
  'portfolio_change_requested',
  'document_change_requested',
] as const;

export type AdminChangeRequest = ProInternalNotification & {
  fieldKey: string | null;
  areaLabel: string;
  friendlyReason: string;
  friendlyHint: string;
  adminMessage: string | null;
  actionLabel: string;
  actionRoute: string;
  isInReview: boolean;
  areaIcon: keyof typeof AREA_ICONS;
};

export const AREA_ICONS = {
  Documento: 'document-text-outline',
  Portfolio: 'images-outline',
  Servizi: 'pricetag-outline',
  Profilo: 'person-outline',
  Verifica: 'shield-checkmark-outline',
  Zone: 'map-outline',
  Disponibilità: 'calendar-outline',
} as const;

function parseAdminMessage(raw: string): { motivo: string | null; adminMessage: string | null } {
  const trimmed = raw.trim();
  if (!trimmed) return { motivo: null, adminMessage: null };

  const colonIdx = trimmed.indexOf(': ');
  if (colonIdx > 0 && colonIdx < 80) {
    return {
      motivo: trimmed.slice(0, colonIdx).trim(),
      adminMessage: trimmed.slice(colonIdx + 2).trim() || null,
    };
  }

  return { motivo: null, adminMessage: trimmed };
}

function friendlyReasonText(motivo: string | null, type: string): string {
  if (!motivo) {
    return type.includes('portfolio')
      ? 'Questa foto ha bisogno di un piccolo aggiustamento.'
      : 'Abbiamo notato qualcosa da correggere.';
  }
  const lower = motivo.toLowerCase();
  if (lower.includes('duplicat')) return 'Questa foto sembra già presente nel portfolio.';
  if (lower.includes('prezzo')) return 'Il prezzo di questo servizio ci sembra poco chiaro.';
  if (lower.includes('documento') || lower.includes('leggib'))
    return 'Il documento non è ancora abbastanza leggibile.';
  if (lower.includes('chiara') || lower.includes('qualità'))
    return 'La foto non è ancora abbastanza chiara.';
  return motivo;
}

function friendlyHintText(type: string, section: string): string {
  if (type === 'portfolio_change_requested' || section === 'portfolio') {
    return 'Caricane una diversa così possiamo verificare meglio i tuoi lavori.';
  }
  if (type === 'service_change_requested' || section === 'services') {
    return 'Se il prezzo è corretto puoi spiegarcelo; altrimenti puoi modificarlo.';
  }
  if (type === 'document_change_requested' || section === 'documents') {
    return 'Carica una nuova foto nitida del documento.';
  }
  return 'Appena sistemi questo punto, lo ricontrolliamo.';
}

export function getChangeRequestShortLabel(
  notification: Pick<ProInternalNotification, 'type' | 'target_section' | 'message'>,
): string {
  const { motivo } = parseAdminMessage(notification.message);
  if (motivo) {
    const lower = motivo.toLowerCase();
    if (lower.includes('prezzo')) return 'Prezzo da controllare';
    if (lower.includes('foto') || lower.includes('portfolio')) return 'Foto portfolio';
    if (lower.includes('documento')) return 'Documento da aggiornare';
    if (motivo.length <= 48) return motivo;
  }

  switch (notification.type) {
    case 'portfolio_change_requested':
      return 'Foto portfolio';
    case 'service_change_requested':
      return 'Prezzo da controllare';
    case 'document_change_requested':
      return 'Documento da aggiornare';
    case 'verification_changes_requested':
      switch (notification.target_section) {
        case 'portfolio':
          return 'Foto portfolio';
        case 'services':
          return 'Prezzo da controllare';
        case 'documents':
          return 'Documento da aggiornare';
        case 'profile':
          return 'Foto profilo';
        case 'zones':
          return 'Zone di lavoro';
        case 'availability':
          return 'Disponibilità';
        default:
          return 'Dettaglio profilo';
      }
    default:
      return 'Dettaglio profilo';
  }
}

export function getChangeRequestAreaLabel(
  notification: Pick<ProInternalNotification, 'type' | 'target_section'>,
): string {
  switch (notification.type) {
    case 'document_change_requested':
      return 'Documento';
    case 'portfolio_change_requested':
      return 'Portfolio';
    case 'service_change_requested':
      return 'Servizi';
    case 'verification_changes_requested':
      switch (notification.target_section) {
        case 'documents':
          return 'Documento';
        case 'portfolio':
          return 'Portfolio';
        case 'services':
          return 'Servizi';
        case 'profile':
          return 'Profilo';
        case 'zones':
          return 'Zone';
        case 'availability':
          return 'Disponibilità';
        default:
          return 'Verifica';
      }
    default:
      return 'Profilo';
  }
}

export function getChangeRequestFlowRoute(notificationId: string): string {
  return `/change-requests/${notificationId}`;
}

import { resolveFieldKey } from '@/utils/changeRequestRouting';

function mapToChangeRequest(row: ProInternalNotification): AdminChangeRequest {
  const { motivo, adminMessage } = parseAdminMessage(row.message);
  const areaLabel = getChangeRequestAreaLabel(row);
  const isInReview = row.status === 'correction_submitted';
  const fieldKey = row.field_key ?? resolveFieldKey(row);

  return {
    ...row,
    fieldKey,
    areaLabel,
    friendlyReason: friendlyReasonText(motivo, row.type),
    friendlyHint: friendlyHintText(row.type, row.target_section),
    adminMessage,
    actionLabel: isInReview ? 'In revisione' : 'Sistemiamo',
    actionRoute: getChangeRequestFlowRoute(row.id),
    isInReview,
    areaIcon: (areaLabel in AREA_ICONS ? areaLabel : 'Verifica') as keyof typeof AREA_ICONS,
  };
}

export async function fetchChangeRequestById(
  notificationId: string,
  professionalId: string,
): Promise<AdminChangeRequest | null> {
  const { data, error } = await supabase
    .from('professional_internal_notifications')
    .select(
      'id, professional_id, type, title, message, target_section, related_entity_type, related_entity_id, status, created_at, field_key, reason',
    )
    .eq('id', notificationId)
    .eq('professional_id', professionalId)
    .in('type', [...ADMIN_CHANGE_REQUEST_TYPES])
    .maybeSingle();

  if (error) {
    devLogSupabaseError('fetchChangeRequestById', error);
    throw error;
  }

  return data ? mapToChangeRequest(data as ProInternalNotification) : null;
}

export async function fetchPendingAdminChangeRequests(
  professionalId: string,
  limit = 30,
): Promise<AdminChangeRequest[]> {
  const { data, error } = await supabase
    .from('professional_internal_notifications')
    .select(
      'id, professional_id, type, title, message, target_section, related_entity_type, related_entity_id, status, created_at, field_key, reason',
    )
    .eq('professional_id', professionalId)
    .in('type', [...ADMIN_CHANGE_REQUEST_TYPES])
    .neq('status', 'resolved')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    devLogSupabaseError('fetchPendingAdminChangeRequests', error);
    throw error;
  }

  const rows = (data ?? []) as ProInternalNotification[];

  if (__DEV__) {
    devLog(`Dettagli da sistemare: ${rows.length}`, {
      professionalId,
      inReview: rows.filter((r) => r.status === 'correction_submitted').length,
    });
  }

  return rows.map(mapToChangeRequest);
}

export function formatChangeRequestDate(iso: string): string {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function isPortfolioRequest(req: Pick<ProInternalNotification, 'type' | 'target_section'>): boolean {
  return req.type === 'portfolio_change_requested' || req.target_section === 'portfolio';
}

export function isDocumentRequest(req: Pick<ProInternalNotification, 'type' | 'target_section'>): boolean {
  return req.type === 'document_change_requested' || req.target_section === 'documents';
}

export function isServiceRequest(req: Pick<ProInternalNotification, 'type' | 'target_section'>): boolean {
  return req.type === 'service_change_requested' || req.target_section === 'services';
}

export async function markVisibilityApprovedNotificationsRead(professionalId: string): Promise<void> {
  const { error } = await supabase
    .from('professional_internal_notifications')
    .update({ status: 'read' })
    .eq('professional_id', professionalId)
    .eq('type', 'general')
    .eq('title', 'Modifiche accettate')
    .eq('status', 'unread');

  if (error) {
    devLogSupabaseError('markVisibilityApprovedNotificationsRead', error);
  }
}
