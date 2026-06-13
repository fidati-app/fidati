/**
 * Generates supabase/migrations/20260609_professionals_barletta_seed.sql
 * from fidati-app zone professional seeds.
 *
 * Run: node supabase/scripts/seed-zone-professionals.mjs
 */
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'migrations', '20260609_professionals_barletta_seed.sql');

/** legacy_id dedicati ai seed Barletta (non sovrapposti ai mock 1–15 né z-* legacy). */
const LEGACY_ID_BASE = 900001;

const CAT = {
  pulizie: 'c1000001-0001-4000-8000-000000000001',
  idraulici: 'c1000001-0001-4000-8000-000000000002',
  elettricisti: 'c1000001-0001-4000-8000-000000000003',
  giardinieri: 'c1000001-0001-4000-8000-000000000004',
  fabbri: 'c1000001-0001-4000-8000-000000000005',
  imbianchini: 'c1000001-0001-4000-8000-000000000006',
  serramentisti: 'c1000001-0001-4000-8000-000000000007',
  caldaie: 'c1000001-0001-4000-8000-000000000008',
  condizionatori: 'c1000001-0001-4000-8000-000000000013',
  'traslochi-sgomberi': 'c1000001-0001-4000-8000-000000000009',
  antennisti: 'c1000001-0001-4000-8000-000000000010',
  'montaggio-mobili': 'c1000001-0001-4000-8000-000000000011',
  'tende-da-sole': 'c1000001-0001-4000-8000-000000000012',
};

const IMAGES = {
  '1': {
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
    hero: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
  },
  '2': {
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face',
    hero: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&h=600&fit=crop',
  },
  '3': {
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
    hero: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop',
  },
  '4': {
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    hero: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
  },
  '5': {
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    hero: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop',
  },
  '6': {
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face',
    hero: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&h=600&fit=crop',
  },
  '7': {
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    hero: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop',
  },
  '9': {
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
    hero: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&h=600&fit=crop',
  },
  '11': {
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    hero: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
  },
  '13': {
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    hero: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop',
  },
  '15': {
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face',
    hero: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop',
  },
};

/** Zone professionals — 1+ per category, all with Barletta in service_areas */
const PROS = [
  { name: 'Anna Ferrari', slug: 'elettricisti', label: 'Elettricista', city: 'Trani', areas: ['Trani', 'Barletta', 'Margherita di Savoia'], rating: 5.0, reviews: 64, price: 45, today: true, img: '3', color: '#F59E0B', km: 2.1, urgent: 'Oggi', featured: true },
  { name: 'Marco Vitale', slug: 'elettricisti', label: 'Elettricista', city: 'Barletta', areas: ['Barletta', 'Andria', 'Bisceglie'], rating: 4.9, reviews: 88, price: 42, today: true, img: '9', color: '#D97706', km: 1.4 },
  { name: 'Paolo Greco', slug: 'elettricisti', label: 'Elettricista', city: 'Andria', areas: ['Andria', 'Barletta', 'Trani'], rating: 4.8, reviews: 71, price: 40, today: false, img: '11', color: '#B45309', km: 3.2 },
  { name: 'Luca Bianchi', slug: 'idraulici', label: 'Idraulico', city: 'Barletta', areas: ['Barletta', 'Andria', 'Bisceglie'], rating: 4.8, reviews: 95, price: 30, today: true, img: '2', color: '#0EA5E9', km: 1.2, urgent: 'Entro 1 ora', featured: true },
  { name: 'Francesco De Luca', slug: 'idraulici', label: 'Idraulico', city: 'Andria', areas: ['Andria', 'Barletta', 'Trani'], rating: 4.7, reviews: 82, price: 32, today: true, img: '6', color: '#0284C7', km: 2.0 },
  { name: 'Laura Bianchi', slug: 'pulizie', label: 'Pulizie', city: 'Barletta', areas: ['Barletta', 'Andria', 'Trani'], rating: 4.92, reviews: 128, price: 25, today: true, img: '1', color: '#8B5CF6', km: 1.2, urgent: 'Oggi', featured: true },
  { name: 'Sofia Marino', slug: 'pulizie', label: 'Pulizie', city: 'Trani', areas: ['Trani', 'Barletta', 'Bisceglie'], rating: 4.8, reviews: 73, price: 22, today: true, img: '7', color: '#EC4899', km: 0.5, featured: true },
  { name: 'Paolo Russo', slug: 'giardinieri', label: 'Giardiniere', city: 'Barletta', areas: ['Barletta', 'Andria'], rating: 4.7, reviews: 52, price: 30, today: false, img: '4', color: '#10B981', km: 3.4 },
  { name: 'Matteo Verde', slug: 'giardinieri', label: 'Giardiniere', city: 'Andria', areas: ['Andria', 'Barletta', 'Trani'], rating: 4.8, reviews: 61, price: 28, today: true, img: '11', color: '#059669', km: 2.8 },
  { name: 'Giuseppe Ferro', slug: 'fabbri', label: 'Fabbro', city: 'Barletta', areas: ['Barletta', 'Andria', 'Trani'], rating: 4.9, reviews: 58, price: 50, today: true, img: '5', color: '#78716C', km: 1.0, urgent: 'Entro 2 ore' },
  { name: 'Antonio Serrature', slug: 'fabbri', label: 'Fabbro', city: 'Trani', areas: ['Trani', 'Barletta', 'Bisceglie'], rating: 4.7, reviews: 44, price: 48, today: true, img: '13', color: '#57534E', km: 2.2 },
  { name: 'Luca Conti', slug: 'montaggio-mobili', label: 'Montaggio mobili', city: 'Barletta', areas: ['Barletta', 'Andria'], rating: 4.6, reviews: 98, price: 35, today: true, img: '5', color: '#6366F1', km: 1.8, urgent: 'Entro 2 ore' },
  { name: 'Nicola Caldaie', slug: 'caldaie', label: 'Caldaie', city: 'Barletta', areas: ['Barletta', 'Andria', 'Trani'], rating: 4.8, reviews: 47, price: 70, today: true, img: '6', color: '#EF4444', km: 1.6 },
  { name: 'Alberto Condizion', slug: 'condizionatori', label: 'Condizionatori', city: 'Andria', areas: ['Andria', 'Barletta', 'Trani'], rating: 4.7, reviews: 41, price: 80, today: true, img: '9', color: '#06B6D4', km: 2.4 },
  { name: 'Michele Infissi', slug: 'serramentisti', label: 'Infissi', city: 'Barletta', areas: ['Barletta', 'Trani'], rating: 4.6, reviews: 38, price: 55, today: false, img: '13', color: '#0EA5E9', km: 1.9 },
  { name: 'Simone Riva', slug: 'imbianchini', label: 'Imbianchino', city: 'Trani', areas: ['Trani', 'Barletta', 'Andria'], rating: 4.5, reviews: 78, price: 30, today: true, img: '15', color: '#475569', km: 2.6 },
  { name: 'Davide Antenne', slug: 'antennisti', label: 'Antennista', city: 'Barletta', areas: ['Barletta', 'Andria', 'Bisceglie'], rating: 4.6, reviews: 33, price: 38, today: true, img: '11', color: '#8B5CF6', km: 1.3 },
  { name: 'Pietro Traslochi', slug: 'traslochi-sgomberi', label: 'Traslochi e sgomberi', city: 'Barletta', areas: ['Barletta', 'Andria', 'Trani', 'Bisceglie'], rating: 4.5, reviews: 39, price: 45, today: false, img: '4', color: '#A78BFA', km: 2.5 },
  { name: 'Luigi Tende', slug: 'tende-da-sole', label: 'Tende da sole', city: 'Trani', areas: ['Trani', 'Barletta'], rating: 4.6, reviews: 36, price: 42, today: true, img: '6', color: '#FB7185', km: 3.3 },
];

function seedUuid(index) {
  return `b2000001-0001-4000-8000-${String(index + 1).padStart(12, '0')}`;
}

function seedLegacyId(index) {
  return String(LEGACY_ID_BASE + index);
}

function sqlStr(v) {
  return `'${String(v).replace(/'/g, "''")}'`;
}

function sqlArray(arr) {
  if (!arr.every((area) => area === 'Barletta' || arr.includes('Barletta'))) {
    throw new Error(`Seed pro must include Barletta in service_areas: ${arr.join(', ')}`);
  }
  return `ARRAY[${arr.map(sqlStr).join(', ')}]::TEXT[]`;
}

const ON_CONFLICT_UPDATE = `ON CONFLICT (id) DO UPDATE SET
  legacy_id = COALESCE(professionals.legacy_id, EXCLUDED.legacy_id),
  category_id = EXCLUDED.category_id,
  category_slug = EXCLUDED.category_slug,
  name = EXCLUDED.name,
  category_label = EXCLUDED.category_label,
  image_url = EXCLUDED.image_url,
  hero_image_url = EXCLUDED.hero_image_url,
  avatar_color = EXCLUDED.avatar_color,
  bio = EXCLUDED.bio,
  why_choose = EXCLUDED.why_choose,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  jobs_completed = EXCLUDED.jobs_completed,
  price_per_hour = EXCLUDED.price_per_hour,
  distance_km = EXCLUDED.distance_km,
  available_today = EXCLUDED.available_today,
  verified = EXCLUDED.verified,
  badge_document = EXCLUDED.badge_document,
  badge_phone = EXCLUDED.badge_phone,
  badge_professional = EXCLUDED.badge_professional,
  base_city = EXCLUDED.base_city,
  service_areas = EXCLUDED.service_areas,
  urgent_badge = EXCLUDED.urgent_badge,
  is_new_featured = EXCLUDED.is_new_featured,
  account_status = EXCLUDED.account_status`;

const lines = [
  '-- Seed zone professionals (Barletta area) — generated by seed-zone-professionals.mjs',
  '-- Idempotente: UUID stabili b2000001-…, legacy_id 900001+ (no conflitto con seed esistenti).',
  '-- Non elimina professionisti preesistenti.',
  '-- Almeno 1 verified pro per categoria con Barletta in service_areas.',
  '',
];

for (const [index, p] of PROS.entries()) {
  const uuid = seedUuid(index);
  const legacyId = seedLegacyId(index);
  const catId = CAT[p.slug];
  const img = IMAGES[p.img] ?? IMAGES['5'];
  const jobs = Math.round(p.reviews * 2.4);
  const why = `'["Recensioni verificate","Prezzi trasparenti","Assicurazione RC professionale"]'::jsonb`;

  lines.push(`INSERT INTO professionals (
  id, legacy_id, category_id, category_slug, name, category_label,
  image_url, hero_image_url, avatar_color, bio, why_choose,
  rating, review_count, jobs_completed, price_per_hour, distance_km,
  available_today, verified, badge_document, badge_phone, badge_professional,
  base_city, service_areas, urgent_badge, is_new_featured, account_status
) VALUES (
  ${sqlStr(uuid)}, ${sqlStr(legacyId)}, ${sqlStr(catId)}, ${sqlStr(p.slug)}, ${sqlStr(p.name)}, ${sqlStr(p.label)},
  ${sqlStr(img.avatar)}, ${sqlStr(img.hero)}, ${sqlStr(p.color)},
  'Professionista verificato su Fidati, disponibile per interventi rapidi e lavori programmati.', ${why},
  ${p.rating}, ${p.reviews}, ${jobs}, ${p.price}, ${p.km},
  ${p.today}, true, true, true, true,
  ${sqlStr(p.city)}, ${sqlArray(p.areas)},
  ${p.urgent ? sqlStr(p.urgent) : 'NULL'}, ${p.featured ? 'true' : 'false'}, 'verified'
) ${ON_CONFLICT_UPDATE};`);
  lines.push('');

  p.areas.forEach((area, i) => {
    lines.push(
      `INSERT INTO professional_zones (professional_id, zone_name, sort_order) VALUES (${sqlStr(uuid)}, ${sqlStr(area)}, ${i + 1}) ON CONFLICT (professional_id, zone_name) DO UPDATE SET sort_order = EXCLUDED.sort_order;`,
    );
  });
  lines.push('');
}

lines.push('-- Garantisce Barletta in service_areas per i seed (idempotente)');
lines.push(`UPDATE professionals SET
  service_areas = CASE
    WHEN service_areas IS NULL OR array_length(service_areas, 1) IS NULL THEN ARRAY['Barletta']::TEXT[]
    WHEN NOT ('Barletta' = ANY(service_areas)) THEN array_prepend('Barletta', service_areas)
    ELSE service_areas
  END
WHERE id::text LIKE 'b2000001-0001-4000-8000-%';`);
lines.push('');

writeFileSync(OUT, lines.join('\n'));
console.log(`Wrote ${OUT} (${PROS.length} professionals, legacy_id ${LEGACY_ID_BASE}–${LEGACY_ID_BASE + PROS.length - 1})`);
