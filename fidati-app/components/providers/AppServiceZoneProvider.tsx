import { ReactNode } from 'react';

import { ServiceCityPickerModal } from '@/components/zone/ServiceCityPicker';
import { HomeMarketplaceProvider, useHomeMarketplace } from '@/context/HomeMarketplaceContext';
import { ServiceZoneProvider } from '@/context/ServiceZoneContext';

function ServiceZoneBridge({ children }: { children: ReactNode }) {
  const { professionals } = useHomeMarketplace();

  return (
    <ServiceZoneProvider professionals={professionals}>
      {children}
      <ServiceCityPickerModal />
    </ServiceZoneProvider>
  );
}

export function AppServiceZoneProvider({ children }: { children: ReactNode }) {
  return (
    <HomeMarketplaceProvider>
      <ServiceZoneBridge>{children}</ServiceZoneBridge>
    </HomeMarketplaceProvider>
  );
}
