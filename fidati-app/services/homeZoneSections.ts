import { PopularService } from '@/constants/homeMarketplace';
import {
  getTopProfessionals,
  getNewFeaturedFromProfessionals,
  getUrgentItemsFromProfessionals,
  HOME_NEW_VERIFIED_LIMIT,
} from '@/services/professionalsService';
import { CategorySlug, Professional } from '@/types';

export interface UrgentProfessionalItem {
  professional: Professional;
  badge: string;
}

export { HOME_NEW_VERIFIED_LIMIT };

export function getNewVerifiedSectionTitle(city: string): string {
  const longTitle = `Nuovi professionisti verificati operanti a ${city}`;
  const shortTitle = `Nuovi verificati a ${city}`;
  return longTitle.length > 42 ? shortTitle : longTitle;
}

export function getTopProfessionalsFromList(
  filteredProfessionals: Professional[],
  limit: number,
): Professional[] {
  return getTopProfessionals(filteredProfessionals, limit);
}

export function getPopularServicesInZone(
  filteredProfessionals: Professional[],
  popularServices: PopularService[],
): PopularService[] {
  const slugsInZone = new Set(filteredProfessionals.map((professional) => professional.categorySlug));
  return popularServices.filter((service) => slugsInZone.has(service.slug as CategorySlug));
}

export {
  getNewFeaturedFromProfessionals as getNewProfessionalsFromList,
  getUrgentItemsFromProfessionals,
};
