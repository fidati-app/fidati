import { useMemo } from 'react';

import { HOME_CAROUSEL_PREVIEW_LIMIT } from '@/constants/categoryCatalog';
import { useServiceZone } from '@/context/ServiceZoneContext';
import { useHomeMarketplace } from '@/context/HomeMarketplaceContext';
import {
  getNewProfessionalsFromList,
  getPopularServicesInZone,
  getTopProfessionalsFromList,
  getUrgentItemsFromProfessionals,
  HOME_NEW_VERIFIED_LIMIT,
} from '@/services/homeZoneSections';

/**
 * Sezioni Home derivate esclusivamente da `filteredProfessionals` (zona selezionata).
 * Professionisti caricati da Supabase in `useHomeMarketplace`.
 */
export function useHomeFilteredSections() {
  const { filteredProfessionals, totalInZone, hasSelectedCity, ...zoneState } = useServiceZone();
  const { popularServices, offers, reviews } = useHomeMarketplace();

  const filteredPopularServices = useMemo(
    () => getPopularServicesInZone(filteredProfessionals, popularServices),
    [filteredProfessionals, popularServices],
  );

  const filteredUrgentItems = useMemo(
    () => getUrgentItemsFromProfessionals(filteredProfessionals, HOME_CAROUSEL_PREVIEW_LIMIT),
    [filteredProfessionals],
  );

  const filteredTopProfessionals = useMemo(
    () => getTopProfessionalsFromList(filteredProfessionals, HOME_CAROUSEL_PREVIEW_LIMIT),
    [filteredProfessionals],
  );

  const filteredNewProfessionals = useMemo(
    () => getNewProfessionalsFromList(filteredProfessionals, HOME_NEW_VERIFIED_LIMIT),
    [filteredProfessionals],
  );

  return {
    filteredProfessionals,
    filteredPopularServices,
    filteredUrgentItems,
    filteredTopProfessionals,
    filteredNewProfessionals,
    offers,
    reviews,
    totalInZone,
    hasSelectedCity,
    hasFilteredProfessionals: hasSelectedCity && filteredProfessionals.length > 0,
    ...zoneState,
  };
}
