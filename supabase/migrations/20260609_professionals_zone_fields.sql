-- Zone fields on professionals for city / service area filtering (fidati-app)

ALTER TABLE professionals
  ADD COLUMN IF NOT EXISTS category_slug TEXT,
  ADD COLUMN IF NOT EXISTS base_city TEXT,
  ADD COLUMN IF NOT EXISTS service_areas TEXT[] NOT NULL DEFAULT ARRAY['Barletta']::TEXT[];

CREATE INDEX IF NOT EXISTS idx_professionals_category_slug ON professionals (category_slug);
CREATE INDEX IF NOT EXISTS idx_professionals_base_city ON professionals (base_city);
CREATE INDEX IF NOT EXISTS idx_professionals_service_areas ON professionals USING GIN (service_areas);

-- Backfill category_slug from service_categories
UPDATE professionals p
SET category_slug = c.slug
FROM service_categories c
WHERE p.category_id = c.id
  AND (p.category_slug IS NULL OR p.category_slug <> c.slug);

-- Sync professional_zones from service_areas where zones are still Milan-style
UPDATE professional_zones z
SET zone_name = unnested.area
FROM (
  SELECT p.id AS professional_id, unnest(p.service_areas) AS area, ordinality AS sort_order
  FROM professionals p
  CROSS JOIN LATERAL unnest(p.service_areas) WITH ORDINALITY AS u(area, ordinality)
  WHERE p.service_areas IS NOT NULL
    AND array_length(p.service_areas, 1) > 0
) unnested
WHERE z.professional_id = unnested.professional_id
  AND z.sort_order = unnested.sort_order
  AND z.zone_name IN ('Centro', 'Navigli', 'Brera', 'Porta Romana', 'Isola', 'Lambrate', 'Bicocca', 'Loreto');
