-- Fix lettura/scrittura completamento profilo: GRANT + RLS own-row via professionals

GRANT USAGE ON SCHEMA public TO authenticated;

-- =============================================================================
-- 1. professional_verification_documents
-- =============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.professional_verification_documents TO authenticated;

ALTER TABLE public.professional_verification_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pro_read_own_verification_documents" ON public.professional_verification_documents;
DROP POLICY IF EXISTS "pro_insert_own_verification_documents" ON public.professional_verification_documents;
DROP POLICY IF EXISTS "pro_update_own_verification_documents" ON public.professional_verification_documents;
DROP POLICY IF EXISTS "pro_delete_own_verification_documents" ON public.professional_verification_documents;
DROP POLICY IF EXISTS "pro_select_own_verification_documents" ON public.professional_verification_documents;

CREATE POLICY "pro_select_own_verification_documents"
  ON public.professional_verification_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.professionals p
      WHERE p.id = professional_verification_documents.professional_id
        AND p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "pro_insert_own_verification_documents"
  ON public.professional_verification_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.professionals p
      WHERE p.id = professional_verification_documents.professional_id
        AND p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "pro_update_own_verification_documents"
  ON public.professional_verification_documents
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.professionals p
      WHERE p.id = professional_verification_documents.professional_id
        AND p.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.professionals p
      WHERE p.id = professional_verification_documents.professional_id
        AND p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "pro_delete_own_verification_documents"
  ON public.professional_verification_documents
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.professionals p
      WHERE p.id = professional_verification_documents.professional_id
        AND p.auth_user_id = auth.uid()
    )
  );

-- =============================================================================
-- 2. professional_work_photos
-- =============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.professional_work_photos TO authenticated;

ALTER TABLE public.professional_work_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_work_photos" ON public.professional_work_photos;
DROP POLICY IF EXISTS "pro_manage_own_work_photos" ON public.professional_work_photos;
DROP POLICY IF EXISTS "pro_select_own_work_photos" ON public.professional_work_photos;
DROP POLICY IF EXISTS "pro_insert_own_work_photos" ON public.professional_work_photos;
DROP POLICY IF EXISTS "pro_update_own_work_photos" ON public.professional_work_photos;
DROP POLICY IF EXISTS "pro_delete_own_work_photos" ON public.professional_work_photos;

CREATE POLICY "pro_select_own_work_photos"
  ON public.professional_work_photos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.professionals p
      WHERE p.id = professional_work_photos.professional_id
        AND p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "pro_insert_own_work_photos"
  ON public.professional_work_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.professionals p
      WHERE p.id = professional_work_photos.professional_id
        AND p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "pro_update_own_work_photos"
  ON public.professional_work_photos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.professionals p
      WHERE p.id = professional_work_photos.professional_id
        AND p.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.professionals p
      WHERE p.id = professional_work_photos.professional_id
        AND p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "pro_delete_own_work_photos"
  ON public.professional_work_photos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.professionals p
      WHERE p.id = professional_work_photos.professional_id
        AND p.auth_user_id = auth.uid()
    )
  );
