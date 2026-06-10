import {
  HOME_OFFERS,
  HomeOffer,
  NEW_PROFESSIONAL_IDS,
  POPULAR_SERVICES,
  PopularService,
  URGENT_PROFESSIONALS,
} from '@/constants/homeMarketplace';
import {
  computeHomeDataSource,
  formatHomeDataSourceTitle,
  getHomeFetchRegistry,
  getMockFallbackDetails,
  LOG_PREFIX,
} from '@/lib/supabaseDebug';
import { supabase } from '@/lib/supabase';
import { getProfessionalById } from '@/services/mockData';
import { CategoryIcon, Professional } from '@/types';

import {
  fetchNewFeaturedProfessionals,
  fetchProfessionals,
  fetchUrgentFromSupabase,
  getTopProfessionals,
  getTopProfessionalsByCategoryFromList,
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
  return (Array.isArray(rel) ? rel[0]?.slug : rel?.slug) ?? 'tuttofare';
}

export async function fetchPopularServices(): Promise<PopularService[]> {
  return withMockFallback(
    { service: 'homeService', table: 'home_popular_services' },
    async () => {
      const { data, error } = await supabase
        .from('home_popular_services')
        .select('*, service_categories ( slug )')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return (data as PopularRow[]).map((row) => ({
      id: row.legacy_id ?? row.id,
      title: row.title,
      icon: row.icon as CategoryIcon,
      slug: categorySlugFromPopular(row),
      rating: Number(row.rating),
      completedJobs: row.completed_jobs,
      avgPrice: Number(row.avg_price),
      imageUrl: row.image_url ?? '',
    }));
    },
    POPULAR_SERVICES,
  );
}

export async function fetchHomeOffers(): Promise<HomeOffer[]> {
  return withMockFallback(
    { service: 'homeService', table: 'home_offers' },
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

function mockUrgentItems(): { professional: Professional; badge: string }[] {
  return URGENT_PROFESSIONALS.map((item) => {
    const professional = getProfessionalById(item.professionalId);
    return professional ? { professional, badge: item.badge } : null;
  }).filter(Boolean) as { professional: Professional; badge: string }[];
}

function mockNewProfessionals(): Professional[] {
  return NEW_PROFESSIONAL_IDS.map((id) => getProfessionalById(id)).filter(
    Boolean,
  ) as Professional[];
}

export async function fetchHomeMarketplaceData(): Promise<HomeMarketplaceData> {
  const [popularServices, offers, reviews, professionals] = await Promise.all([
    fetchPopularServices(),
    fetchHomeOffers(),
    fetchHomeReviews(),
    fetchProfessionals(),
  ]);

  const topProfessionals = getTopProfessionals(professionals, 4);

  let urgentItems = mockUrgentItems();
  let newProfessionals = mockNewProfessionals();

  const urgentFromDb = await fetchUrgentFromSupabase(professionals);
  if (urgentFromDb.length > 0) {
    urgentItems = urgentFromDb;
  }

  const newFromDb = await fetchNewFeaturedProfessionals(professionals);
  if (newFromDb.length > 0) {
    newProfessionals = newFromDb;
  }

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
  }

  return result;
}

export { getTopProfessionalsByCategoryFromList };
