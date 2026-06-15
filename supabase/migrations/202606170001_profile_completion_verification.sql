-- Completamento profilo Fidati Pro: verifica identità, portfolio lavori, price_max servizi, storage

-- ---------------------------------------------------------------------------
-- professionals: stato verifica dedicato
-- ---------------------------------------------------------------------------
ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'pending_review', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS verification_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_rejected_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_professionals_verification_status
  ON public.professionals (verification_status);

-- ---------------------------------------------------------------------------
-- professional_services: price_max + is_custom
-- ---------------------------------------------------------------------------
ALTER TABLE public.professional_services
  ADD COLUMN IF NOT EXISTS price_max NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS is_custom BOOLEAN NOT NULL DEFAULT false;

-- ---------------------------------------------------------------------------
-- Documenti verifica (privati, solo professionista + admin)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.professional_verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('id_card', 'driving_license', 'passport')),
  front_image_url TEXT,
  back_image_url TEXT,
  selfie_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'uploaded'
    CHECK (status IN ('uploaded', 'pending_review', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (professional_id)
);

CREATE INDEX IF NOT EXISTS idx_prof_verification_docs_professional
  ON public.professional_verification_documents (professional_id);

ALTER TABLE public.professional_verification_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pro_read_own_verification_documents" ON public.professional_verification_documents;
CREATE POLICY "pro_read_own_verification_documents"
  ON public.professional_verification_documents
  FOR SELECT
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "pro_insert_own_verification_documents" ON public.professional_verification_documents;
CREATE POLICY "pro_insert_own_verification_documents"
  ON public.professional_verification_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    professional_id IN (
      SELECT id FROM public.professionals WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "pro_update_own_verification_documents" ON public.professional_verification_documents;
CREATE POLICY "pro_update_own_verification_documents"
  ON public.professional_verification_documents
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

-- ---------------------------------------------------------------------------
-- Foto lavori (semplificata, max 6 per professionista via app)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.professional_work_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prof_work_photos_professional
  ON public.professional_work_photos (professional_id, sort_order);

ALTER TABLE public.professional_work_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_work_photos" ON public.professional_work_photos;
CREATE POLICY "public_read_work_photos"
  ON public.professional_work_photos
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "pro_manage_own_work_photos" ON public.professional_work_photos;
CREATE POLICY "pro_manage_own_work_photos"
  ON public.professional_work_photos
  FOR ALL
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

-- professionals: professionista aggiorna verification_status (non può impostare verified)
-- La policy generica professionals_update_own (migration 202606130001) copre già l'UPDATE.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('professional-profile-photos', 'professional-profile-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('professional-documents', 'professional-documents', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('professional-portfolio', 'professional-portfolio', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Profile photos: public read, pro write own folder
DROP POLICY IF EXISTS "pro_upload_profile_photo" ON storage.objects;
CREATE POLICY "pro_upload_profile_photo"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'professional-profile-photos'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.professionals WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "pro_update_profile_photo" ON storage.objects;
CREATE POLICY "pro_update_profile_photo"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'professional-profile-photos'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.professionals WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "public_read_profile_photos" ON storage.objects;
CREATE POLICY "public_read_profile_photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'professional-profile-photos');

-- Documents: private, pro only
DROP POLICY IF EXISTS "pro_manage_documents" ON storage.objects;
CREATE POLICY "pro_manage_documents"
  ON storage.objects FOR ALL TO authenticated
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

-- Portfolio: public read, pro write
DROP POLICY IF EXISTS "pro_upload_portfolio" ON storage.objects;
CREATE POLICY "pro_upload_portfolio"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'professional-portfolio'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.professionals WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "pro_delete_portfolio" ON storage.objects;
CREATE POLICY "pro_delete_portfolio"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'professional-portfolio'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM public.professionals WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "public_read_portfolio" ON storage.objects;
CREATE POLICY "public_read_portfolio"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'professional-portfolio');
