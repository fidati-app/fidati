-- Notifica informativa quando il profilo torna visibile ai clienti (nessun impatto sulla logica visibility)

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
  END IF;

  RETURN v_new_status;
END;
$$;
