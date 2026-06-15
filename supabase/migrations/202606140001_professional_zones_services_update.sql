-- fidati-pro: UPDATE policies per sync onboarding (zones upsert + services update by title)

DROP POLICY IF EXISTS "professionals_update_own_zones" ON public.professional_zones;
CREATE POLICY "professionals_update_own_zones"
  ON public.professional_zones
  FOR UPDATE
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    professional_id IN (
      SELECT id FROM public.professionals WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "professionals_update_own_services" ON public.professional_services;
CREATE POLICY "professionals_update_own_services"
  ON public.professional_services
  FOR UPDATE
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    professional_id IN (
      SELECT id FROM public.professionals WHERE auth_user_id = auth.uid()
    )
  );
