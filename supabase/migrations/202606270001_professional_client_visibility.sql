-- Visibilità professionista lato clienti (fidati-app) in base alle richieste di modifica

ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS client_visibility_status TEXT NOT NULL DEFAULT 'visible'
    CHECK (client_visibility_status IN ('visible', 'hidden_changes', 'pending_review')),
  ADD COLUMN IF NOT EXISTS client_visibility_reason TEXT,
  ADD COLUMN IF NOT EXISTS client_visibility_changed_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_professionals_client_visibility
  ON public.professionals (client_visibility_status)
  WHERE verified = true;

-- Sincronizza visibilità in base alle notifiche di modifica aperte
CREATE OR REPLACE FUNCTION public.sync_professional_client_visibility(p_professional_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actionable INTEGER;
  v_review INTEGER;
  v_new_status TEXT;
  v_reason TEXT;
  v_current TEXT;
BEGIN
  IF p_professional_id IS NULL THEN
    RETURN 'visible';
  END IF;

  SELECT
    COUNT(*) FILTER (WHERE status IN ('unread', 'read')),
    COUNT(*) FILTER (WHERE status = 'correction_submitted')
  INTO v_actionable, v_review
  FROM public.professional_internal_notifications
  WHERE professional_id = p_professional_id
    AND type IN (
      'verification_changes_requested',
      'service_change_requested',
      'portfolio_change_requested',
      'document_change_requested'
    )
    AND status <> 'resolved';

  IF v_actionable > 0 THEN
    v_new_status := 'hidden_changes';
    v_reason := 'Dettagli da sistemare sul profilo';
  ELSIF v_review > 0 THEN
    v_new_status := 'pending_review';
    v_reason := 'Correzioni in revisione';
  ELSE
    v_new_status := 'visible';
    v_reason := NULL;
  END IF;

  SELECT client_visibility_status INTO v_current
  FROM public.professionals
  WHERE id = p_professional_id;

  IF NOT FOUND THEN
    RETURN v_new_status;
  END IF;

  IF v_current IS DISTINCT FROM v_new_status
     OR (SELECT client_visibility_reason FROM public.professionals WHERE id = p_professional_id)
        IS DISTINCT FROM v_reason THEN
    UPDATE public.professionals
    SET
      client_visibility_status = v_new_status,
      client_visibility_reason = v_reason,
      client_visibility_changed_at = now(),
      updated_at = now()
    WHERE id = p_professional_id;
  END IF;

  RETURN v_new_status;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_professional_client_visibility(UUID) TO authenticated;

-- Allinea professionisti con richieste già aperte
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT DISTINCT professional_id AS id
    FROM public.professional_internal_notifications
    WHERE type IN (
      'verification_changes_requested',
      'service_change_requested',
      'portfolio_change_requested',
      'document_change_requested'
    )
    AND status <> 'resolved'
  LOOP
    PERFORM public.sync_professional_client_visibility(r.id);
  END LOOP;
END;
$$;

-- Listing pubblico: solo visibili e non bannati
DROP POLICY IF EXISTS "public_read_professionals_listing" ON public.professionals;

CREATE POLICY "public_read_professionals_listing"
  ON public.professionals
  FOR SELECT
  USING (
    (verification_status = 'verified' OR verified = true)
    AND client_visibility_status = 'visible'
    AND account_status IS DISTINCT FROM 'banned'
  );

-- Policy dedicata: profilo verificato leggibile per pagina dettaglio (anche se nascosto dal listing)
DROP POLICY IF EXISTS "public_read_professional_detail" ON public.professionals;

CREATE POLICY "public_read_professional_detail"
  ON public.professionals
  FOR SELECT
  USING (
    (verification_status = 'verified' OR verified = true)
    AND account_status IS DISTINCT FROM 'banned'
  );

-- Hook: crea notifica → nascondi dai clienti
CREATE OR REPLACE FUNCTION public.create_professional_notification(
  p_professional_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_target_section TEXT DEFAULT 'profile',
  p_related_entity_type TEXT DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF NOT public.is_active_admin() THEN RAISE EXCEPTION 'Accesso negato'; END IF;

  INSERT INTO public.professional_internal_notifications (
    professional_id, type, title, message, target_section,
    related_entity_type, related_entity_id, status
  ) VALUES (
    p_professional_id, p_type, p_title, COALESCE(p_message, ''),
    COALESCE(p_target_section, 'profile'),
    p_related_entity_type, p_related_entity_id, 'unread'
  ) RETURNING id INTO v_id;

  IF p_type IN (
    'verification_changes_requested',
    'service_change_requested',
    'portfolio_change_requested',
    'document_change_requested'
  ) THEN
    PERFORM public.sync_professional_client_visibility(p_professional_id);
  END IF;

  PERFORM public.add_admin_audit_log(
    'create_pro_notification', 'professional', p_professional_id,
    jsonb_build_object(
      'notification_id', v_id, 'type', p_type,
      'target_section', p_target_section, 'title', p_title
    )
  );

  RETURN v_id;
END;
$$;

-- Hook: richiesta modifica strutturata
CREATE OR REPLACE FUNCTION public.request_professional_changes(
  p_professional_id UUID,
  p_areas TEXT[],
  p_message TEXT,
  p_preset TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target_section TEXT := 'profile';
  v_title TEXT := 'Modifiche richieste al profilo';
  v_msg TEXT;
BEGIN
  IF NOT public.is_active_admin() THEN RAISE EXCEPTION 'Accesso negato'; END IF;

  v_msg := COALESCE(NULLIF(trim(p_message), ''), NULLIF(trim(p_preset), ''), 'Sono necessarie delle modifiche al tuo profilo.');

  IF p_areas IS NOT NULL AND array_length(p_areas, 1) > 0 THEN
    IF 'services' = ANY(p_areas) OR 'prices' = ANY(p_areas) THEN v_target_section := 'services';
    ELSIF 'work_photos' = ANY(p_areas) THEN v_target_section := 'portfolio';
    ELSIF 'document_front' = ANY(p_areas) OR 'document_back' = ANY(p_areas) OR 'selfie' = ANY(p_areas) THEN v_target_section := 'documents';
    ELSIF 'zones' = ANY(p_areas) OR 'cities' = ANY(p_areas) THEN v_target_section := 'zones';
    ELSIF 'availability' = ANY(p_areas) THEN v_target_section := 'availability';
    ELSIF 'profile_photo' = ANY(p_areas) THEN v_target_section := 'profile';
    END IF;
  END IF;

  UPDATE public.professionals
  SET verification_status = 'changes_requested',
      verification_rejected_reason = v_msg,
      updated_at = now()
  WHERE id = p_professional_id;

  PERFORM public.create_professional_notification(
    p_professional_id,
    'verification_changes_requested',
    v_title,
    v_msg,
    v_target_section,
    'change_request',
    p_professional_id
  );

  PERFORM public.add_admin_audit_log(
    'request_professional_changes', 'professional', p_professional_id,
    jsonb_build_object('areas', p_areas, 'message', v_msg, 'preset', p_preset, 'target_section', v_target_section)
  );
END;
$$;

-- Hook: professionista invia correzione
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

  PERFORM public.sync_professional_client_visibility(v_notif.professional_id);

  RETURN v_response_id;
END;
$$;

-- Hook: admin approva/rifiuta risposta
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

  PERFORM public.sync_professional_client_visibility(v_row.professional_id);

  PERFORM public.add_admin_audit_log(
    'review_change_response', 'professional', v_row.professional_id,
    jsonb_build_object('response_id', p_response_id, 'status', p_status)
  );
END;
$$;
