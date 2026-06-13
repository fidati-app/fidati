import { sanitizeLegacyServiceLabel } from '@/constants/categoryCatalog';
import { HOME_REVIEWS, HomeReview } from '@/constants/homeMarketplace';
import { supabase } from '@/lib/supabase';
import { logQueryError, logQueryStart, logQuerySuccess } from '@/lib/supabaseDebug';

import { withMockFallback } from './supabaseUtils';

interface ReviewRow {
  id: string;
  legacy_id: string | null;
  rating: number;
  body: string;
  service_title: string | null;
  client_display_name: string | null;
}

function mapHomeReview(row: ReviewRow): HomeReview {
  return {
    id: row.legacy_id ?? row.id,
    clientName: row.client_display_name ?? 'Cliente Fidati',
    rating: Number(row.rating),
    text: row.body,
    service: sanitizeLegacyServiceLabel(row.service_title),
  };
}

const HOME_REVIEWS_META = {
  service: 'reviewsService',
  table: 'reviews',
  name: 'listHome',
  source: 'fetchHomeMarketplaceData()',
};

export async function fetchHomeReviews(limit = 10): Promise<HomeReview[]> {
  return withMockFallback(
    HOME_REVIEWS_META,
    async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, legacy_id, rating, body, service_title, client_display_name')
        .eq('is_published', true)
        .order('review_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data as ReviewRow[]).map(mapHomeReview);
    },
    HOME_REVIEWS,
  );
}

export async function fetchReviewsByProfessionalLegacyId(
  legacyId: string,
  limit = 20,
): Promise<HomeReview[]> {
  const proMeta = {
    service: 'reviewsService',
    table: 'professionals',
    name: 'resolveByLegacyId',
    source: 'fetchReviewsByProfessionalLegacyId()',
    context: { legacyId },
  };
  const reviewsMeta = {
    service: 'reviewsService',
    table: 'reviews',
    name: 'listByProfessional',
    source: 'fetchReviewsByProfessionalLegacyId()',
    context: { legacyId },
  };

  const proQueryId = logQueryStart(proMeta);
  const { data: pro, error: proError } = await supabase
    .from('professionals')
    .select('id')
    .eq('legacy_id', legacyId)
    .maybeSingle();

  if (proError) {
    logQueryError(proMeta, proError, proQueryId);
    return [];
  }
  logQuerySuccess(proMeta, pro ? 1 : 0, proQueryId);

  if (!pro) return [];

  const reviewsQueryId = logQueryStart(reviewsMeta);
  const { data, error } = await supabase
    .from('reviews')
    .select('id, legacy_id, rating, body, service_title, client_display_name')
    .eq('professional_id', pro.id)
    .eq('is_published', true)
    .order('review_date', { ascending: false })
    .limit(limit);

  if (error) {
    logQueryError(reviewsMeta, error, reviewsQueryId);
    throw error;
  }
  logQuerySuccess(reviewsMeta, data?.length ?? 0, reviewsQueryId);
  return (data as ReviewRow[]).map(mapHomeReview);
}
