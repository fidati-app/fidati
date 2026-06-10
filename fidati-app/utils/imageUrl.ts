import { PixelRatio } from 'react-native';

/** Ritaglio Unsplash centrato sui volti per il contenitore indicato */
export function withFaceCrop(uri: string, width: number, height: number): string {
  try {
    const url = new URL(uri);
    if (!url.hostname.includes('unsplash.com')) return uri;

    const scale = PixelRatio.get();
    url.searchParams.set('w', String(Math.round(width * scale)));
    url.searchParams.set('h', String(Math.round(height * scale)));
    url.searchParams.set('fit', 'crop');
    url.searchParams.set('crop', 'faces');

    return url.toString();
  } catch {
    return uri;
  }
}
