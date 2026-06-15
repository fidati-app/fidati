-- Autocomplete comuni anche in registrazione (utente anon) + ricerca prefix migliorata

CREATE OR REPLACE FUNCTION public.search_city_catalog(p_query TEXT, p_limit INTEGER DEFAULT 15)
RETURNS TABLE (
  id UUID,
  name TEXT,
  province TEXT,
  region TEXT,
  istat_code TEXT,
  slug TEXT,
  label TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH q AS (
    SELECT lower(trim(coalesce(p_query, ''))) AS term
  )
  SELECT
    c.id,
    c.name,
    c.province,
    c.region,
    c.istat_code,
    c.slug,
    c.name || COALESCE(' (' || c.province || ')', '') AS label
  FROM public.city_catalog c
  CROSS JOIN q
  WHERE c.is_active = true
    AND (
      q.term = '' OR
      lower(c.name) LIKE q.term || '%' OR
      lower(c.name) LIKE '%' || q.term || '%' OR
      lower(coalesce(c.province, '')) LIKE q.term || '%'
    )
  ORDER BY
    CASE WHEN lower(c.name) = q.term THEN 0 ELSE 1 END,
    CASE WHEN lower(c.name) LIKE q.term || '%' THEN 0 ELSE 1 END,
    length(c.name),
    c.name
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 15), 50));
$$;

REVOKE ALL ON FUNCTION public.search_city_catalog(TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_city_catalog(TEXT, INTEGER) TO anon, authenticated;

DROP POLICY IF EXISTS "anon_read_city_catalog" ON public.city_catalog;
CREATE POLICY "anon_read_city_catalog"
  ON public.city_catalog FOR SELECT TO anon
  USING (is_active = true);
