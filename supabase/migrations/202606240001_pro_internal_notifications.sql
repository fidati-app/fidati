-- Notifiche interne professionista (Fidati Pro) + richieste modifica admin

CREATE TABLE IF NOT EXISTS public.professional_internal_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'verification_approved',
    'verification_rejected',
    'verification_changes_requested',
    'service_change_requested',
    'portfolio_change_requested',
    'document_change_requested',
    'account_banned',
    'account_suspended',
    'general'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  target_section TEXT NOT NULL DEFAULT 'profile',
  related_entity_type TEXT,
  related_entity_id UUID,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_pro_internal_notif_pro ON public.professional_internal_notifications(professional_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pro_internal_notif_unread ON public.professional_internal_notifications(professional_id) WHERE status = 'unread';

ALTER TABLE public.professional_internal_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_manage_pro_notifications" ON public.professional_internal_notifications;
CREATE POLICY "admin_manage_pro_notifications"
  ON public.professional_internal_notifications FOR ALL TO authenticated
  USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "pro_read_own_notifications" ON public.professional_internal_notifications;
CREATE POLICY "pro_read_own_notifications"
  ON public.professional_internal_notifications FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.professionals p
      WHERE p.id = professional_id AND p.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "pro_update_own_notifications" ON public.professional_internal_notifications;
CREATE POLICY "pro_update_own_notifications"
  ON public.professional_internal_notifications FOR UPDATE TO authenticated
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

GRANT SELECT, INSERT, UPDATE ON public.professional_internal_notifications TO authenticated;

-- Crea notifica interna + audit (admin)
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

-- Richiesta modifica strutturata (verifica o sezione profilo)
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

GRANT EXECUTE ON FUNCTION public.create_professional_notification(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_professional_changes(UUID, TEXT[], TEXT, TEXT) TO authenticated;

-- Aggiorna approve/reject/ban per inviare notifiche
CREATE OR REPLACE FUNCTION public.approve_professional_verification(p_professional_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_active_admin() THEN RAISE EXCEPTION 'Accesso negato'; END IF;

  UPDATE public.professionals
  SET verification_status = 'verified', verified = true,
      account_status = 'active', verification_rejected_reason = NULL, updated_at = now()
  WHERE id = p_professional_id;

  PERFORM public.create_professional_notification(
    p_professional_id, 'verification_approved',
    'Verifica approvata',
    'La tua verifica è stata approvata. Ora sei visibile su Fidati.',
    'profile', NULL, NULL
  );

  PERFORM public.add_admin_audit_log('approve_verification', 'professional', p_professional_id, '{}'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_professional_verification(
  p_professional_id UUID,
  p_reason TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_active_admin() THEN RAISE EXCEPTION 'Accesso negato'; END IF;

  UPDATE public.professionals
  SET verification_status = 'rejected', verified = false,
      verification_rejected_reason = NULLIF(trim(p_reason), ''), updated_at = now()
  WHERE id = p_professional_id;

  PERFORM public.create_professional_notification(
    p_professional_id, 'verification_rejected',
    'Verifica rifiutata',
    COALESCE(NULLIF(trim(p_reason), ''), 'La tua richiesta di verifica è stata rifiutata.'),
    'documents', NULL, NULL
  );

  PERFORM public.add_admin_audit_log(
    'reject_verification', 'professional', p_professional_id,
    jsonb_build_object('reason', p_reason)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.ban_professional(p_professional_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_active_admin() THEN RAISE EXCEPTION 'Accesso negato'; END IF;

  UPDATE public.professionals
  SET account_status = 'banned', verified = false,
      verification_status = 'rejected',
      verification_rejected_reason = COALESCE(NULLIF(trim(p_reason), ''), verification_rejected_reason),
      updated_at = now()
  WHERE id = p_professional_id;

  PERFORM public.create_professional_notification(
    p_professional_id, 'account_banned',
    'Account sospeso',
    COALESCE(NULLIF(trim(p_reason), ''), 'Il tuo account professionista è stato sospeso.'),
    'profile', NULL, NULL
  );

  PERFORM public.add_admin_audit_log(
    'ban_professional', 'professional', p_professional_id,
    jsonb_build_object('reason', p_reason)
  );
END;
$$;
