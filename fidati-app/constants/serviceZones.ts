import { ServiceCity } from '@/types';

export const SUPPORTED_SERVICE_CITIES: readonly ServiceCity[] = [
  'Barletta',
  'Andria',
  'Trani',
  'Bisceglie',
  'Margherita di Savoia',
] as const;

export const PROFESSIONAL_BASE_CITIES: readonly ServiceCity[] = [
  'Barletta',
  'Andria',
  'Trani',
] as const;

export const DEFAULT_SERVICE_CITY: ServiceCity = 'Barletta';

export const ZONE_STORAGE_KEY = '@fidati/selected-service-city';
