-- fidati-pro: consente ai professionisti autenticati di creare il proprio profilo e zone operative.

DROP POLICY IF EXISTS "professionals_insert_own" ON professionals;
CREATE POLICY "professionals_insert_own"
  ON professionals FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "professionals_manage_own_zones" ON professional_zones;
CREATE POLICY "professionals_manage_own_zones"
  ON professional_zones FOR ALL
  USING (
    professional_id IN (
      SELECT id FROM professionals WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    professional_id IN (
      SELECT id FROM professionals WHERE auth_user_id = auth.uid()
    )
  );
