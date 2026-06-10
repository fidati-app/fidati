import { ProfessionalServiceItem } from '@/constants/professionalServices';
import { isSupabaseEnabled, supabase } from '@/lib/supabase';
import {
  logFallback,
  logQueryError,
  logQueryStart,
  logQuerySuccess,
} from '@/lib/supabaseDebug';
import {
  getProfessionalById,
  getProfessionalsByCategory,
  MOCK_PROFESSIONALS,
} from '@/services/mockData';
import {
  CategoryIcon,
  CategorySlug,
  PackageTier,
  Professional,
  ServicePackage,
} from '@/types';

import { withMockFallback } from './supabaseUtils';

interface ProfessionalRow {
  id: string;
  legacy_id: string | null;
  category_label: string;
  name: string;
  image_url: string | null;
  hero_image_url: string | null;
  avatar_color: string;
  bio: string;
  why_choose: string[];
  rating: number;
  review_count: number;
  jobs_completed: number;
  price_per_hour: number;
  distance_km: number | null;
  available_today: boolean;
  verified: boolean;
  badge_document: boolean;
  badge_phone: boolean;
  badge_professional: boolean;
  urgent_badge: string | null;
  is_new_featured: boolean;
  service_categories: { slug: string } | { slug: string }[] | null;
}

interface PackageRow {
  id: string;
  legacy_id: string | null;
  professional_service_id: string | null;
  tier: PackageTier;
  title: string;
  description: string;
  price: number;
  duration_label: string;
  sort_order: number;
}

interface ServiceRow {
  id: string;
  legacy_id: string | null;
  title: string;
  price_from: number;
  duration_label: string;
  sort_order: number;
  services: { icon: string; description: string } | { icon: string; description: string }[] | null;
}

interface PortfolioRow {
  cover_image: string;
  before_image: string | null;
  after_image: string | null;
  sort_order: number;
}

interface ZoneRow {
  zone_name: string;
  sort_order: number;
}

function categorySlugFromRow(row: ProfessionalRow): CategorySlug {
  const rel = row.service_categories;
  const slug = Array.isArray(rel) ? rel[0]?.slug : rel?.slug;
  return (slug ?? 'tuttofare') as CategorySlug;
}

function mapPackage(row: PackageRow): ServicePackage {
  return {
    id: row.legacy_id ?? row.id,
    tier: row.tier,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    duration: row.duration_label,
  };
}

function mapProfessional(row: ProfessionalRow, packages: ServicePackage[]): Professional {
  const categorySlug = categorySlugFromRow(row);
  return {
    id: row.legacy_id ?? row.id,
    name: row.name,
    categorySlug,
    category: row.category_label,
    imageUrl: row.image_url ?? '',
    heroImageUrl: row.hero_image_url ?? '',
    avatarColor: row.avatar_color,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    jobsCompleted: row.jobs_completed,
    pricePerHour: Number(row.price_per_hour),
    distanceKm: Number(row.distance_km ?? 0),
    availableToday: row.available_today,
    verified: row.verified,
    badges: {
      document: row.badge_document,
      phone: row.badge_phone,
      professional: row.badge_professional,
    },
    bio: row.bio,
    whyChoose: Array.isArray(row.why_choose) ? row.why_choose : [],
    packages,
  };
}

const PROFESSIONAL_SELECT = `
  *,
  service_categories ( slug )
`;

const PACKAGES_META = {
  service: 'professionalsService',
  table: 'professional_service_packages',
};

async function fetchPackagesForProfessional(professionalUuid: string): Promise<PackageRow[]> {
  logQueryStart(PACKAGES_META);
  const { data, error } = await supabase
    .from('professional_service_packages')
    .select('*')
    .eq('professional_id', professionalUuid)
    .order('sort_order', { ascending: true });

  if (error) {
    logQueryError(PACKAGES_META, error);
    logFallback(PACKAGES_META, 'errore query');
    throw error;
  }
  logQuerySuccess(PACKAGES_META, data?.length ?? 0);
  return data as PackageRow[];
}

async function mapProfessionalRow(row: ProfessionalRow): Promise<Professional> {
  const packages = (await fetchPackagesForProfessional(row.id))
    .filter((pkg) => pkg.professional_service_id == null)
    .map(mapPackage);
  return mapProfessional(row, packages);
}

const PROFESSIONALS_META = { service: 'professionalsService', table: 'professionals' };

export async function fetchProfessionals(): Promise<Professional[]> {
  return withMockFallback(
    PROFESSIONALS_META,
    async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select(PROFESSIONAL_SELECT)
        .order('rating', { ascending: false });

      if (error) throw error;
      const rows = data as ProfessionalRow[];
      return Promise.all(rows.map(mapProfessionalRow));
    },
    MOCK_PROFESSIONALS,
  );
}

export async function fetchProfessionalByLegacyId(legacyId: string): Promise<Professional | null> {
  const fallback = getProfessionalById(legacyId) ?? null;

  return withMockFallback(
    PROFESSIONALS_META,
    async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select(PROFESSIONAL_SELECT)
        .eq('legacy_id', legacyId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      return mapProfessionalRow(data as ProfessionalRow);
    },
    fallback,
  );
}

export async function fetchProfessionalsByCategory(slug: string): Promise<Professional[]> {
  const fallback = getProfessionalsByCategory(slug);

  return withMockFallback(
    PROFESSIONALS_META,
    async () => {
      const catMeta = { service: 'professionalsService', table: 'service_categories' };
      logQueryStart(catMeta);
      const { data: category, error: catError } = await supabase
        .from('service_categories')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (catError) {
        logQueryError(catMeta, catError);
        throw catError;
      }
      logQuerySuccess(catMeta, category ? 1 : 0);
      if (!category) return [];

      const { data, error } = await supabase
        .from('professionals')
        .select(PROFESSIONAL_SELECT)
        .eq('category_id', category.id)
        .order('rating', { ascending: false });

      if (error) throw error;
      const rows = data as ProfessionalRow[];
      return Promise.all(rows.map(mapProfessionalRow));
    },
    fallback,
  );
}

function mapServiceRow(
  row: ServiceRow,
  packagesByService: Map<string, ServicePackage[]>,
  orphanPackages: ServicePackage[],
): ProfessionalServiceItem {
  const catalog = row.services;
  const catalogInfo = Array.isArray(catalog) ? catalog[0] : catalog;
  const linked = packagesByService.get(row.id) ?? [];

  const packages =
    linked.length > 0
      ? linked
      : orphanPackages.length > 0
        ? orphanPackages
        : [
            {
              id: `${row.legacy_id ?? row.id}-base`,
              tier: 'base' as PackageTier,
              title: row.title,
              description: catalogInfo?.description ?? row.title,
              price: Number(row.price_from),
              duration: row.duration_label,
            },
          ];

  return {
    id: row.legacy_id ?? row.id,
    title: row.title,
    icon: (catalogInfo?.icon ?? 'construct-outline') as CategoryIcon,
    description: catalogInfo?.description ?? row.title,
    fromPrice: Number(row.price_from),
    packages,
  };
}

export interface ProfessionalDetailData {
  services: ProfessionalServiceItem[];
  galleryImages: string[];
  zones: string[];
}

export async function fetchProfessionalDetail(
  legacyId: string,
  professional: Professional,
): Promise<ProfessionalDetailData | null> {
  if (!isSupabaseEnabled) {
    if (__DEV__) {
      logFallback(
        { service: 'professionalsService', table: 'professional_detail' },
        'env mancanti',
      );
    }
    return null;
  }

  const detailMeta = { service: 'professionalsService', table: 'professional_detail' };
  logQueryStart({ service: 'professionalsService', table: 'professionals' });

  try {
    const { data: pro, error: proError } = await supabase
      .from('professionals')
      .select('id')
      .eq('legacy_id', legacyId)
      .maybeSingle();

    if (proError) {
      logQueryError({ service: 'professionalsService', table: 'professionals' }, proError);
      return null;
    }
    logQuerySuccess({ service: 'professionalsService', table: 'professionals' }, pro ? 1 : 0);
    if (!pro) {
      logFallback(detailMeta, 'professionista non trovato per legacy_id');
      return null;
    }

    const [servicesRes, packagesRes, portfolioRes, zonesRes] = await Promise.all([
      supabase
        .from('professional_services')
        .select('*, services ( icon, description )')
        .eq('professional_id', pro.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('professional_service_packages')
        .select('*')
        .eq('professional_id', pro.id)
        .order('sort_order', { ascending: true }),
      supabase
        .from('professional_portfolio')
        .select('cover_image, before_image, after_image, sort_order')
        .eq('professional_id', pro.id)
        .order('sort_order', { ascending: true }),
      supabase
        .from('professional_zones')
        .select('zone_name, sort_order')
        .eq('professional_id', pro.id)
        .order('sort_order', { ascending: true }),
    ]);

    const detailTables = [
      { meta: { service: 'professionalsService', table: 'professional_services' }, res: servicesRes },
      {
        meta: { service: 'professionalsService', table: 'professional_service_packages' },
        res: packagesRes,
      },
      { meta: { service: 'professionalsService', table: 'professional_portfolio' }, res: portfolioRes },
      { meta: { service: 'professionalsService', table: 'professional_zones' }, res: zonesRes },
    ] as const;

    for (const { meta, res } of detailTables) {
      logQueryStart(meta);
      if (res.error) {
        logQueryError(meta, res.error);
        throw res.error;
      }
      const count = Array.isArray(res.data) ? res.data.length : res.data ? 1 : 0;
      logQuerySuccess(meta, count);
    }

    const packageRows = (packagesRes.data ?? []) as PackageRow[];
    const orphanPackages = packageRows
      .filter((pkg) => pkg.professional_service_id == null)
      .map(mapPackage);

    const packagesByService = new Map<string, ServicePackage[]>();
    for (const pkg of packageRows) {
      if (!pkg.professional_service_id) continue;
      const list = packagesByService.get(pkg.professional_service_id) ?? [];
      list.push(mapPackage(pkg));
      packagesByService.set(pkg.professional_service_id, list);
    }

    const serviceRows = (servicesRes.data ?? []) as ServiceRow[];
    const services = serviceRows.map((row, index) =>
      mapServiceRow(row, packagesByService, index === 0 ? orphanPackages : []),
    );

    const portfolioRows = (portfolioRes.data ?? []) as PortfolioRow[];
    const portfolioImages = portfolioRows.flatMap((item) =>
      [item.cover_image, item.before_image, item.after_image].filter(Boolean) as string[],
    );

    const galleryImages = [
      ...new Set(
        [professional.heroImageUrl, professional.imageUrl, ...portfolioImages].filter(Boolean),
      ),
    ].slice(0, 5);

    const zones = ((zonesRes.data ?? []) as ZoneRow[]).map((z) => z.zone_name);

    if (services.length === 0 && galleryImages.length <= 2 && zones.length === 0) {
      logFallback(detailMeta, 'nessun dato utile per dettaglio');
      return null;
    }

    return { services, galleryImages, zones };
  } catch (error) {
    logQueryError(detailMeta, error);
    logFallback(detailMeta, 'errore caricamento dettaglio');
    return null;
  }
}

// Urgent from DB urgent_badge field
export async function fetchUrgentFromSupabase(
  professionals: Professional[],
): Promise<{ professional: Professional; badge: string }[]> {
  const meta = { service: 'professionalsService', table: 'professionals (urgent_badge)' };
  try {
    logQueryStart(meta);
    const { data, error } = await supabase
      .from('professionals')
      .select('legacy_id, urgent_badge')
      .not('urgent_badge', 'is', null);

    if (error) throw error;
    logQuerySuccess(meta, data?.length ?? 0);
    if (!data?.length) return [];

    const badgeByLegacy = new Map(
      data.map((row) => [row.legacy_id as string, row.urgent_badge as string]),
    );

    return professionals
      .filter((p) => badgeByLegacy.has(p.id))
      .map((professional) => ({
        professional,
        badge: badgeByLegacy.get(professional.id) ?? 'Oggi',
      }));
  } catch (error) {
    logQueryError(meta, error);
    return [];
  }
}

export async function fetchNewFeaturedProfessionals(
  professionals: Professional[],
): Promise<Professional[]> {
  const meta = { service: 'professionalsService', table: 'professionals (is_new_featured)' };
  try {
    logQueryStart(meta);
    const { data, error } = await supabase
      .from('professionals')
      .select('legacy_id')
      .eq('is_new_featured', true);

    if (error) throw error;
    logQuerySuccess(meta, data?.length ?? 0);
    if (!data?.length) return [];

    const ids = new Set(data.map((row) => row.legacy_id as string));
    return professionals.filter((p) => ids.has(p.id));
  } catch (error) {
    logQueryError(meta, error);
    return [];
  }
}

export function getTopProfessionals(professionals: Professional[], limit = 4): Professional[] {
  return [...professionals]
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, limit);
}

export function getTopProfessionalsByCategoryFromList(
  professionals: Professional[],
  slug: string,
  limit = 3,
): Professional[] {
  return professionals
    .filter((p) => p.categorySlug === slug)
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, limit);
}
