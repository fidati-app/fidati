import { Category, CategoryIcon, CategorySlug } from '@/types';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');

export const CATEGORY_STORAGE_BUCKET = 'category-images';

export interface CategoryCatalogEntry {
  id: string;
  slug: CategorySlug;
  name: string;
  icon: CategoryIcon;
  description: string;
  professionalCount: number;
  homeCount: number;
  sortOrder: number;
  /** Fallback locale se Storage non disponibile */
  coverFallback: string;
}

export const OFFICIAL_CATEGORY_CATALOG: CategoryCatalogEntry[] = [
  {
    id: '1',
    slug: 'elettricisti',
    name: 'Elettricisti',
    icon: 'flash-outline',
    description: 'Installazioni, riparazioni e pronto intervento elettrico.',
    professionalCount: 76,
    homeCount: 1120,
    sortOrder: 1,
    coverFallback:
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1080&h=720&fit=crop&q=75&fm=webp',
  },
  {
    id: '2',
    slug: 'idraulici',
    name: 'Idraulici',
    icon: 'water-outline',
    description: 'Riparazioni, perdite e installazioni idrauliche.',
    professionalCount: 94,
    homeCount: 860,
    sortOrder: 2,
    coverFallback:
      'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=1080&h=720&fit=crop&q=75&fm=webp',
  },
  {
    id: '3',
    slug: 'fabbri',
    name: 'Fabbri',
    icon: 'key-outline',
    description: 'Aperture porte, serrature e lavori in ferro.',
    professionalCount: 48,
    homeCount: 620,
    sortOrder: 3,
    coverFallback:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&h=720&fit=crop&q=75&fm=webp',
  },
  {
    id: '4',
    slug: 'giardinieri',
    name: 'Giardinieri',
    icon: 'leaf-outline',
    description: 'Cura e manutenzione di giardini e spazi verdi.',
    professionalCount: 52,
    homeCount: 780,
    sortOrder: 4,
    coverFallback:
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1080&h=720&fit=crop&q=75&fm=webp',
  },
  {
    id: '5',
    slug: 'pulizie',
    name: 'Pulizie',
    icon: 'sparkles-outline',
    description: 'Servizi di pulizia per casa e ufficio.',
    professionalCount: 128,
    homeCount: 1240,
    sortOrder: 5,
    coverFallback:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1080&h=720&fit=crop&q=75&fm=webp',
  },
  {
    id: '6',
    slug: 'imbianchini',
    name: 'Imbianchini',
    icon: 'color-palette-outline',
    description: 'Tinteggiatura e lavori di pittura.',
    professionalCount: 64,
    homeCount: 540,
    sortOrder: 6,
    coverFallback:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1080&h=720&fit=crop&q=75&fm=webp',
  },
  {
    id: '7',
    slug: 'serramentisti',
    name: 'Infissi',
    icon: 'albums-outline',
    description: 'Installazione e riparazione di infissi e serramenti.',
    professionalCount: 58,
    homeCount: 490,
    sortOrder: 7,
    coverFallback:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1080&h=720&fit=crop&q=75&fm=webp',
  },
  {
    id: '8',
    slug: 'caldaie',
    name: 'Caldaie',
    icon: 'flame-outline',
    description: 'Installazione, manutenzione e assistenza caldaie.',
    professionalCount: 38,
    homeCount: 420,
    sortOrder: 8,
    coverFallback:
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1080&h=720&fit=crop&q=75&fm=webp',
  },
  {
    id: '13',
    slug: 'condizionatori',
    name: 'Condizionatori',
    icon: 'snow-outline',
    description: 'Installazione, manutenzione e assistenza climatizzatori.',
    professionalCount: 34,
    homeCount: 390,
    sortOrder: 9,
    coverFallback:
      'https://images.unsplash.com/photo-1585771724944-230ac3de9884?w=1080&h=720&fit=crop&q=75&fm=webp',
  },
  {
    id: '9',
    slug: 'traslochi-sgomberi',
    name: 'Traslochi e sgomberi',
    icon: 'car-outline',
    description: 'Trasporti, traslochi e svuotamento locali.',
    professionalCount: 41,
    homeCount: 430,
    sortOrder: 10,
    coverFallback:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1080&h=720&fit=crop&q=75&fm=webp',
  },
  {
    id: '10',
    slug: 'antennisti',
    name: 'Antennisti',
    icon: 'radio-outline',
    description: 'Installazione e manutenzione antenne TV e satellitari.',
    professionalCount: 36,
    homeCount: 380,
    sortOrder: 11,
    coverFallback:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1080&h=720&fit=crop&q=75&fm=webp',
  },
  {
    id: '11',
    slug: 'montaggio-mobili',
    name: 'Montaggio mobili',
    icon: 'cube-outline',
    description: 'Assemblaggio e montaggio mobili.',
    professionalCount: 86,
    homeCount: 980,
    sortOrder: 12,
    coverFallback:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1080&h=720&fit=crop&q=75&fm=webp',
  },
  {
    id: '12',
    slug: 'tende-da-sole',
    name: 'Tende da sole',
    icon: 'sunny-outline',
    description: 'Installazione e manutenzione tende da sole.',
    professionalCount: 33,
    homeCount: 310,
    sortOrder: 13,
    coverFallback:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1080&h=720&fit=crop&q=75&fm=webp',
  },
];

export const CATEGORY_COVER_FALLBACK = Object.fromEntries(
  OFFICIAL_CATEGORY_CATALOG.map((c) => [c.slug, c.coverFallback]),
) as Record<CategorySlug, string>;

export function getCategoryStorageUrl(slug: CategorySlug): string | null {
  if (!SUPABASE_URL) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${CATEGORY_STORAGE_BUCKET}/${slug}.webp`;
}

export function getCategoryCoverUrl(slug: CategorySlug): string {
  return getCategoryStorageUrl(slug) ?? CATEGORY_COVER_FALLBACK[slug];
}

export const CATEGORIES: Category[] = OFFICIAL_CATEGORY_CATALOG.map(
  ({ sortOrder: _sortOrder, coverFallback: _cover, ...category }) => category,
);

export const CATEGORY_SLUGS = OFFICIAL_CATEGORY_CATALOG.map((c) => c.slug);

const DEPRECATED_CATEGORY_SLUGS = new Set(['tuttofare']);

const DEPRECATED_LABEL_PATTERNS = [
  /^tuttofare$/i,
  /handyman/i,
  /generic repair/i,
  /lavoretti generici/i,
];

export function isOfficialCategorySlug(slug: string): slug is CategorySlug {
  return CATEGORY_SLUGS.includes(slug as CategorySlug);
}

const LEGACY_CATEGORY_SLUG_ALIASES: Record<string, CategorySlug> = {
  tuttofare: 'montaggio-mobili',
  'tecnici-caldaie-condizionatori': 'caldaie',
};

export function resolveCategorySlug(raw?: string | null): CategorySlug {
  if (!raw?.trim()) return 'montaggio-mobili';
  const normalized = raw.trim();
  if (LEGACY_CATEGORY_SLUG_ALIASES[normalized]) {
    return LEGACY_CATEGORY_SLUG_ALIASES[normalized];
  }
  return isOfficialCategorySlug(normalized) ? normalized : 'montaggio-mobili';
}

export function getOfficialCategoryName(slug: CategorySlug): string {
  return OFFICIAL_CATEGORY_CATALOG.find((c) => c.slug === slug)?.name ?? slug;
}

export function sanitizeLegacyCategoryLabel(
  _label: string | null | undefined,
  slug: CategorySlug,
): string {
  return getOfficialCategoryName(slug);
}

export function sanitizeLegacyServiceLabel(label: string | null | undefined): string {
  if (!label?.trim()) return 'Servizio';
  const trimmed = label.trim();
  if (DEPRECATED_LABEL_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return getOfficialCategoryName('montaggio-mobili');
  }
  return trimmed;
}

export function normalizeOfficialCategories(remote: Category[]): Category[] {
  const bySlug = new Map<CategorySlug, Category>();

  for (const item of remote) {
    const slug = resolveCategorySlug(item.slug);
    if (!isOfficialCategorySlug(slug)) continue;
    bySlug.set(slug, {
      ...item,
      slug,
      name: getOfficialCategoryName(slug),
    });
  }

  return CATEGORY_SLUGS.map((slug) => {
    const catalog = CATEGORIES.find((category) => category.slug === slug)!;
    const fromRemote = bySlug.get(slug);
    return fromRemote ? { ...catalog, ...fromRemote, slug, name: getOfficialCategoryName(slug) } : catalog;
  });
}

/** Prime 5 categorie con sezione professionisti in Home */
export const HOME_PRIMARY_CATEGORY_SLUGS = [
  'elettricisti',
  'idraulici',
  'pulizie',
  'giardinieri',
  'fabbri',
] as const satisfies readonly CategorySlug[];

export const HOME_CAROUSEL_PREVIEW_LIMIT = 6;

export function getHomePrimaryCategories(categories: Category[]): Category[] {
  const bySlug = new Map(categories.map((category) => [category.slug, category]));
  return HOME_PRIMARY_CATEGORY_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (category): category is Category => category !== undefined,
  );
}

/** Label compatte per la rail categorie in Home (una riga, senza nomi lunghi). */
export const HOME_CATEGORY_SHORT_LABELS: Record<CategorySlug, string> = {
  elettricisti: 'Elettrico',
  idraulici: 'Idraulico',
  pulizie: 'Pulizie',
  giardinieri: 'Giardino',
  fabbri: 'Fabbro',
  imbianchini: 'Imbianchi',
  serramentisti: 'Infissi',
  caldaie: 'Caldaie',
  condizionatori: 'Clima',
  'traslochi-sgomberi': 'Traslochi',
  antennisti: 'Antenne',
  'montaggio-mobili': 'Montaggio',
  'tende-da-sole': 'Tende',
};

export function getHomeCategoryShortLabel(slug: CategorySlug): string {
  return HOME_CATEGORY_SHORT_LABELS[slug] ?? getOfficialCategoryName(slug);
}

export function getHomeSecondaryCategories(categories: Category[]): Category[] {
  const primarySet = new Set<string>(HOME_PRIMARY_CATEGORY_SLUGS);
  return categories.filter((category) => !primarySet.has(category.slug));
}

export function getCategoryDetailPath(slug: CategorySlug): string {
  return `/categories/${slug}`;
}

const CATEGORY_BROWSE_SUBTITLES: Partial<Record<CategorySlug, string>> = {
  elettricisti: 'Tutti gli elettricisti disponibili',
  idraulici: 'Tutti gli idraulici disponibili',
  fabbri: 'Tutti i fabbri disponibili',
  giardinieri: 'Tutti i giardinieri disponibili',
  pulizie: 'Tutte le pulizie disponibili',
  imbianchini: 'Tutti gli imbianchini disponibili',
  serramentisti: 'Tutti gli infissi disponibili',
  caldaie: 'Tutte le caldaie disponibili',
  condizionatori: 'Tutti i condizionatori disponibili',
  'traslochi-sgomberi': 'Tutti i traslochi disponibili',
  antennisti: 'Tutti gli antennisti disponibili',
  'montaggio-mobili': 'Tutti i montaggi disponibili',
  'tende-da-sole': 'Tutte le tende disponibili',
};

export function getCategoryBrowseSubtitle(category: Category): string {
  return CATEGORY_BROWSE_SUBTITLES[category.slug] ?? `Tutti i ${category.name.toLowerCase()} disponibili`;
}

export function getCategoryBrowseBadge(
  category: Category,
  shownCount: number,
  totalInList = 0,
): string {
  const total = Math.max(category.professionalCount, totalInList);
  const extra = Math.max(0, total - shownCount);
  return extra > 0 ? `+${extra} disponibili` : `+${total} disponibili`;
}

export const QUICK_FILTERS = [
  { id: 'casa', label: 'Casa', icon: 'home-outline' as const },
  { id: 'azienda', label: 'Azienda', icon: 'business-outline' as const },
  { id: 'urgente', label: 'Urgente', icon: 'time-outline' as const },
  { id: 'vicino', label: 'Vicino a me', icon: 'location-outline' as const },
  { id: 'oggi', label: 'Oggi', icon: 'today-outline' as const },
  { id: 'verificati', label: 'Verificati', icon: 'shield-checkmark-outline' as const },
  { id: 'top', label: 'Top', icon: 'star-outline' as const },
  { id: 'economico', label: 'Economico', icon: 'pricetag-outline' as const },
];
