-- Split tecnici-caldaie-condizionatori into caldaie + condizionatori (13 categorie ufficiali)

UPDATE service_categories
SET slug = 'caldaie',
    name = 'Caldaie',
    icon = 'flame-outline',
    description = 'Installazione, manutenzione e assistenza caldaie.',
    sort_order = 8
WHERE slug = 'tecnici-caldaie-condizionatori';

INSERT INTO service_categories (id, legacy_id, slug, name, icon, description, professional_count, home_count, sort_order, image_url, is_active)
VALUES (
  'c1000001-0001-4000-8000-000000000013',
  '13',
  'condizionatori',
  'Condizionatori',
  'snow-outline',
  'Installazione, manutenzione e assistenza climatizzatori.',
  34,
  390,
  9,
  'https://qyptmczxkzxycsgqgesl.supabase.co/storage/v1/object/public/category-images/condizionatori.webp',
  true
)
ON CONFLICT (id) DO UPDATE SET
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

UPDATE service_categories SET sort_order = 10 WHERE slug = 'traslochi-sgomberi';
UPDATE service_categories SET sort_order = 11 WHERE slug = 'antennisti';
UPDATE service_categories SET sort_order = 12 WHERE slug = 'montaggio-mobili';
UPDATE service_categories SET sort_order = 13 WHERE slug = 'tende-da-sole';

UPDATE home_service_tiles SET category_slug = 'condizionatori' WHERE category_slug = 'tecnici-caldaie-condizionatori' AND legacy_id IN ('c9', 'a7');
UPDATE home_service_tiles SET category_slug = 'caldaie' WHERE category_slug = 'tecnici-caldaie-condizionatori' AND legacy_id = 'a10';

UPDATE professionals SET category_id = (SELECT id FROM service_categories WHERE slug = 'caldaie' LIMIT 1)
WHERE category_id = (SELECT id FROM service_categories WHERE slug = 'tecnici-caldaie-condizionatori' LIMIT 1);
