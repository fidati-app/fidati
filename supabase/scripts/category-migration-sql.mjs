/**
 * SQL idempotente per sincronizzare service_categories v12.
 * Usato da generate-seed.mjs e migrations/20260609_categories_v12.sql
 */
import { OFFICIAL_CATEGORIES, categoryImageUrlForSeed } from './category-catalog.mjs';

function esc(s) {
  return `'${String(s).replace(/'/g, "''")}'`;
}

const CANONICAL_SLUG_ROWS = OFFICIAL_CATEGORIES.map(
  (c) => `      ('${c.uuid}'::uuid, '${c.slug}')`,
).join(',\n');

export const CATEGORY_MIGRATION_PREAMBLE = `-- service_categories v12 — preamble idempotente
ALTER TABLE service_categories
  ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE service_categories
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE service_categories
  DROP CONSTRAINT IF EXISTS service_categories_legacy_id_key;

-- Evita violazioni UNIQUE(legacy_id) durante l'upsert
UPDATE service_categories SET legacy_id = NULL;

-- Unifica righe duplicate per slug (mantiene UUID canonico del seed)
DO $$
DECLARE
  cat RECORD;
  dup RECORD;
BEGIN
  FOR cat IN
    SELECT * FROM (VALUES
${CANONICAL_SLUG_ROWS}
    ) AS t(canonical_id, slug)
  LOOP
    FOR dup IN
      SELECT id FROM service_categories
      WHERE slug = cat.slug AND id <> cat.canonical_id
    LOOP
      UPDATE services SET category_id = cat.canonical_id WHERE category_id = dup.id;
      UPDATE professionals SET category_id = cat.canonical_id WHERE category_id = dup.id;
      UPDATE home_popular_services SET category_id = cat.canonical_id WHERE category_id = dup.id;
      UPDATE home_offers SET category_id = cat.canonical_id WHERE category_id = dup.id;
      DELETE FROM service_categories WHERE id = dup.id;
    END LOOP;
  END LOOP;
END $$;

UPDATE service_categories SET is_active = false WHERE slug = 'tuttofare';
`;

export const CATEGORY_UPSERT_SUFFIX = `ON CONFLICT (id) DO UPDATE SET
  legacy_id = EXCLUDED.legacy_id,
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  professional_count = EXCLUDED.professional_count,
  home_count = EXCLUDED.home_count,
  sort_order = EXCLUDED.sort_order,
  image_url = EXCLUDED.image_url,
  is_active = EXCLUDED.is_active;
`;

export const CATEGORY_MIGRATION_POSTAMBLE = `-- Ripristina FK e slug legacy dopo upsert categorie v12
UPDATE professionals
SET category_id = (SELECT id FROM service_categories WHERE slug = 'montaggio-mobili' LIMIT 1),
    category_label = 'Montaggio mobili'
WHERE category_id IN (SELECT id FROM service_categories WHERE slug = 'tuttofare');

UPDATE home_service_tiles SET category_slug = 'montaggio-mobili' WHERE category_slug = 'tuttofare' AND legacy_id = 'c6';
UPDATE home_service_tiles SET category_slug = 'imbianchini' WHERE category_slug = 'tuttofare' AND legacy_id = 'c7';
UPDATE home_service_tiles SET category_slug = 'fabbri' WHERE category_slug = 'tuttofare' AND legacy_id = 'c8';
UPDATE home_service_tiles SET category_slug = 'traslochi-sgomberi' WHERE category_slug = 'tuttofare' AND legacy_id = 'c10';
UPDATE home_service_tiles SET category_slug = 'traslochi-sgomberi' WHERE category_slug = 'tuttofare' AND legacy_id = 'a8';
UPDATE home_service_tiles SET category_slug = 'pulizie' WHERE category_slug = 'tuttofare' AND legacy_id = 'a9';
UPDATE home_service_tiles SET category_slug = 'tecnici-caldaie-condizionatori' WHERE category_slug = 'tuttofare' AND legacy_id = 'a10';
`;

export function buildCategoryUpsertSql() {
  const rows = OFFICIAL_CATEGORIES.map(
    (c) =>
      `  ('${c.uuid}', '${c.legacyId}', '${c.slug}', ${esc(c.name)}, ${esc(c.icon)}, ${esc(c.description)}, ${c.professionalCount}, ${c.homeCount}, ${c.sortOrder}, ${esc(categoryImageUrlForSeed(c.slug))}, true)`,
  ).join(',\n');

  return `${CATEGORY_MIGRATION_PREAMBLE}
INSERT INTO service_categories (id, legacy_id, slug, name, icon, description, professional_count, home_count, sort_order, image_url, is_active) VALUES
${rows}
${CATEGORY_UPSERT_SUFFIX}
${CATEGORY_MIGRATION_POSTAMBLE}`;
}
