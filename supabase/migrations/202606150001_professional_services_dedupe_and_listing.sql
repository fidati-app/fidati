-- 1. service_slug + dedupe professional_services
-- 2. DELETE policies per sync pulito zone/servizi
-- 3. Listing pubblico: professionisti Fidati Pro visibili in fidati-app

ALTER TABLE public.professional_services
  ADD COLUMN IF NOT EXISTS service_slug TEXT;

UPDATE public.professional_services
SET service_slug = lower(
  regexp_replace(
    regexp_replace(trim(title), '[^a-zA-Z0-9]+', '-', 'g'),
    '^-+|-+$',
    '',
    'g'
  )
)
WHERE service_slug IS NULL;

UPDATE public.professional_services
SET service_slug = 'servizio-' || left(replace(id::text, '-', ''), 8)
WHERE service_slug IS NULL OR service_slug = '';

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY professional_id, service_slug
      ORDER BY created_at ASC, id ASC
    ) AS rn
  FROM public.professional_services
)
DELETE FROM public.professional_services ps
USING ranked r
WHERE ps.id = r.id
  AND r.rn > 1;

ALTER TABLE public.professional_services
  ALTER COLUMN service_slug SET NOT NULL;

ALTER TABLE public.professional_services
  DROP CONSTRAINT IF EXISTS professional_services_professional_slug_key;

ALTER TABLE public.professional_services
  ADD CONSTRAINT professional_services_professional_slug_key
  UNIQUE (professional_id, service_slug);

CREATE INDEX IF NOT EXISTS idx_professional_services_professional_slug
  ON public.professional_services (professional_id, service_slug);

-- DELETE own rows (sync onboarding + gestione zone/servizi)
DROP POLICY IF EXISTS "professionals_delete_own_zones" ON public.professional_zones;
CREATE POLICY "professionals_delete_own_zones"
  ON public.professional_zones
  FOR DELETE
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "professionals_delete_own_services" ON public.professional_services;
CREATE POLICY "professionals_delete_own_services"
  ON public.professional_services
  FOR DELETE
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE auth_user_id = auth.uid()
    )
  );

-- Professionisti Fidati Pro completi visibili ai clienti
UPDATE public.professionals
SET
  verified = true,
  account_status = 'verified'
WHERE has_pro_app = true
  AND verified = false;

DROP POLICY IF EXISTS "public_read_professionals_listing" ON public.professionals;
CREATE POLICY "public_read_professionals_listing"
  ON public.professionals
  FOR SELECT
  USING (verified = true OR has_pro_app = true);
