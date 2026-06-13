import * as Location from 'expo-location';

import { matchMunicipalityFromGeocode } from '@/data/italianMunicipalities';
import { ItalianMunicipality } from '@/types';

export interface LocationCityResult {
  granted: boolean;
  municipality: ItalianMunicipality | null;
  error?: string;
}

export async function requestUserLocationCity(): Promise<LocationCityResult> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { granted: false, municipality: null, error: 'permission_denied' };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const places = await Location.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });

    const place = places[0];
    const municipality = matchMunicipalityFromGeocode(
      place?.city ?? place?.name,
      place?.subregion ?? place?.district,
      place?.region,
    );

    if (!municipality) {
      return { granted: true, municipality: null, error: 'geocode_no_match' };
    }

    return { granted: true, municipality };
  } catch {
    return { granted: false, municipality: null, error: 'location_failed' };
  }
}
