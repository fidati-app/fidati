import {
  resolveCategorySlug,
  sanitizeLegacyCategoryLabel,
} from '@/constants/categoryCatalog';
import { ProfessionalServiceItem } from '@/constants/professionalServices';
import { isSupabaseEnabled, supabase } from '@/lib/supabase';
import {
  logFallback,
  logQueryError,
  logQueryStart,
  logQuerySuccess,
} from '@/lib/supabaseDebug';
import {
  CategoryIcon,
  CategorySlug,
  PackageTier,
  Professional,
  ServiceCity,
  ServicePackage,
} from '@/types';

import { fetchFromSupabaseOnly } from './supabaseUtils';

interface ProfessionalRow {
  id: string;
  legacy_id: string | null;
  category_slug: string | null;
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
  created_at: string;
  base_city: string | null;
  service_areas: string[] | null;
  service_categories: { slug: string } | { slug: string }[] | null;
}

interface PackageRow {
  id: string;
  legacy_id: string | null;
  professional_id?: string;
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

function parseServiceCity(value: string | null | undefined): ServiceCity | null {
  const normalized = value?.trim();
  if (!normalized) return null;
  const allowed: ServiceCity[] = [
    'Barletta',
    'Andria',
    'Trani',
    'Bisceglie',
    'Margherita di Savoia',
  ];
  const match = allowed.find((city) => city.toLowerCase() === normalized.toLowerCase());
  return match ?? null;
}

function serviceAreasFromRow(row: ProfessionalRow, zoneNames?: string[]): ServiceCity[] {
  const fromArray = (row.service_areas ?? [])
    .map(parseServiceCity)
    .filter((city): city is ServiceCity => city !== null);

  if (fromArray.length > 0) {
    return fromArray;
  }

  const base = parseServiceCity(row.base_city);
  if (base) {
    return [base];
  }

  if (zoneNames?.length) {
    const fromZones = zoneNames
      .map(parseServiceCity)
      .filter((city): city is ServiceCity => city !== null);
    if (fromZones.length > 0) {
      return fromZones;
    }
  }

  return [];
}

function categorySlugFromRow(row: ProfessionalRow): CategorySlug {
  if (row.category_slug) {
    return resolveCategorySlug(row.category_slug);
  }
  const rel = row.service_categories;
  const slug = Array.isArray(rel) ? rel[0]?.slug : rel?.slug;
  return resolveCategorySlug(slug);
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

function mapProfessional(
  row: ProfessionalRow,
  packages: ServicePackage[],
  zoneNames?: string[],
): Professional {
  const categorySlug = categorySlugFromRow(row);
  const serviceAreas = serviceAreasFromRow(row, zoneNames);
  const city = parseServiceCity(row.base_city) ?? serviceAreas[0] ?? 'Barletta';

  return {
    id: row.legacy_id ?? row.id,
    name: row.name,
    categorySlug,
    category: sanitizeLegacyCategoryLabel(row.category_label, categorySlug),
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
    city,
    serviceAreas,
    urgentBadge: row.urgent_badge,
    isNewFeatured: row.is_new_featured,
    createdAt: row.created_at,
  };
}

const PROFESSIONAL_SELECT = `
  *,
  service_categories ( slug )
`;

async function fetchZonesForProfessionals(
  ids: string[],
  source = 'fetchProfessionals()',
): Promise<Map<string, string[]>> {
  if (ids.length === 0) return new Map();

  const meta = {
    service: 'professionalsService',
    table: 'professional_zones',
    name: 'zonesBatch',
    source,
    context: { pros: String(ids.length) },
  };
  const queryId = logQueryStart(meta);
  const { data, error } = await supabase
    .from('professional_zones')
    .select('professional_id, zone_name, sort_order')
    .in('professional_id', ids)
    .order('sort_order', { ascending: true });

  if (error) {
    logQueryError(meta, error, queryId);
    throw error;
  }

  logQuerySuccess(meta, data?.length ?? 0, queryId);
  const zonesByPro = new Map<string, string[]>();
  for (const zone of data ?? []) {
    const list = zonesByPro.get(zone.professional_id) ?? [];
    list.push(zone.zone_name);
    zonesByPro.set(zone.professional_id, list);
  }
  return zonesByPro;
}

async function fetchPackagesForProfessionals(
  ids: string[],
  source = 'fetchProfessionals()',
): Promise<Map<string, PackageRow[]>> {
  if (ids.length === 0) return new Map();

  const meta = {
    service: 'professionalsService',
    table: 'professional_service_packages',
    name: 'packagesBatch',
    source,
    context: { pros: String(ids.length) },
  };
  const queryId = logQueryStart(meta);
  const { data, error } = await supabase
    .from('professional_service_packages')
    .select('*')
    .in('professional_id', ids)
    .order('sort_order', { ascending: true });

  if (error) {
    logQueryError(meta, error, queryId);
    throw error;
  }

  logQuerySuccess(meta, data?.length ?? 0, queryId);
  const packagesByPro = new Map<string, PackageRow[]>();
  for (const pkg of (data ?? []) as PackageRow[]) {
    const list = packagesByPro.get(pkg.professional_id as string) ?? [];
    list.push(pkg);
    packagesByPro.set(pkg.professional_id as string, list);
  }
  return packagesByPro;
}

function mapProfessionalRowSync(
  row: ProfessionalRow,
  packages: ServicePackage[],
  zoneNames?: string[],
): Professional {
  return mapProfessional(row, packages, zoneNames);
}

async function mapProfessionalRows(rows: ProfessionalRow[], source?: string): Promise<Professional[]> {
  const ids = rows.map((row) => row.id);
  const resolvedSource = source ?? 'fetchProfessionals()';
  const [zonesByPro, packagesByPro] = await Promise.all([
    fetchZonesForProfessionals(ids, resolvedSource),
    fetchPackagesForProfessionals(ids, resolvedSource),
  ]);

  return rows.map((row) => {
    const packages = (packagesByPro.get(row.id) ?? [])
      .filter((pkg) => pkg.professional_service_id == null)
      .map(mapPackage);
    return mapProfessionalRowSync(row, packages, zonesByPro.get(row.id));
  });
}

async function mapProfessionalRow(row: ProfessionalRow): Promise<Professional> {
  const [zonesByPro, packagesByPro] = await Promise.all([
    fetchZonesForProfessionals([row.id]),
    fetchPackagesForProfessionals([row.id]),
  ]);
  const packages = (packagesByPro.get(row.id) ?? [])
    .filter((pkg) => pkg.professional_service_id == null)
    .map(mapPackage);
  return mapProfessionalRowSync(row, packages, zonesByPro.get(row.id));
}

const PROFESSIONALS_LIST_META = {
  service: 'professionalsService',
  table: 'professionals',
  name: 'list',
  source: 'fetchHomeMarketplaceData()',
};

export async function fetchProfessionals(): Promise<Professional[]> {
  return fetchFromSupabaseOnly(
    PROFESSIONALS_LIST_META,
    async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select(PROFESSIONAL_SELECT)
        .eq('verified', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      const rows = (data ?? []) as ProfessionalRow[];
      return mapProfessionalRows(rows, 'fetchHomeMarketplaceData()');
    },
    [],
  );
}

export async function fetchProfessionalByLegacyId(legacyId: string): Promise<Professional | null> {
  return fetchFromSupabaseOnly(
    {
      service: 'professionalsService',
      table: 'professionals',
      name: 'getByLegacyId',
      source: 'useProfessional()',
      context: { legacyId },
    },
    async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select(PROFESSIONAL_SELECT)
        .eq('legacy_id', legacyId)
        .eq('verified', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      return mapProfessionalRow(data as ProfessionalRow);
    },
    null,
  );
}

export async function fetchProfessionalsByCategory(slug: string): Promise<Professional[]> {
  const resolvedSlug = resolveCategorySlug(slug);

  return fetchFromSupabaseOnly(
    {
      service: 'professionalsService',
      table: 'professionals',
      name: 'listByCategory',
      source: 'useProfessionalsByCategory()',
      context: { slug: resolvedSlug },
    },
    async () => {
      const catMeta = {
        service: 'professionalsService',
        table: 'service_categories',
        name: 'resolveCategory',
        source: 'fetchProfessionalsByCategory()',
        context: { slug: resolvedSlug },
      };
      const catQueryId = logQueryStart(catMeta);
      const { data: category, error: catError } = await supabase
        .from('service_categories')
        .select('id')
        .eq('slug', resolvedSlug)
        .maybeSingle();

      if (catError) {
        logQueryError(catMeta, catError, catQueryId);
        throw catError;
      }
      logQuerySuccess(catMeta, category ? 1 : 0, catQueryId);
      if (!category) return [];

      const { data, error } = await supabase
        .from('professionals')
        .select(PROFESSIONAL_SELECT)
        .eq('verified', true)
        .eq('category_id', category.id)
        .order('rating', { ascending: false });

      if (error) throw error;
      const rows = (data ?? []) as ProfessionalRow[];
      return mapProfessionalRows(rows, 'useProfessionalsByCategory()');
    },
    [],
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

  const detailMeta = {
    service: 'professionalsService',
    table: 'professional_detail',
    name: 'load',
    source: 'useProfessionalDetail()',
    context: { legacyId },
  };

  const proLookupMeta = {
    service: 'professionalsService',
    table: 'professionals',
    name: 'resolveForDetail',
    source: 'useProfessionalDetail()',
    context: { legacyId },
  };
  const proQueryId = logQueryStart(proLookupMeta);

  try {
    const { data: pro, error: proError } = await supabase
      .from('professionals')
      .select('id')
      .eq('legacy_id', legacyId)
      .maybeSingle();

    if (proError) {
      logQueryError(proLookupMeta, proError, proQueryId);
      return null;
    }
    logQuerySuccess(proLookupMeta, pro ? 1 : 0, proQueryId);
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
      {
        meta: {
          service: 'professionalsService',
          table: 'professional_services',
          name: 'list',
          source: 'useProfessionalDetail()',
        },
        res: servicesRes,
      },
      {
        meta: {
          service: 'professionalsService',
          table: 'professional_service_packages',
          name: 'list',
          source: 'useProfessionalDetail()',
        },
        res: packagesRes,
      },
      {
        meta: {
          service: 'professionalsService',
          table: 'professional_portfolio',
          name: 'list',
          source: 'useProfessionalDetail()',
        },
        res: portfolioRes,
      },
      {
        meta: {
          service: 'professionalsService',
          table: 'professional_zones',
          name: 'list',
          source: 'useProfessionalDetail()',
        },
        res: zonesRes,
      },
    ] as const;

    for (const { meta, res } of detailTables) {
      const queryId = logQueryStart(meta);
      if (res.error) {
        logQueryError(meta, res.error, queryId);
        throw res.error;
      }
      const count = Array.isArray(res.data) ? res.data.length : res.data ? 1 : 0;
      logQuerySuccess(meta, count, queryId);
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

    const zonesFromDb = ((zonesRes.data ?? []) as ZoneRow[]).map((z) => z.zone_name);
    const zones =
      zonesFromDb.length > 0
        ? zonesFromDb
        : professional.serviceAreas.length > 0
          ? [...professional.serviceAreas]
          : [];

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

export function getUrgentItemsFromProfessionals(
  professionals: Professional[],
  limit?: number,
): { professional: Professional; badge: string }[] {
  const items = professionals
    .filter((p) => Boolean(p.urgentBadge?.trim()))
    .map((professional) => ({
      professional,
      badge: professional.urgentBadge!.trim(),
    }));

  return limit ? items.slice(0, limit) : items;
}

/** Massimo professionisti nella sezione «Nuovi verificati» in Home. */
export const HOME_NEW_VERIFIED_LIMIT = 5;

function professionalNewnessTimestamp(professional: Professional): number {
  const raw = professional.verifiedAt ?? professional.createdAt;
  if (!raw) return 0;
  const timestamp = Date.parse(raw);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function compareProfessionalsByNewness(a: Professional, b: Professional): number {
  const byDate = professionalNewnessTimestamp(b) - professionalNewnessTimestamp(a);
  if (byDate !== 0) return byDate;

  if (Boolean(a.isNewFeatured) !== Boolean(b.isNewFeatured)) {
    return a.isNewFeatured ? -1 : 1;
  }

  return a.name.localeCompare(b.name, 'it');
}

export function getNewFeaturedFromProfessionals(
  professionals: Professional[],
  limit = HOME_NEW_VERIFIED_LIMIT,
): Professional[] {
  const sorted = professionals
    .filter((professional) => professional.verified)
    .sort(compareProfessionalsByNewness);

  return limit > 0 ? sorted.slice(0, limit) : sorted;
}
