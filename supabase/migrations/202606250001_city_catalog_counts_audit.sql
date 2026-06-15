-- Catalogo comuni esteso + conteggi categorie reali + ricerca comuni

-- Estendi city_catalog
ALTER TABLE public.city_catalog
  ADD COLUMN IF NOT EXISTS istat_code TEXT,
  ADD COLUMN IF NOT EXISTS slug TEXT;

-- Slug helper per righe esistenti
UPDATE public.city_catalog
SET slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'))
WHERE slug IS NULL OR slug = '';

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_city_catalog_name_lower ON public.city_catalog (lower(name));
CREATE INDEX IF NOT EXISTS idx_city_catalog_name_trgm ON public.city_catalog USING gin (name gin_trgm_ops);

CREATE UNIQUE INDEX IF NOT EXISTS idx_city_catalog_istat_unique ON public.city_catalog(istat_code) WHERE istat_code IS NOT NULL;

-- Conteggio professionisti REALE per categoria (DISTINCT id)
CREATE OR REPLACE FUNCTION public.sync_service_category_counts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.service_categories sc
  SET professional_count = COALESCE(sub.cnt, 0)
  FROM (
    SELECT category_id, COUNT(DISTINCT id)::integer AS cnt
    FROM public.professionals
    WHERE category_id IS NOT NULL
    GROUP BY category_id
  ) sub
  WHERE sc.id = sub.category_id;

  UPDATE public.service_categories
  SET professional_count = 0
  WHERE id NOT IN (
    SELECT DISTINCT category_id FROM public.professionals WHERE category_id IS NOT NULL
  );
END;
$$;

SELECT public.sync_service_category_counts();

-- Ricerca comuni per autocomplete (tutti gli utenti autenticati)
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
  SELECT
    c.id,
    c.name,
    c.province,
    c.region,
    c.istat_code,
    c.slug,
    c.name || COALESCE(' (' || c.province || ')', '') AS label
  FROM public.city_catalog c
  WHERE c.is_active = true
    AND (
      p_query IS NULL OR trim(p_query) = '' OR
      c.name ILIKE trim(p_query) || '%' OR
      c.name ILIKE '%' || trim(p_query) || '%' OR
      c.province ILIKE trim(p_query) || '%'
    )
  ORDER BY
    CASE WHEN c.name ILIKE trim(p_query) || '%' THEN 0 ELSE 1 END,
    length(c.name),
    c.name
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 15), 50));
$$;

GRANT EXECUTE ON FUNCTION public.sync_service_category_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_city_catalog(TEXT, INTEGER) TO authenticated;

-- Lettura catalogo comuni per app/pro (autocomplete)
DROP POLICY IF EXISTS "public_read_city_catalog" ON public.city_catalog;
CREATE POLICY "public_read_city_catalog"
  ON public.city_catalog FOR SELECT TO authenticated
  USING (is_active = true);
