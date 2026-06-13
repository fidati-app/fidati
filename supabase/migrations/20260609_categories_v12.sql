-- Categories v12: migration idempotente (eseguibile infinite volte)
-- Sincronizza le 12 categorie ufficiali Fidati su DB vuoti o già popolati.

-- service_categories v12 — preamble idempotente
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
      ('c1000001-0001-4000-8000-000000000003'::uuid, 'elettricisti'),
      ('c1000001-0001-4000-8000-000000000002'::uuid, 'idraulici'),
      ('c1000001-0001-4000-8000-000000000005'::uuid, 'fabbri'),
      ('c1000001-0001-4000-8000-000000000004'::uuid, 'giardinieri'),
      ('c1000001-0001-4000-8000-000000000001'::uuid, 'pulizie'),
      ('c1000001-0001-4000-8000-000000000006'::uuid, 'imbianchini'),
      ('c1000001-0001-4000-8000-000000000007'::uuid, 'serramentisti'),
      ('c1000001-0001-4000-8000-000000000008'::uuid, 'tecnici-caldaie-condizionatori'),
      ('c1000001-0001-4000-8000-000000000009'::uuid, 'traslochi-sgomberi'),
      ('c1000001-0001-4000-8000-000000000010'::uuid, 'antennisti'),
      ('c1000001-0001-4000-8000-000000000011'::uuid, 'montaggio-mobili'),
      ('c1000001-0001-4000-8000-000000000012'::uuid, 'tende-da-sole')
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

INSERT INTO service_categories (id, legacy_id, slug, name, icon, description, professional_count, home_count, sort_order, image_url, is_active) VALUES
  ('c1000001-0001-4000-8000-000000000003', '1', 'elettricisti', 'Elettricisti', 'flash-outline', 'Installazioni, riparazioni e pronto intervento elettrico.', 76, 1120, 1, 'https://qyptmczxkzxycsgqgesl.supabase.co/storage/v1/object/public/category-images/elettricisti.webp', true),
  ('c1000001-0001-4000-8000-000000000002', '2', 'idraulici', 'Idraulici', 'water-outline', 'Riparazioni, perdite e installazioni idrauliche.', 94, 860, 2, 'https://qyptmczxkzxycsgqgesl.supabase.co/storage/v1/object/public/category-images/idraulici.webp', true),
  ('c1000001-0001-4000-8000-000000000005', '3', 'fabbri', 'Fabbri', 'key-outline', 'Aperture porte, serrature e lavori in ferro.', 48, 620, 3, 'https://qyptmczxkzxycsgqgesl.supabase.co/storage/v1/object/public/category-images/fabbri.webp', true),
  ('c1000001-0001-4000-8000-000000000004', '4', 'giardinieri', 'Giardinieri', 'leaf-outline', 'Cura e manutenzione di giardini e spazi verdi.', 52, 780, 4, 'https://qyptmczxkzxycsgqgesl.supabase.co/storage/v1/object/public/category-images/giardinieri.webp', true),
  ('c1000001-0001-4000-8000-000000000001', '5', 'pulizie', 'Pulizie', 'sparkles-outline', 'Servizi di pulizia per casa e ufficio.', 128, 1240, 5, 'https://qyptmczxkzxycsgqgesl.supabase.co/storage/v1/object/public/category-images/pulizie.webp', true),
  ('c1000001-0001-4000-8000-000000000006', '6', 'imbianchini', 'Imbianchini', 'color-palette-outline', 'Tinteggiatura e lavori di pittura.', 64, 540, 6, 'https://qyptmczxkzxycsgqgesl.supabase.co/storage/v1/object/public/category-images/imbianchini.webp', true),
  ('c1000001-0001-4000-8000-000000000007', '7', 'serramentisti', 'Infissi', 'albums-outline', 'Installazione e riparazione di infissi e serramenti.', 58, 490, 7, 'https://qyptmczxkzxycsgqgesl.supabase.co/storage/v1/object/public/category-images/serramentisti.webp', true),
  ('c1000001-0001-4000-8000-000000000008', '8', 'tecnici-caldaie-condizionatori', 'Caldaie e condizionatori', 'thermometer-outline', 'Installazione, manutenzione e assistenza.', 72, 710, 8, 'https://qyptmczxkzxycsgqgesl.supabase.co/storage/v1/object/public/category-images/tecnici-caldaie-condizionatori.webp', true),
  ('c1000001-0001-4000-8000-000000000009', '9', 'traslochi-sgomberi', 'Traslochi e sgomberi', 'car-outline', 'Trasporti, traslochi e svuotamento locali.', 41, 430, 9, 'https://qyptmczxkzxycsgqgesl.supabase.co/storage/v1/object/public/category-images/traslochi-sgomberi.webp', true),
  ('c1000001-0001-4000-8000-000000000010', '10', 'antennisti', 'Antennisti', 'radio-outline', 'Installazione e manutenzione antenne TV e satellitari.', 36, 380, 10, 'https://qyptmczxkzxycsgqgesl.supabase.co/storage/v1/object/public/category-images/antennisti.webp', true),
  ('c1000001-0001-4000-8000-000000000011', '11', 'montaggio-mobili', 'Montaggio mobili', 'cube-outline', 'Assemblaggio e montaggio mobili.', 86, 980, 11, 'https://qyptmczxkzxycsgqgesl.supabase.co/storage/v1/object/public/category-images/montaggio-mobili.webp', true),
  ('c1000001-0001-4000-8000-000000000012', '12', 'tende-da-sole', 'Tende da sole', 'sunny-outline', 'Installazione e manutenzione tende da sole.', 33, 310, 12, 'https://qyptmczxkzxycsgqgesl.supabase.co/storage/v1/object/public/category-images/tende-da-sole.webp', true)
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

-- Ripristina FK e slug legacy dopo upsert categorie v12
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
