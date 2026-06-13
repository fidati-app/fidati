import {
  getOfficialCategoryName,
  isOfficialCategorySlug,
  resolveCategorySlug,
  sanitizeLegacyServiceLabel,
} from '@/constants/categoryCatalog';
import {
  HOME_OFFERS,
  HomeOffer,
  POPULAR_SERVICES,
  PopularService,
} from '@/constants/homeMarketplace';
import {
  computeHomeDataSource,
  formatHomeDataSourceTitle,
  getHomeFetchRegistry,
  getMockFallbackDetails,
  LOG_PREFIX,
} from '@/lib/supabaseDebug';
import { supabase } from '@/lib/supabase';
import { CategoryIcon, Professional } from '@/types';

import {
  fetchProfessionals,
  getNewFeaturedFromProfessionals,
  getTopProfessionals,
  getTopProfessionalsByCategoryFromList,
  getUrgentItemsFromProfessionals,
} from './professionalsService';
import { fetchHomeReviews } from './reviewsService';
import { withMockFallback } from './supabaseUtils';

interface PopularRow {
  id: string;
  legacy_id: string | null;
  title: string;
  icon: string;
  rating: number;
  completed_jobs: number;
  avg_price: number;
  image_url: string | null;
  service_categories: { slug: string } | { slug: string }[] | null;
}

interface OfferRow {
  id: string;
  legacy_id: string | null;
  title: string;
  highlight: string;
  subtitle: string;
}

function categorySlugFromPopular(row: PopularRow): string {
  const rel = row.service_categories;
  const slug = Array.isArray(rel) ? rel[0]?.slug : rel?.slug;
  return resolveCategorySlug(slug);
}

function mapPopularService(row: PopularRow): PopularService | null {
  const slug = categorySlugFromPopular(row);
  if (!isOfficialCategorySlug(slug)) return null;

  return {
    id: row.legacy_id ?? row.id,
    title: sanitizeLegacyServiceLabel(row.title) || getOfficialCategoryName(slug),
    icon: row.icon as CategoryIcon,
    slug,
    rating: Number(row.rating),
    completedJobs: row.completed_jobs,
    avgPrice: Number(row.avg_price),
    imageUrl: row.image_url ?? '',
  };
}

export async function fetchPopularServices(): Promise<PopularService[]> {
  return withMockFallback(
    {
      service: 'homeService',
      table: 'home_popular_services',
      name: 'list',
      source: 'fetchHomeMarketplaceData()',
    },
    async () => {
      const { data, error } = await supabase
        .from('home_popular_services')
        .select('*, service_categories ( slug )')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      const mapped = (data as PopularRow[])
        .map(mapPopularService)
        .filter((item): item is PopularService => item !== null);
      return mapped.length > 0 ? mapped : POPULAR_SERVICES;
    },
    POPULAR_SERVICES,
  );
}

export async function fetchHomeOffers(): Promise<HomeOffer[]> {
  return withMockFallback(
    {
      service: 'homeService',
      table: 'home_offers',
      name: 'list',
      source: 'fetchHomeMarketplaceData()',
    },
    async () => {
      const { data, error } = await supabase
        .from('home_offers')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return (data as OfferRow[]).map((row) => ({
        id: row.legacy_id ?? row.id,
        title: row.title,
        highlight: row.highlight,
        subtitle: row.subtitle,
      }));
    },
    HOME_OFFERS,
  );
}

export interface HomeMarketplaceData {
  popularServices: PopularService[];
  offers: HomeOffer[];
  reviews: Awaited<ReturnType<typeof fetchHomeReviews>>;
  professionals: Professional[];
  topProfessionals: Professional[];
  urgentItems: { professional: Professional; badge: string }[];
  newProfessionals: Professional[];
}

const EMPTY_MARKETPLACE: HomeMarketplaceData = {
  popularServices: POPULAR_SERVICES,
  offers: HOME_OFFERS,
  reviews: [],
  professionals: [],
  topProfessionals: [],
  urgentItems: [],
  newProfessionals: [],
};

export async function fetchHomeMarketplaceData(): Promise<HomeMarketplaceData> {
  const [popularServices, offers, reviews, professionals] = await Promise.all([
    fetchPopularServices(),
    fetchHomeOffers(),
    fetchHomeReviews(),
    fetchProfessionals(),
  ]);

  const topProfessionals = getTopProfessionals(professionals, 4);
  const urgentItems = getUrgentItemsFromProfessionals(professionals, 6);
  const newProfessionals = getNewFeaturedFromProfessionals(professionals);

  const result = {
    popularServices,
    offers,
    reviews,
    professionals,
    topProfessionals,
    urgentItems,
    newProfessionals,
  };

  if (__DEV__) {
    console.log(`${LOG_PREFIX} Home registry:`, getHomeFetchRegistry());
    console.log(`${LOG_PREFIX} Home badge → ${formatHomeDataSourceTitle(computeHomeDataSource())}`);
    const fallbacks = getMockFallbackDetails();
    if (fallbacks.length > 0) {
      console.log(`${LOG_PREFIX} Tabelle in fallback mock:`, fallbacks);
    }
    console.log(`${LOG_PREFIX} Professionisti Supabase:`, professionals.length);
  }

  return result;
}

export { getTopProfessionalsByCategoryFromList };
