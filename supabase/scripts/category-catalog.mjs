/**
 * Catalogo ufficiale categorie Fidati (12) — usato da generate-seed.mjs
 */

export const STORAGE_BUCKET = 'category-images';

export const OFFICIAL_CATEGORIES = [
  {
    uuid: 'c1000001-0001-4000-8000-000000000003',
    legacyId: '1',
    slug: 'elettricisti',
    name: 'Elettricisti',
    icon: 'flash-outline',
    description: 'Installazioni, riparazioni e pronto intervento elettrico.',
    professionalCount: 76,
    homeCount: 1120,
    sortOrder: 1,
    sourceImage:
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1080&h=720&fit=crop&q=75',
  },
  {
    uuid: 'c1000001-0001-4000-8000-000000000002',
    legacyId: '2',
    slug: 'idraulici',
    name: 'Idraulici',
    icon: 'water-outline',
    description: 'Riparazioni, perdite e installazioni idrauliche.',
    professionalCount: 94,
    homeCount: 860,
    sortOrder: 2,
    sourceImage:
      'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=1080&h=720&fit=crop&q=75',
  },
  {
    uuid: 'c1000001-0001-4000-8000-000000000005',
    legacyId: '3',
    slug: 'fabbri',
    name: 'Fabbri',
    icon: 'key-outline',
    description: 'Aperture porte, serrature e lavori in ferro.',
    professionalCount: 48,
    homeCount: 620,
    sortOrder: 3,
    sourceImage:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&h=720&fit=crop&q=75',
  },
  {
    uuid: 'c1000001-0001-4000-8000-000000000004',
    legacyId: '4',
    slug: 'giardinieri',
    name: 'Giardinieri',
    icon: 'leaf-outline',
    description: 'Cura e manutenzione di giardini e spazi verdi.',
    professionalCount: 52,
    homeCount: 780,
    sortOrder: 4,
    sourceImage:
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1080&h=720&fit=crop&q=75',
  },
  {
    uuid: 'c1000001-0001-4000-8000-000000000001',
    legacyId: '5',
    slug: 'pulizie',
    name: 'Pulizie',
    icon: 'sparkles-outline',
    description: 'Servizi di pulizia per casa e ufficio.',
    professionalCount: 128,
    homeCount: 1240,
    sortOrder: 5,
    sourceImage:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1080&h=720&fit=crop&q=75',
  },
  {
    uuid: 'c1000001-0001-4000-8000-000000000006',
    legacyId: '6',
    slug: 'imbianchini',
    name: 'Imbianchini',
    icon: 'color-palette-outline',
    description: 'Tinteggiatura e lavori di pittura.',
    professionalCount: 64,
    homeCount: 540,
    sortOrder: 6,
    sourceImage:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1080&h=720&fit=crop&q=75',
  },
  {
    uuid: 'c1000001-0001-4000-8000-000000000007',
    legacyId: '7',
    slug: 'serramentisti',
    name: 'Infissi',
    icon: 'albums-outline',
    description: 'Installazione e riparazione di infissi e serramenti.',
    professionalCount: 58,
    homeCount: 490,
    sortOrder: 7,
    sourceImage:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1080&h=720&fit=crop&q=75',
  },
  {
    uuid: 'c1000001-0001-4000-8000-000000000008',
    legacyId: '8',
    slug: 'tecnici-caldaie-condizionatori',
    name: 'Caldaie e condizionatori',
    icon: 'thermometer-outline',
    description: 'Installazione, manutenzione e assistenza.',
    professionalCount: 72,
    homeCount: 710,
    sortOrder: 8,
    sourceImage:
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1080&h=720&fit=crop&q=75',
  },
  {
    uuid: 'c1000001-0001-4000-8000-000000000009',
    legacyId: '9',
    slug: 'traslochi-sgomberi',
    name: 'Traslochi e sgomberi',
    icon: 'car-outline',
    description: 'Trasporti, traslochi e svuotamento locali.',
    professionalCount: 41,
    homeCount: 430,
    sortOrder: 9,
    sourceImage:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1080&h=720&fit=crop&q=75',
  },
  {
    uuid: 'c1000001-0001-4000-8000-000000000010',
    legacyId: '10',
    slug: 'antennisti',
    name: 'Antennisti',
    icon: 'radio-outline',
    description: 'Installazione e manutenzione antenne TV e satellitari.',
    professionalCount: 36,
    homeCount: 380,
    sortOrder: 10,
    sourceImage:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&h=720&fit=crop&q=75',
  },
  {
    uuid: 'c1000001-0001-4000-8000-000000000011',
    legacyId: '11',
    slug: 'montaggio-mobili',
    name: 'Montaggio mobili',
    icon: 'cube-outline',
    description: 'Assemblaggio e montaggio mobili.',
    professionalCount: 86,
    homeCount: 980,
    sortOrder: 11,
    sourceImage:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1080&h=720&fit=crop&q=75',
  },
  {
    uuid: 'c1000001-0001-4000-8000-000000000012',
    legacyId: '12',
    slug: 'tende-da-sole',
    name: 'Tende da sole',
    icon: 'sunny-outline',
    description: 'Installazione e manutenzione tende da sole.',
    professionalCount: 33,
    homeCount: 310,
    sortOrder: 12,
    sourceImage:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1080&h=720&fit=crop&q=75',
  },
];

export const CAT = Object.fromEntries(OFFICIAL_CATEGORIES.map((c) => [c.slug, c.uuid]));

export function categoryImageUrl(supabaseUrl, slug) {
  if (!supabaseUrl) return null;
  return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${STORAGE_BUCKET}/${slug}.webp`;
}

export function categoryImageUrlForSeed(slug) {
  return categoryImageUrl('https://qyptmczxkzxycsgqgesl.supabase.co', slug);
}
