-- Listing pubblico: solo professionisti verificati (cliente fidati-app).
-- I professionisti vedono sempre il proprio profilo via policy professionals_select_own.

DROP POLICY IF EXISTS "public_read_professionals_listing" ON public.professionals;

CREATE POLICY "public_read_professionals_listing"
  ON public.professionals
  FOR SELECT
  USING (verification_status = 'verified' OR verified = true);

-- Pro app in attesa di verifica non devono risultare "verified" nel listing legacy.
UPDATE public.professionals
SET verified = false
WHERE has_pro_app = true
  AND verification_status IS DISTINCT FROM 'verified'
  AND verified = true;
