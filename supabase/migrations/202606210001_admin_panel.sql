-- Fidati Admin Panel: utenti staff, audit log, RPC verifica, policy RLS

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'account_status' AND e.enumlabel = 'banned'
  ) THEN
    ALTER TYPE public.account_status ADD VALUE 'banned';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
    CREATE TYPE public.admin_role AS ENUM (
      'super_admin',
      'review_team',
      'accounting_team',
      'support_team'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role public.admin_role NOT NULL DEFAULT 'review_team',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_auth ON public.admin_users(auth_user_id);

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created ON public.admin_audit_logs(created_at DESC);

CREATE TABLE IF NOT EXISTS public.admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE auth_user_id = auth.uid() AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.current_admin_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.admin_users
  WHERE auth_user_id = auth.uid() AND is_active = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.add_admin_audit_log(
  p_action TEXT,
  p_target_type TEXT,
  p_target_id UUID,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
  v_log_id UUID;
BEGIN
  v_admin_id := public.current_admin_id();
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Accesso negato: utente non admin';
  END IF;

  INSERT INTO public.admin_audit_logs (admin_id, action, target_type, target_id, metadata)
  VALUES (v_admin_id, p_action, p_target_type, p_target_id, COALESCE(p_metadata, '{}'::jsonb))
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

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
    updated_at = now()
  WHERE id = p_professional_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Professionista non trovato';
  END IF;

  UPDATE public.professional_verification_documents
  SET status = 'approved', updated_at = now()
  WHERE professional_id = p_professional_id;

  PERFORM public.add_admin_audit_log(
    'approve_verification',
    'professional',
    p_professional_id,
    jsonb_build_object('verification_status', 'verified')
  );
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
  IF NOT public.is_active_admin() THEN
    RAISE EXCEPTION 'Accesso negato';
  END IF;

  UPDATE public.professionals
  SET
    verification_status = 'rejected',
    verification_rejected_reason = NULLIF(trim(p_reason), ''),
    updated_at = now()
  WHERE id = p_professional_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Professionista non trovato';
  END IF;

  UPDATE public.professional_verification_documents
  SET status = 'rejected', updated_at = now()
  WHERE professional_id = p_professional_id;

  PERFORM public.add_admin_audit_log(
    'reject_verification',
    'professional',
    p_professional_id,
    jsonb_build_object('reason', p_reason)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.request_verification_changes(
  p_professional_id UUID,
  p_message TEXT
)
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
    verification_status = 'rejected',
    verification_rejected_reason = NULLIF(trim(p_message), ''),
    updated_at = now()
  WHERE id = p_professional_id;

  PERFORM public.add_admin_audit_log(
    'request_verification_changes',
    'professional',
    p_professional_id,
    jsonb_build_object('message', p_message)
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
  IF NOT public.is_active_admin() THEN
    RAISE EXCEPTION 'Accesso negato';
  END IF;

  UPDATE public.professionals
  SET
    account_status = 'banned',
    verified = false,
    updated_at = now()
  WHERE id = p_professional_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Professionista non trovato';
  END IF;

  PERFORM public.add_admin_audit_log(
    'ban_professional',
    'professional',
    p_professional_id,
    jsonb_build_object('reason', p_reason)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.unban_professional(p_professional_id UUID)
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
  SET account_status = 'unverified', updated_at = now()
  WHERE id = p_professional_id;

  PERFORM public.add_admin_audit_log(
    'unban_professional',
    'professional',
    p_professional_id,
    '{}'::jsonb
  );
END;
$$;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.admin_users TO authenticated;
GRANT SELECT ON public.admin_audit_logs TO authenticated;
GRANT SELECT, INSERT ON public.admin_notes TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_admin_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_admin_audit_log(TEXT, TEXT, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_professional_verification(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_professional_verification(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_verification_changes(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ban_professional(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unban_professional(UUID) TO authenticated;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_own_row" ON public.admin_users;
CREATE POLICY "admin_read_own_row"
  ON public.admin_users FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid() OR public.is_active_admin());

DROP POLICY IF EXISTS "admin_read_audit_logs" ON public.admin_audit_logs;
CREATE POLICY "admin_read_audit_logs"
  ON public.admin_audit_logs FOR SELECT TO authenticated
  USING (public.is_active_admin());

DROP POLICY IF EXISTS "admin_manage_notes" ON public.admin_notes;
CREATE POLICY "admin_manage_notes"
  ON public.admin_notes FOR ALL TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "admin_read_professionals" ON public.professionals;
CREATE POLICY "admin_read_professionals"
  ON public.professionals FOR SELECT TO authenticated
  USING (public.is_active_admin());

DROP POLICY IF EXISTS "admin_read_customers" ON public.customers;
CREATE POLICY "admin_read_customers"
  ON public.customers FOR SELECT TO authenticated
  USING (public.is_active_admin());

DROP POLICY IF EXISTS "admin_read_booking_requests" ON public.booking_requests;
CREATE POLICY "admin_read_booking_requests"
  ON public.booking_requests FOR SELECT TO authenticated
  USING (public.is_active_admin());

DROP POLICY IF EXISTS "admin_read_bookings" ON public.bookings;
CREATE POLICY "admin_read_bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (public.is_active_admin());

DROP POLICY IF EXISTS "admin_read_reports" ON public.reports;
CREATE POLICY "admin_read_reports"
  ON public.reports FOR SELECT TO authenticated
  USING (public.is_active_admin());

DROP POLICY IF EXISTS "admin_update_reports" ON public.reports;
CREATE POLICY "admin_update_reports"
  ON public.reports FOR UPDATE TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "admin_read_payments" ON public.payments;
CREATE POLICY "admin_read_payments"
  ON public.payments FOR SELECT TO authenticated
  USING (public.is_active_admin());

DROP POLICY IF EXISTS "admin_read_verification_documents" ON public.professional_verification_documents;
CREATE POLICY "admin_read_verification_documents"
  ON public.professional_verification_documents FOR SELECT TO authenticated
  USING (public.is_active_admin());

DROP POLICY IF EXISTS "admin_read_pro_zones" ON public.professional_zones;
CREATE POLICY "admin_read_pro_zones"
  ON public.professional_zones FOR SELECT TO authenticated
  USING (public.is_active_admin());

DROP POLICY IF EXISTS "admin_read_pro_services" ON public.professional_services;
CREATE POLICY "admin_read_pro_services"
  ON public.professional_services FOR SELECT TO authenticated
  USING (public.is_active_admin());

DROP POLICY IF EXISTS "admin_read_pro_availability" ON public.professional_availability;
CREATE POLICY "admin_read_pro_availability"
  ON public.professional_availability FOR SELECT TO authenticated
  USING (public.is_active_admin());

DROP POLICY IF EXISTS "admin_read_service_categories" ON public.service_categories;
CREATE POLICY "admin_read_service_categories"
  ON public.service_categories FOR SELECT TO authenticated
  USING (public.is_active_admin());

DROP POLICY IF EXISTS "admin_read_professional_documents_storage" ON storage.objects;
CREATE POLICY "admin_read_professional_documents_storage"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'professional-documents' AND public.is_active_admin());
