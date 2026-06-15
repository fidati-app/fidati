-- Registrazione pro: anagrafica, preventivo su richiesta, check email esistente

ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS account_kind text NOT NULL DEFAULT 'individual'
    CHECK (account_kind IN ('individual', 'company')),
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS company_name text;

COMMENT ON COLUMN public.professionals.account_kind IS 'individual | company';
COMMENT ON COLUMN public.professionals.first_name IS 'Nome (professionista)';
COMMENT ON COLUMN public.professionals.last_name IS 'Cognome (professionista)';
COMMENT ON COLUMN public.professionals.company_name IS 'Ragione sociale / nome attività';

ALTER TABLE public.professional_services
  ADD COLUMN IF NOT EXISTS quote_required boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.professional_services.quote_required IS 'Se true: prezzo su preventivo, nessun listino pubblico';

CREATE OR REPLACE FUNCTION public.check_auth_email_registered(p_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE lower(email) = lower(trim(p_email))
  );
$$;

REVOKE ALL ON FUNCTION public.check_auth_email_registered(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_auth_email_registered(text) TO anon, authenticated;
