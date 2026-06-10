import { useMemo } from 'react';

import {
  getAvailableToday,
  getProfessionalById,
  getProfessionalsByCategory,
  getRecommendedProfessionals,
} from '@/services/mockData';
import { CategorySlug } from '@/types';

export function useRecommendedProfessionals() {
  return useMemo(() => getRecommendedProfessionals(), []);
}

export function useAvailableToday() {
  return useMemo(() => getAvailableToday(), []);
}

export function useProfessionalsByCategory(slug: string) {
  return useMemo(() => getProfessionalsByCategory(slug), [slug]);
}

export function useProfessional(id: string) {
  return useMemo(() => getProfessionalById(id), [id]);
}

export function isValidCategorySlug(slug: string): slug is CategorySlug {
  return ['pulizie', 'idraulici', 'elettricisti', 'giardinieri', 'tuttofare'].includes(slug);
}
