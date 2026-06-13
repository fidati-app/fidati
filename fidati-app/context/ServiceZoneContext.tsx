import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getMunicipalityFilterName, resolveMunicipality } from '@/data/italianMunicipalities';
import { requestUserLocationCity } from '@/services/locationService';
import {
  countProfessionalsByCategory,
  filterProfessionalsByCity,
} from '@/services/zoneService';
import { loadStoredServiceCity, saveServiceCity } from '@/services/zoneStorage';
import { CategorySlug, ItalianMunicipality, Professional } from '@/types';

export type ZoneSelectionMode = 'location' | 'manual' | null;

interface ServiceZoneContextValue {
  selectedCity: string | null;
  selectedMunicipality: ItalianMunicipality | null;
  hasSelectedCity: boolean;
  selectionMode: ZoneSelectionMode;
  isReady: boolean;
  isLoadingLocation: boolean;
  locationDenied: boolean;
  showCityPicker: boolean;
  pickerRequired: boolean;
  filteredProfessionals: Professional[];
  categoryCounts: Partial<Record<CategorySlug, number>>;
  totalInZone: number;
  selectMunicipality: (municipality: ItalianMunicipality) => Promise<void>;
  selectCity: (city: string) => Promise<void>;
  clearSelectedCity: () => void;
  useMyLocation: () => Promise<void>;
  openCityPicker: (options?: { required?: boolean }) => void;
  /** Scroll Home in cima e apre il picker città (es. «Cambia zona»). */
  openChangeZone: () => void;
  registerHomeScrollToTop: (fn: (() => void) | null) => void;
  closeCityPicker: () => void;
}

const ServiceZoneContext = createContext<ServiceZoneContextValue | null>(null);

interface ServiceZoneProviderProps {
  children: ReactNode;
  professionals: Professional[];
}

export function ServiceZoneProvider({ children, professionals }: ServiceZoneProviderProps) {
  const [selectedMunicipality, setSelectedMunicipality] = useState<ItalianMunicipality | null>(
    null,
  );
  const [selectionMode, setSelectionMode] = useState<ZoneSelectionMode>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [pickerRequired, setPickerRequired] = useState(false);
  const homeScrollToTopRef = useRef<(() => void) | null>(null);

  const selectedCity = getMunicipalityFilterName(selectedMunicipality);

  useEffect(() => {
    let active = true;

    loadStoredServiceCity().then((stored) => {
      if (!active) return;
      if (stored) {
        setSelectedMunicipality(stored);
      } else {
        setShowCityPicker(true);
        setPickerRequired(true);
      }
      setIsReady(true);
    });

    return () => {
      active = false;
    };
  }, []);

  const applyMunicipality = useCallback(async (municipality: ItalianMunicipality, mode: ZoneSelectionMode) => {
    const resolved = resolveMunicipality(municipality) ?? municipality;
    setSelectedMunicipality(resolved);
    setSelectionMode(mode);
    setLocationDenied(false);
    setPickerRequired(false);
    setShowCityPicker(false);
    await saveServiceCity(resolved);
  }, []);

  const selectMunicipality = useCallback(
    async (municipality: ItalianMunicipality) => {
      if (!municipality.name?.trim()) return;
      await applyMunicipality(municipality, 'manual');
    },
    [applyMunicipality],
  );

  const selectCity = useCallback(
    async (city: string) => {
      const trimmed = city.trim();
      if (!trimmed) return;
      await selectMunicipality({
        name: trimmed,
        province: '',
        region: '',
        istatCode: '',
      });
    },
    [selectMunicipality],
  );

  const clearSelectedCity = useCallback(() => {
    setSelectedMunicipality(null);
    setSelectionMode(null);
    setPickerRequired(true);
    setShowCityPicker(true);
  }, []);

  const useMyLocation = useCallback(async () => {
    setIsLoadingLocation(true);
    setLocationDenied(false);

    const result = await requestUserLocationCity();

    setIsLoadingLocation(false);

    if (result.granted && result.municipality) {
      await applyMunicipality(result.municipality, 'location');
      return;
    }

    if (result.error === 'permission_denied') {
      setLocationDenied(true);
    }
  }, [applyMunicipality]);

  const openCityPicker = useCallback((options?: { required?: boolean }) => {
    setPickerRequired(options?.required ?? false);
    setShowCityPicker(true);
  }, []);

  const registerHomeScrollToTop = useCallback((fn: (() => void) | null) => {
    homeScrollToTopRef.current = fn;
  }, []);

  const openChangeZone = useCallback(() => {
    homeScrollToTopRef.current?.();
    setTimeout(() => {
      setPickerRequired(false);
      setShowCityPicker(true);
    }, 150);
  }, []);

  const closeCityPicker = useCallback(() => {
    if (pickerRequired && !selectedCity) return;
    setPickerRequired(false);
    setShowCityPicker(false);
  }, [pickerRequired, selectedCity]);

  const filteredProfessionals = useMemo(
    () => filterProfessionalsByCity(professionals, selectedCity),
    [professionals, selectedCity],
  );

  const categoryCounts = useMemo(
    () => (selectedCity ? countProfessionalsByCategory(filteredProfessionals) : {}),
    [filteredProfessionals, selectedCity],
  );

  const totalInZone = filteredProfessionals.length;
  const hasSelectedCity = Boolean(selectedCity?.trim());

  useEffect(() => {
    if (!__DEV__ || !isReady) return;

    console.log('[Fidati Home Zone]', {
      selectedCity,
      selectedMunicipality,
      'filteredProfessionals.length': filteredProfessionals.length,
      categoryCounts,
    });
  }, [isReady, selectedCity, selectedMunicipality, filteredProfessionals, categoryCounts]);

  const value = useMemo<ServiceZoneContextValue>(
    () => ({
      selectedCity,
      selectedMunicipality,
      hasSelectedCity,
      selectionMode,
      isReady,
      isLoadingLocation,
      locationDenied,
      showCityPicker,
      pickerRequired,
      filteredProfessionals,
      categoryCounts,
      totalInZone,
      selectMunicipality,
      selectCity,
      clearSelectedCity,
      useMyLocation,
      openCityPicker,
      openChangeZone,
      registerHomeScrollToTop,
      closeCityPicker,
    }),
    [
      selectedCity,
      selectedMunicipality,
      hasSelectedCity,
      selectionMode,
      isReady,
      isLoadingLocation,
      locationDenied,
      showCityPicker,
      pickerRequired,
      filteredProfessionals,
      categoryCounts,
      totalInZone,
      selectMunicipality,
      selectCity,
      clearSelectedCity,
      useMyLocation,
      openCityPicker,
      openChangeZone,
      registerHomeScrollToTop,
      closeCityPicker,
    ],
  );

  return <ServiceZoneContext.Provider value={value}>{children}</ServiceZoneContext.Provider>;
}

export function useServiceZone(): ServiceZoneContextValue {
  const context = useContext(ServiceZoneContext);
  if (!context) {
    throw new Error('useServiceZone must be used within ServiceZoneProvider');
  }
  return context;
}
