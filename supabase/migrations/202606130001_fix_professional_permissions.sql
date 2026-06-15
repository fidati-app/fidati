-- fidati-pro: GRANT + RLS per flusso registrazione/login professionista
-- Risolve "permission denied" su professional_services e allinea policy own-row.

-- =============================================================================
-- 1. professionals
-- =============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.professionals TO authenticated;

ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "professionals_select_own" ON public.professionals;
CREATE POLICY "professionals_select_own"
  ON public.professionals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "professionals_insert_own" ON public.professionals;
CREATE POLICY "professionals_insert_own"
  ON public.professionals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "professionals_update_own" ON public.professionals;
CREATE POLICY "professionals_update_own"
  ON public.professionals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- =============================================================================
-- 2. service_categories
-- =============================================================================

GRANT SELECT ON public.service_categories TO anon, authenticated;

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_service_categories" ON public.service_categories;
CREATE POLICY "public_read_service_categories"
  ON public.service_categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- =============================================================================
-- 3. professional_zones
-- =============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.professional_zones TO authenticated;

ALTER TABLE public.professional_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "professionals_select_own_zones" ON public.professional_zones;
CREATE POLICY "professionals_select_own_zones"
  ON public.professional_zones
  FOR SELECT
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "professionals_insert_own_zones" ON public.professional_zones;
CREATE POLICY "professionals_insert_own_zones"
  ON public.professional_zones
  FOR INSERT
  TO authenticated
  WITH CHECK (
    professional_id IN (
      SELECT id FROM public.professionals WHERE auth_user_id = auth.uid()
    )
  );

-- =============================================================================
-- 4. professional_services
-- =============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.professional_services TO authenticated;

ALTER TABLE public.professional_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "professionals_select_own_services" ON public.professional_services;
CREATE POLICY "professionals_select_own_services"
  ON public.professional_services
  FOR SELECT
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "professionals_insert_own_services" ON public.professional_services;
CREATE POLICY "professionals_insert_own_services"
  ON public.professional_services
  FOR INSERT
  TO authenticated
  WITH CHECK (
    professional_id IN (
      SELECT id FROM public.professionals WHERE auth_user_id = auth.uid()
    )
  );
