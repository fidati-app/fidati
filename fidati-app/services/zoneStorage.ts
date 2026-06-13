import { ZONE_STORAGE_KEY } from '@/constants/serviceZones';
import { ItalianMunicipality } from '@/types';

let memoryMunicipality: ItalianMunicipality | null = null;

function parseStoredMunicipality(raw: string): ItalianMunicipality | null {
  try {
    const parsed = JSON.parse(raw) as ItalianMunicipality;
    if (parsed?.name?.trim()) {
      return {
        name: parsed.name.trim(),
        province: parsed.province ?? '',
        region: parsed.region ?? '',
        istatCode: parsed.istatCode ?? '',
        latitude: parsed.latitude,
        longitude: parsed.longitude,
      };
    }
  } catch {
    // Legacy plain string storage.
  }

  const legacyName = raw.trim();
  return legacyName
    ? { name: legacyName, province: '', region: '', istatCode: '' }
    : null;
}

/**
 * Persistenza locale opzionale.
 * Quando `@react-native-async-storage/async-storage` sarà installato:
 *
 * ```ts
 * import AsyncStorage from '@react-native-async-storage/async-storage';
 * await AsyncStorage.setItem(ZONE_STORAGE_KEY, JSON.stringify(municipality));
 * ```
 */
async function readFromStorage(): Promise<string | null> {
  return null;
}

async function writeToStorage(value: string | null): Promise<void> {
  void ZONE_STORAGE_KEY;
  void value;
}

export async function loadStoredServiceCity(): Promise<ItalianMunicipality | null> {
  const stored = await readFromStorage();
  if (stored) {
    memoryMunicipality = parseStoredMunicipality(stored);
    return memoryMunicipality;
  }
  return memoryMunicipality;
}

export async function saveServiceCity(municipality: ItalianMunicipality): Promise<void> {
  memoryMunicipality = municipality;
  await writeToStorage(JSON.stringify(municipality));
}

export async function clearStoredServiceCity(): Promise<void> {
  memoryMunicipality = null;
  await writeToStorage(null);
}
