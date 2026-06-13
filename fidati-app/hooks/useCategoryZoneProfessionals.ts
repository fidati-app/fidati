import { useMemo } from 'react';

import { useServiceZone } from '@/context/ServiceZoneContext';
import { filterProfessionalsByCategory } from '@/services/zoneService';
import { CategorySlug } from '@/types';

export function useCategoryZoneProfessionals(categorySlug: CategorySlug) {
  const { filteredProfessionals, selectedCity, hasSelectedCity, openCityPicker, openChangeZone } =
    useServiceZone();

  const categoryProfessionals = useMemo(
    () => filterProfessionalsByCategory(filteredProfessionals, categorySlug),
    [filteredProfessionals, categorySlug],
  );

  return {
    categoryProfessionals,
    selectedCity,
    hasSelectedCity,
    openCityPicker,
    openChangeZone,
    hasCategoryProfessionals: hasSelectedCity && categoryProfessionals.length > 0,
  };
}
