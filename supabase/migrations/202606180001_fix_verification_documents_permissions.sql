-- Fix: GRANT tabella documenti verifica + policy Storage professional-documents

GRANT SELECT, INSERT, UPDATE, DELETE ON public.professional_verification_documents TO authenticated;

-- Storage: policy separate (FOR ALL può non coprire INSERT/UPDATE su alcuni progetti Supabase)
DROP POLICY IF EXISTS "pro_manage_documents" ON storage.objects;

DROP POLICY IF EXISTS "pro_documents_insert" ON storage.objects;
CREATE POLICY "pro_documents_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'professional-documents'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.professionals WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "pro_documents_update" ON storage.objects;
CREATE POLICY "pro_documents_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'professional-documents'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.professionals WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'professional-documents'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.professionals WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "pro_documents_select" ON storage.objects;
CREATE POLICY "pro_documents_select"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'professional-documents'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.professionals WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "pro_documents_delete" ON storage.objects;
CREATE POLICY "pro_documents_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'professional-documents'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.professionals WHERE auth_user_id = auth.uid()
    )
  );

-- Assicura bucket private con MIME consentiti
UPDATE storage.buckets
SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'professional-documents';
