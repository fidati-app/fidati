-- Fix approvazione verifica: account_status enum valido + visibilità clienti + notifica pro

CREATE OR REPLACE FUNCTION public.approve_professional_verification(p_professional_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_active_admin() THEN
    RAISE EXCEPTION 'Accesso negato';
  END IF;

  UPDATE public.professionals
  SET
    verification_status = 'verified',
    verified = true,
    account_status = 'verified',
    verification_rejected_reason = NULL,
    client_visibility_status = 'visible',
    client_visibility_reason = NULL,
    client_visibility_changed_at = now(),
    updated_at = now()
  WHERE id = p_professional_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Professionista non trovato';
  END IF;

  PERFORM public.create_professional_notification(
    p_professional_id,
    'verification_approved',
    'Verifica ottenuta',
    'Hai ricevuto il badge di verifica Fidati. Da ora i clienti della tua zona possono trovarti.',
    'profile',
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

GRANT EXECUTE ON FUNCTION public.approve_professional_verification(UUID) TO authenticated;
