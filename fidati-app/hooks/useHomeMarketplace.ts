import { useEffect, useState } from 'react';

import {
  HOME_OFFERS,
  HOME_REVIEWS,
  NEW_PROFESSIONAL_IDS,
  POPULAR_SERVICES,
  URGENT_PROFESSIONALS,
} from '@/constants/homeMarketplace';
import { fetchHomeMarketplaceData, HomeMarketplaceData } from '@/services/homeService';
import { getProfessionalById, MOCK_PROFESSIONALS } from '@/services/mockData';
import { Professional } from '@/types';

const mockTopProfessionals = [...MOCK_PROFESSIONALS]
  .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
  .slice(0, 4);

const mockUrgentItems = URGENT_PROFESSIONALS.map((item) => {
  const professional = getProfessionalById(item.professionalId);
  return professional ? { professional, badge: item.badge } : null;
}).filter(Boolean) as { professional: Professional; badge: string }[];

const mockNewProfessionals = NEW_PROFESSIONAL_IDS.map((id) => getProfessionalById(id)).filter(
  Boolean,
) as Professional[];

const INITIAL: HomeMarketplaceData = {
  popularServices: POPULAR_SERVICES,
  offers: HOME_OFFERS,
  reviews: HOME_REVIEWS,
  professionals: MOCK_PROFESSIONALS,
  topProfessionals: mockTopProfessionals,
  urgentItems: mockUrgentItems,
  newProfessionals: mockNewProfessionals,
};

export function useHomeMarketplace(): HomeMarketplaceData {
  const [data, setData] = useState<HomeMarketplaceData>(INITIAL);

  useEffect(() => {
    let active = true;
    fetchHomeMarketplaceData().then((next) => {
      if (active) setData(next);
    });
    return () => {
      active = false;
    };
  }, []);

  return data;
}
