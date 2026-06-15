-- Sicurezza richieste modifica: field_key, sync disponibilità, review/approve robusti

ALTER TABLE public.professional_internal_notifications
  ADD COLUMN IF NOT EXISTS field_key TEXT,
  ADD COLUMN IF NOT EXISTS reason TEXT;

ALTER TABLE public.professional_change_request_responses
  ADD COLUMN IF NOT EXISTS field_key TEXT;

CREATE INDEX IF NOT EXISTS idx_pro_notif_field_key
  ON public.professional_internal_notifications (field_key)
  WHERE field_key IS NOT NULL;

-- Sincronizza visibilità + forza non disponibile quando nascosto
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
      updated_at = now(),
      available_today = CASE WHEN v_new_status = 'visible' THEN available_today ELSE false END
    WHERE id = p_professional_id;

    IF v_new_status = 'visible'
       AND v_current IN ('hidden_changes', 'pending_review') THEN
      INSERT INTO public.professional_internal_notifications (
        professional_id, type, title, message, target_section, status
      ) VALUES (
        p_professional_id,
        'general',
        'Modifiche accettate',
        'Le tue modifiche sono state accettate. Il profilo è di nuovo visibile ai clienti.',
        'profile',
        'unread'
      );
    END IF;
  ELSIF v_new_status <> 'visible' THEN
    UPDATE public.professionals
    SET available_today = false, updated_at = now()
    WHERE id = p_professional_id AND available_today = true;
  END IF;

  RETURN v_new_status;
END;
$$;

DROP FUNCTION IF EXISTS public.create_professional_notification(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, UUID);

CREATE OR REPLACE FUNCTION public.create_professional_notification(
  p_professional_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_target_section TEXT DEFAULT 'profile',
  p_related_entity_type TEXT DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL,
  p_field_key TEXT DEFAULT NULL,
  p_reason TEXT DEFAULT NULL
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
    related_entity_type, related_entity_id, status, field_key, reason
  ) VALUES (
    p_professional_id, p_type, p_title, COALESCE(p_message, ''),
    COALESCE(p_target_section, 'profile'),
    p_related_entity_type, p_related_entity_id, 'unread',
    NULLIF(trim(p_field_key), ''),
    NULLIF(trim(p_reason), '')
  ) RETURNING id INTO v_id;

  IF p_type IN (
    'verification_changes_requested',
    'service_change_requested',
    'portfolio_change_requested',
    'document_change_requested'
  ) THEN
    UPDATE public.professionals
    SET verification_status = 'changes_requested', updated_at = now()
    WHERE id = p_professional_id;

    PERFORM public.sync_professional_client_visibility(p_professional_id);

    INSERT INTO public.professional_internal_notifications (
      professional_id, type, title, message, target_section, status
    ) VALUES (
      p_professional_id,
      'general',
      'Modifica richiesta',
      COALESCE(NULLIF(trim(p_reason), ''), 'L''admin ha richiesto una modifica al tuo profilo.'),
      COALESCE(p_target_section, 'profile'),
      'unread'
    );
  END IF;

  PERFORM public.add_admin_audit_log(
    'create_pro_notification', 'professional', p_professional_id,
    jsonb_build_object(
      'notification_id', v_id, 'type', p_type,
      'target_section', p_target_section, 'title', p_title,
      'field_key', p_field_key
    )
  );

  RETURN v_id;
END;
$$;

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
  v_field_key TEXT := NULL;
  v_related_type TEXT := 'change_request';
  v_related_id UUID := p_professional_id;
BEGIN
  IF NOT public.is_active_admin() THEN RAISE EXCEPTION 'Accesso negato'; END IF;

  v_msg := COALESCE(NULLIF(trim(p_message), ''), NULLIF(trim(p_preset), ''), 'Sono necessarie delle modifiche al tuo profilo.');

  IF p_areas IS NOT NULL AND array_length(p_areas, 1) > 0 THEN
    v_field_key := p_areas[1];
    IF 'services' = ANY(p_areas) OR 'prices' = ANY(p_areas) THEN
      v_target_section := 'services';
      v_field_key := COALESCE(v_field_key, 'service_price');
    ELSIF 'work_photos' = ANY(p_areas) THEN
      v_target_section := 'portfolio';
      v_field_key := COALESCE(v_field_key, 'portfolio_photo');
    ELSIF 'document_front' = ANY(p_areas) THEN
      v_target_section := 'documents';
      v_field_key := 'document_front';
    ELSIF 'document_back' = ANY(p_areas) THEN
      v_target_section := 'documents';
      v_field_key := 'document_back';
    ELSIF 'selfie' = ANY(p_areas) THEN
      v_target_section := 'documents';
      v_field_key := 'selfie';
    ELSIF 'zones' = ANY(p_areas) OR 'cities' = ANY(p_areas) THEN
      v_target_section := 'zones';
      v_field_key := COALESCE(v_field_key, 'zones');
    ELSIF 'availability' = ANY(p_areas) THEN
      v_target_section := 'availability';
      v_field_key := COALESCE(v_field_key, 'availability');
    ELSIF 'urgent_jobs' = ANY(p_areas) THEN
      v_target_section := 'availability';
      v_field_key := COALESCE(v_field_key, 'urgent_jobs');
    ELSIF 'profile_photo' = ANY(p_areas) THEN
      v_target_section := 'profile';
      v_field_key := COALESCE(v_field_key, 'profile_photo');
    ELSIF 'profile_data' = ANY(p_areas) THEN
      v_target_section := 'profile';
      v_field_key := COALESCE(v_field_key, 'profile_data');
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
    v_related_type,
    v_related_id,
    v_field_key,
    v_msg
  );

  PERFORM public.add_admin_audit_log(
    'request_professional_changes', 'professional', p_professional_id,
    jsonb_build_object('areas', p_areas, 'message', v_msg, 'preset', p_preset, 'target_section', v_target_section, 'field_key', v_field_key)
  );
END;
$$;

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

  IF v_notif.status = 'correction_submitted' THEN
    RAISE EXCEPTION 'Correzione già inviata per questa richiesta';
  END IF;

  SELECT id INTO v_pro_id FROM public.professionals
  WHERE id = v_notif.professional_id AND auth_user_id = auth.uid();

  IF v_pro_id IS NULL AND NOT public.is_active_admin() THEN
    RAISE EXCEPTION 'Accesso negato';
  END IF;

  INSERT INTO public.professional_change_request_responses (
    professional_id, notification_id, request_type, area,
    response_type, message, old_value, new_value, attachment_url, status, field_key
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
    'submitted',
    v_notif.field_key
  ) RETURNING id INTO v_response_id;

  UPDATE public.professional_internal_notifications
  SET status = 'correction_submitted'
  WHERE id = p_notification_id;

  PERFORM public.sync_professional_client_visibility(v_notif.professional_id);

  INSERT INTO public.professional_internal_notifications (
    professional_id, type, title, message, target_section, status
  ) VALUES (
    v_notif.professional_id,
    'general',
    'Correzione inviata',
    'Abbiamo ricevuto la tua correzione. La ricontrolliamo al più presto.',
    v_notif.target_section,
    'unread'
  );

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

  IF p_status = 'accepted' AND p_resolve_notification THEN
    UPDATE public.professional_internal_notifications
    SET status = 'resolved'
    WHERE id = v_row.notification_id;
  ELSIF p_status = 'rejected' THEN
    UPDATE public.professional_internal_notifications
    SET status = 'unread'
    WHERE id = v_row.notification_id;

    INSERT INTO public.professional_internal_notifications (
      professional_id, type, title, message, target_section, status
    )
    SELECT
      n.professional_id,
      'general',
      'Modifica da rifare',
      'Abbiamo bisogno di un''altra modifica. Controlla i dettagli e invia di nuovo.',
      n.target_section,
      'unread'
    FROM public.professional_internal_notifications n
    WHERE n.id = v_row.notification_id;
  END IF;

  PERFORM public.sync_professional_client_visibility(v_row.professional_id);

  PERFORM public.add_admin_audit_log(
    'review_change_response', 'professional', v_row.professional_id,
    jsonb_build_object('response_id', p_response_id, 'status', p_status)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_professional_verification(p_professional_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_open_changes INTEGER;
  v_doc RECORD;
  v_photo_count INTEGER;
  v_service_count INTEGER;
  v_has_availability BOOLEAN;
BEGIN
  IF NOT public.is_active_admin() THEN
    RAISE EXCEPTION 'Accesso negato';
  END IF;

  SELECT COUNT(*) INTO v_open_changes
  FROM public.professional_internal_notifications
  WHERE professional_id = p_professional_id
    AND type IN (
      'verification_changes_requested',
      'service_change_requested',
      'portfolio_change_requested',
      'document_change_requested'
    )
    AND status <> 'resolved';

  IF v_open_changes > 0 THEN
    RAISE EXCEPTION 'Richieste di modifica ancora aperte: risolvi tutte le richieste prima di approvare la verifica';
  END IF;

  SELECT * INTO v_doc
  FROM public.professional_verification_documents
  WHERE professional_id = p_professional_id
  LIMIT 1;

  IF NOT FOUND OR v_doc.front_image_url IS NULL OR trim(v_doc.front_image_url) = '' THEN
    RAISE EXCEPTION 'Documento fronte mancante';
  END IF;

  IF v_doc.document_type <> 'passport' AND (v_doc.back_image_url IS NULL OR trim(v_doc.back_image_url) = '') THEN
    RAISE EXCEPTION 'Documento retro mancante';
  END IF;

  IF v_doc.selfie_image_url IS NULL OR trim(v_doc.selfie_image_url) = '' THEN
    RAISE EXCEPTION 'Selfie di verifica mancante';
  END IF;

  SELECT COUNT(*) INTO v_photo_count
  FROM public.professional_work_photos
  WHERE professional_id = p_professional_id;

  IF v_photo_count < 1 THEN
    RAISE EXCEPTION 'Almeno una foto lavori richiesta nel portfolio';
  END IF;

  SELECT COUNT(*) INTO v_service_count
  FROM public.professional_services
  WHERE professional_id = p_professional_id;

  IF v_service_count < 1 THEN
    RAISE EXCEPTION 'Almeno un servizio richiesto';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.professional_availability
    WHERE professional_id = p_professional_id AND is_available = true
  ) INTO v_has_availability;

  IF NOT v_has_availability THEN
    RAISE EXCEPTION 'Disponibilità settimanale mancante';
  END IF;

  UPDATE public.professionals
  SET
    verification_status = 'verified',
    verified = true,
    account_status = 'verified',
    verification_rejected_reason = NULL,
    updated_at = now()
  WHERE id = p_professional_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Professionista non trovato';
  END IF;

  PERFORM public.sync_professional_client_visibility(p_professional_id);

  PERFORM public.create_professional_notification(
    p_professional_id,
    'verification_approved',
    'Verifica ottenuta',
    'Hai ricevuto il badge di verifica Fidati. Da ora i clienti della tua zona possono trovarti.',
    'profile',
    NULL,
    NULL,
    NULL,
    NULL
  );

  PERFORM public.add_admin_audit_log(
    'approve_verification',
    'professional',
    p_professional_id,
    '{}'::jsonb
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_professional_notification(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT) TO authenticated;
