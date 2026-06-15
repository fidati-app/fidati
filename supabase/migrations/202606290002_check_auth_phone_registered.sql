-- Verifica telefono già registrato (professionisti, clienti, auth)

CREATE OR REPLACE FUNCTION public.normalize_phone_digits(p_phone text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(regexp_replace(trim(coalesce(p_phone, '')), '[^0-9]', '', 'g'), '');
$$;

CREATE OR REPLACE FUNCTION public.check_auth_phone_registered(p_phone text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  WITH norm AS (
    SELECT public.normalize_phone_digits(p_phone) AS digits
  )
  SELECT EXISTS (
    SELECT 1
    FROM norm n
    WHERE n.digits IS NOT NULL
      AND length(n.digits) >= 8
      AND (
        EXISTS (
          SELECT 1
          FROM public.professionals p
          WHERE public.normalize_phone_digits(p.phone) = n.digits
        )
        OR EXISTS (
          SELECT 1
          FROM public.customers c
          WHERE public.normalize_phone_digits(c.phone) = n.digits
        )
        OR EXISTS (
          SELECT 1
          FROM auth.users u
          WHERE public.normalize_phone_digits(u.phone) = n.digits
        )
      )
  );
$$;

REVOKE ALL ON FUNCTION public.check_auth_phone_registered(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_auth_phone_registered(text) TO anon, authenticated;
