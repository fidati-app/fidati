import { CATEGORY_OFFERS, CategoryOffer } from '@/constants/categoryServices';
import { Professional } from '@/types';

const PROFESSIONAL_IDS_WITH_OFFERS = new Set(['1', '2', '3', '5', '7', '9', '11']);

export function getProfessionalOffers(professional: Professional): CategoryOffer[] {
  if (!PROFESSIONAL_IDS_WITH_OFFERS.has(professional.id)) {
    return [];
  }
  return CATEGORY_OFFERS[professional.categorySlug].slice(0, 3);
}
