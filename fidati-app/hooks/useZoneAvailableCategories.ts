import { useMemo } from 'react';

import {
  getHomePrimaryCategories,
  getHomeSecondaryCategories,
} from '@/constants/categoryCatalog';
import { useServiceZone } from '@/context/ServiceZoneContext';
import { useCategories } from '@/hooks/useCategories';
import { filterCategoriesWithProsInZone } from '@/services/zoneService';

export { categoryHasProsInZone, filterCategoriesWithProsInZone } from '@/services/zoneService';

export function useZoneAvailableCategories() {
  const categories = useCategories();
  const { categoryCounts, hasSelectedCity, filteredProfessionals, totalInZone, selectedCity } =
    useServiceZone();

  const availableCategories = useMemo(
    () =>
      hasSelectedCity
        ? filterCategoriesWithProsInZone(categories, categoryCounts)
        : categories,
    [categories, categoryCounts, hasSelectedCity],
  );

  const availablePrimaryCategories = useMemo(
    () =>
      hasSelectedCity
        ? filterCategoriesWithProsInZone(getHomePrimaryCategories(categories), categoryCounts)
        : getHomePrimaryCategories(categories),
    [categories, categoryCounts, hasSelectedCity],
  );

  const availableSecondaryCategories = useMemo(
    () =>
      hasSelectedCity
        ? filterCategoriesWithProsInZone(getHomeSecondaryCategories(categories), categoryCounts)
        : getHomeSecondaryCategories(categories),
    [categories, categoryCounts, hasSelectedCity],
  );

  const availableCategorySlugs = useMemo(
    () => new Set(availableCategories.map((category) => category.slug)),
    [availableCategories],
  );

  return {
    availableCategories,
    availablePrimaryCategories,
    availableSecondaryCategories,
    availableCategorySlugs,
    categoryCounts,
    hasSelectedCity,
    selectedCity,
    filteredProfessionals,
    hasProfessionalsInZone: hasSelectedCity && totalInZone > 0,
    totalInZone,
  };
}
