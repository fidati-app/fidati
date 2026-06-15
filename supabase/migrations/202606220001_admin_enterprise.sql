-- Fidati Admin Enterprise: permessi, settings, changes_requested, policy write, chat read

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'admin_role' AND e.enumlabel = 'operator'
  ) THEN
    ALTER TYPE public.admin_role ADD VALUE 'operator';
  END IF;
END $$;

-- verification_status: aggiungi changes_requested
ALTER TABLE public.professionals DROP CONSTRAINT IF EXISTS professionals_verification_status_check;
ALTER TABLE public.professionals
  ADD CONSTRAINT professionals_verification_status_check
  CHECK (verification_status IN ('unverified', 'pending_review', 'verified', 'rejected', 'changes_requested'));

-- Permessi granulari staff
CREATE TABLE IF NOT EXISTS public.admin_permissions (
  admin_user_id UUID NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (admin_user_id, permission)
);

CREATE INDEX IF NOT EXISTS idx_admin_permissions_user ON public.admin_permissions(admin_user_id);

-- Impostazioni piattaforma (key-value)
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.platform_settings (key, value) VALUES
  ('verification_rules', '{"min_work_photos":1,"max_work_photos":6,"require_document":true,"require_selfie":true}'::jsonb),
  ('commission_default', '{"percent":12,"min_eur":2,"max_eur":500}'::jsonb),
  ('urgent_jobs', '{"enabled":true}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Aggiorna RPC richiesta modifiche → changes_requested
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
  IF NOT public.is_active_admin() THEN RAISE EXCEPTION 'Accesso negato'; END IF;

  UPDATE public.professionals
  SET verification_status = 'changes_requested',
      verification_rejected_reason = NULLIF(trim(p_message), ''),
      updated_at = now()
  WHERE id = p_professional_id;

  PERFORM public.add_admin_audit_log(
    'request_verification_changes', 'professional', p_professional_id,
    jsonb_build_object('message', p_message)
  );
END;
$$;

-- Ban: anche verification_status rejected
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

  PERFORM public.add_admin_audit_log(
    'ban_professional', 'professional', p_professional_id,
    jsonb_build_object('reason', p_reason)
  );
END;
$$;

-- Collega admin da email auth esistente (super_admin)
CREATE OR REPLACE FUNCTION public.link_admin_by_email(
  p_email TEXT,
  p_full_name TEXT,
  p_role public.admin_role DEFAULT 'review_team'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_id UUID;
  v_admin_id UUID;
  v_is_super BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE auth_user_id = auth.uid() AND role = 'super_admin' AND is_active = true
  ) INTO v_is_super;
  IF NOT v_is_super THEN RAISE EXCEPTION 'Solo super_admin'; END IF;

  SELECT id INTO v_auth_id FROM auth.users WHERE lower(email) = lower(trim(p_email)) LIMIT 1;
  IF v_auth_id IS NULL THEN RAISE EXCEPTION 'Utente Auth non trovato per email %', p_email; END IF;

  INSERT INTO public.admin_users (auth_user_id, email, full_name, role, is_active)
  VALUES (v_auth_id, lower(trim(p_email)), COALESCE(NULLIF(trim(p_full_name), ''), p_email), p_role, true)
  ON CONFLICT (auth_user_id) DO UPDATE SET
    email = EXCLUDED.email, full_name = EXCLUDED.full_name, role = EXCLUDED.role,
    is_active = true, updated_at = now()
  RETURNING id INTO v_admin_id;

  PERFORM public.add_admin_audit_log(
    'link_admin', 'admin_user', v_admin_id,
    jsonb_build_object('email', p_email, 'role', p_role)
  );
  RETURN v_admin_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.link_admin_by_email(TEXT, TEXT, public.admin_role) TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.admin_permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.platform_settings TO authenticated;

ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super_admin_manage_permissions" ON public.admin_permissions;
CREATE POLICY "super_admin_manage_permissions"
  ON public.admin_permissions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND role = 'super_admin' AND is_active))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND role = 'super_admin' AND is_active));

DROP POLICY IF EXISTS "admin_read_permissions" ON public.admin_permissions;
CREATE POLICY "admin_read_permissions"
  ON public.admin_permissions FOR SELECT TO authenticated
  USING (public.is_active_admin());

DROP POLICY IF EXISTS "admin_read_settings" ON public.platform_settings;
CREATE POLICY "admin_read_settings"
  ON public.platform_settings FOR SELECT TO authenticated
  USING (public.is_active_admin());

DROP POLICY IF EXISTS "super_admin_update_settings" ON public.platform_settings;
CREATE POLICY "super_admin_update_settings"
  ON public.platform_settings FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND role = 'super_admin' AND is_active))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND role = 'super_admin' AND is_active));

-- Admin write su dati professionista
DROP POLICY IF EXISTS "admin_update_professionals" ON public.professionals;
CREATE POLICY "admin_update_professionals"
  ON public.professionals FOR UPDATE TO authenticated
  USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "admin_manage_pro_zones" ON public.professional_zones;
CREATE POLICY "admin_manage_pro_zones"
  ON public.professional_zones FOR ALL TO authenticated
  USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "admin_manage_pro_services" ON public.professional_services;
CREATE POLICY "admin_manage_pro_services"
  ON public.professional_services FOR ALL TO authenticated
  USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "admin_manage_pro_availability" ON public.professional_availability;
CREATE POLICY "admin_manage_pro_availability"
  ON public.professional_availability FOR ALL TO authenticated
  USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "admin_manage_work_photos" ON public.professional_work_photos;
CREATE POLICY "admin_manage_work_photos"
  ON public.professional_work_photos FOR ALL TO authenticated
  USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "admin_read_conversations" ON public.conversations;
CREATE POLICY "admin_read_conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (public.is_active_admin());

DROP POLICY IF EXISTS "admin_read_messages" ON public.messages;
CREATE POLICY "admin_read_messages"
  ON public.messages FOR SELECT TO authenticated
  USING (public.is_active_admin());

DROP POLICY IF EXISTS "admin_update_service_categories" ON public.service_categories;
CREATE POLICY "admin_update_service_categories"
  ON public.service_categories FOR ALL TO authenticated
  USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "admin_update_customers" ON public.customers;
CREATE POLICY "admin_update_customers"
  ON public.customers FOR UPDATE TO authenticated
  USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "admin_update_booking_requests" ON public.booking_requests;
CREATE POLICY "admin_update_booking_requests"
  ON public.booking_requests FOR UPDATE TO authenticated
  USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());

GRANT SELECT ON public.conversations TO authenticated;
GRANT SELECT ON public.messages TO authenticated;
GRANT UPDATE ON public.customers TO authenticated;
GRANT UPDATE ON public.booking_requests TO authenticated;
GRANT ALL ON public.professional_zones TO authenticated;
GRANT ALL ON public.professional_services TO authenticated;
GRANT ALL ON public.professional_availability TO authenticated;
GRANT ALL ON public.professional_work_photos TO authenticated;
GRANT UPDATE ON public.professionals TO authenticated;
GRANT ALL ON public.service_categories TO authenticated;
