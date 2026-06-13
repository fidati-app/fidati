import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import {
  HOME_OFFERS,
  POPULAR_SERVICES,
} from '@/constants/homeMarketplace';
import { fetchHomeMarketplaceData, HomeMarketplaceData } from '@/services/homeService';

const EMPTY: HomeMarketplaceData = {
  popularServices: POPULAR_SERVICES,
  offers: HOME_OFFERS,
  reviews: [],
  professionals: [],
  topProfessionals: [],
  urgentItems: [],
  newProfessionals: [],
};

const HomeMarketplaceContext = createContext<HomeMarketplaceData>(EMPTY);

export function HomeMarketplaceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<HomeMarketplaceData>(EMPTY);

  useEffect(() => {
    let active = true;
    fetchHomeMarketplaceData().then((next) => {
      if (active) setData(next);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <HomeMarketplaceContext.Provider value={data}>{children}</HomeMarketplaceContext.Provider>
  );
}

/** Dati marketplace grezzi. Professionisti da Supabase via `fetchHomeMarketplaceData`. */
export function useHomeMarketplace(): HomeMarketplaceData {
  return useContext(HomeMarketplaceContext);
}
