-- Risposte professionista alle richieste di modifica + stati notifica estesi

ALTER TABLE public.professional_internal_notifications
  DROP CONSTRAINT IF EXISTS professional_internal_notifications_status_check;

ALTER TABLE public.professional_internal_notifications
  ADD CONSTRAINT professional_internal_notifications_status_check
  CHECK (status IN ('unread', 'read', 'correction_submitted', 'resolved'));

CREATE TABLE IF NOT EXISTS public.professional_change_request_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  notification_id UUID NOT NULL REFERENCES public.professional_internal_notifications(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL,
  area TEXT NOT NULL DEFAULT 'profile',
  response_type TEXT NOT NULL CHECK (response_type IN ('updated_data', 'explanation', 'upload')),
  message TEXT,
  old_value JSONB,
  new_value JSONB,
  attachment_url TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_change_responses_pro ON public.professional_change_request_responses(professional_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_change_responses_notif ON public.professional_change_request_responses(notification_id);

ALTER TABLE public.professional_change_request_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pro_manage_own_change_responses" ON public.professional_change_request_responses;
CREATE POLICY "pro_manage_own_change_responses"
  ON public.professional_change_request_responses FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.professionals p
      WHERE p.id = professional_id AND p.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.professionals p
      WHERE p.id = professional_id AND p.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "admin_manage_change_responses" ON public.professional_change_request_responses;
CREATE POLICY "admin_manage_change_responses"
  ON public.professional_change_request_responses FOR ALL TO authenticated
  USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());

GRANT SELECT, INSERT, UPDATE ON public.professional_change_request_responses TO authenticated;

CREATE OR REPLACE FUNCTION public.submit_change_request_response(
  p_notification_id UUID,
  p_response_type TEXT,
  p_message TEXT DEFAULT NULL,
  p_old_value JSONB DEFAULT NULL,
  p_new_value JSONB DEFAULT NULL,
  p_attachment_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notif public.professional_internal_notifications%ROWTYPE;
  v_response_id UUID;
  v_pro_id UUID;
BEGIN
  SELECT * INTO v_notif FROM public.professional_internal_notifications WHERE id = p_notification_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Richiesta non trovata'; END IF;

  SELECT id INTO v_pro_id FROM public.professionals
  WHERE id = v_notif.professional_id AND auth_user_id = auth.uid();

  IF v_pro_id IS NULL AND NOT public.is_active_admin() THEN
    RAISE EXCEPTION 'Accesso negato';
  END IF;

  INSERT INTO public.professional_change_request_responses (
    professional_id, notification_id, request_type, area,
    response_type, message, old_value, new_value, attachment_url, status
  ) VALUES (
    v_notif.professional_id,
    p_notification_id,
    v_notif.type,
    v_notif.target_section,
    p_response_type,
    NULLIF(trim(p_message), ''),
    p_old_value,
    p_new_value,
    p_attachment_url,
    'submitted'
  ) RETURNING id INTO v_response_id;

  UPDATE public.professional_internal_notifications
  SET status = 'correction_submitted'
  WHERE id = p_notification_id;

  RETURN v_response_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.review_change_request_response(
  p_response_id UUID,
  p_status TEXT,
  p_resolve_notification BOOLEAN DEFAULT true
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.professional_change_request_responses%ROWTYPE;
BEGIN
  IF NOT public.is_active_admin() THEN RAISE EXCEPTION 'Accesso negato'; END IF;
  IF p_status NOT IN ('reviewed', 'accepted', 'rejected') THEN
    RAISE EXCEPTION 'Stato non valido';
  END IF;

  UPDATE public.professional_change_request_responses
  SET status = p_status, updated_at = now()
  WHERE id = p_response_id
  RETURNING * INTO v_row;

  IF NOT FOUND THEN RAISE EXCEPTION 'Risposta non trovata'; END IF;

  IF p_resolve_notification AND p_status IN ('accepted', 'rejected') THEN
    UPDATE public.professional_internal_notifications
    SET status = 'resolved'
    WHERE id = v_row.notification_id;
  END IF;

  PERFORM public.add_admin_audit_log(
    'review_change_response', 'professional', v_row.professional_id,
    jsonb_build_object('response_id', p_response_id, 'status', p_status)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_change_request_response(UUID, TEXT, TEXT, JSONB, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_change_request_response(UUID, TEXT, BOOLEAN) TO authenticated;
