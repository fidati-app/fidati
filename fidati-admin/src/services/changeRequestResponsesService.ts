import { supabase } from '@/lib/supabase';

export type ChangeRequestResponseRow = {
  id: string;
  professional_id: string;
  notification_id: string;
  request_type: string;
  area: string;
  response_type: string;
  message: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  attachment_url: string | null;
  status: 'submitted' | 'reviewed' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  professional_internal_notifications?: {
    title: string;
    message: string;
    type: string;
  } | null;
};

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Ricevuta',
  reviewed: 'In revisione',
  accepted: 'Approvata',
  rejected: 'Rifiutata',
};

const RESPONSE_TYPE_LABELS: Record<string, string> = {
  updated_data: 'Dati aggiornati',
  explanation: 'Spiegazione',
  upload: 'Nuovo file',
};

export function responseStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export function responseTypeLabel(type: string): string {
  return RESPONSE_TYPE_LABELS[type] ?? type;
}

export async function fetchProfessionalChangeResponses(
  professionalId: string,
): Promise<ChangeRequestResponseRow[]> {
  const { data, error } = await supabase
    .from('professional_change_request_responses')
    .select(
      '*, professional_internal_notifications(title, message, type)',
    )
    .eq('professional_id', professionalId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ChangeRequestResponseRow[];
}

export async function reviewChangeResponse(
  responseId: string,
  status: 'reviewed' | 'accepted' | 'rejected',
  resolveNotification = true,
): Promise<void> {
  const { error } = await supabase.rpc('review_change_request_response', {
    p_response_id: responseId,
    p_status: status,
    p_resolve_notification: resolveNotification,
  });
  if (error) throw error;
}
