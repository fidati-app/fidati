import { devLog, devLogSupabaseError } from '@/lib/devLog';
import { supabase } from '@/lib/supabaseClient';

export type ChangeRequestResponse = {
  id: string;
  professional_id: string;
  notification_id: string;
  request_type: string;
  area: string;
  response_type: 'updated_data' | 'explanation' | 'upload';
  message: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  attachment_url: string | null;
  status: 'submitted' | 'reviewed' | 'accepted' | 'rejected';
  created_at: string;
};

export async function submitChangeRequestResponse(input: {
  notificationId: string;
  responseType: 'updated_data' | 'explanation' | 'upload';
  message?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  attachmentUrl?: string;
}): Promise<string> {
  const { data, error } = await supabase.rpc('submit_change_request_response', {
    p_notification_id: input.notificationId,
    p_response_type: input.responseType,
    p_message: input.message ?? null,
    p_old_value: input.oldValue ?? null,
    p_new_value: input.newValue ?? null,
    p_attachment_url: input.attachmentUrl ?? null,
  });

  if (error) {
    devLogSupabaseError('submitChangeRequestResponse', error);
    throw error;
  }

  if (__DEV__) {
    devLog('Correzione inviata', { notificationId: input.notificationId, responseId: data });
  }

  return data as string;
}

export async function fetchResponsesForNotification(notificationId: string): Promise<ChangeRequestResponse[]> {
  const { data, error } = await supabase
    .from('professional_change_request_responses')
    .select('*')
    .eq('notification_id', notificationId)
    .order('created_at', { ascending: false });

  if (error) {
    devLogSupabaseError('fetchResponsesForNotification', error);
    throw error;
  }

  return (data ?? []) as ChangeRequestResponse[];
}
