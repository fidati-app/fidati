import { ProService } from '@/types';



export interface ServicePriceInput {

  title: string;

  serviceSlug: string;

  minRaw: string;

  maxRaw: string;

  quoteRequired?: boolean;

  isCustom?: boolean;
}



export interface ParsedServicePrice {

  title: string;

  serviceSlug: string;

  isCustom?: boolean;

  priceMin: number | null;

  priceMax: number | null;

  quoteRequired: boolean;
}



type ServicePriceSource =
  | Pick<ProService, 'priceFrom' | 'quoteRequired'>
  | { priceMin?: number | null; priceFrom?: number; quoteRequired?: boolean };



function readServiceMinPrice(service: ServicePriceSource): number | null | undefined {
  if ('quoteRequired' in service && service.quoteRequired) {
    return null;
  }
  if ('priceFrom' in service && service.priceFrom != null && service.priceFrom > 0) {
    return service.priceFrom;
  }
  if ('priceMin' in service) {
    return service.priceMin;
  }
  return null;
}



/** Prezzo minimo tra i servizi attivi con prezzo > 0. */

export function getLowestActiveServicePrice(services: ServicePriceSource[]): number | null {

  const prices = services

    .map(readServiceMinPrice)

    .filter((p): p is number => p != null && Number.isFinite(p) && p > 0);

  if (prices.length === 0) return null;

  return Math.min(...prices);

}



/** Alias esplicito per il prezzo pubblico "Da X€". */

export function computeStartingPrice(

  services: { priceMin?: number | null; priceFrom?: number; quoteRequired?: boolean }[],

): number | null {

  return getLowestActiveServicePrice(services);

}



export function hasPricingPreviewData(services: ServicePriceInput[]): boolean {
  return services.some((service) => {
    if (service.quoteRequired && service.isCustom) {
      return true;
    }
    const min = parsePriceInput(service.minRaw);
    const max = parsePriceInput(service.maxRaw);
    return (min != null && min > 0) || (max != null && max > 0);
  });
}


/** Testo mostrato ai clienti: "Da X€" oppure preventivo su richiesta. */

export function formatClientFacingPrice(services: Pick<ProService, 'priceFrom' | 'quoteRequired'>[]): string {

  if (services.length > 0 && services.every((s) => s.quoteRequired)) {

    return 'Preventivo su richiesta';

  }

  const min = getLowestActiveServicePrice(services);

  if (min === null) return 'Preventivo su richiesta';

  return `Da ${min.toLocaleString('it-IT')}€`;

}



export function parsePriceInput(raw: string): number | null {

  const normalized = raw.replace(',', '.').trim();

  if (!normalized) return null;

  const value = Number(normalized);

  if (!Number.isFinite(value) || value <= 0) return null;

  return value;

}



export function formatServicePriceRangeLabel(

  priceMin: number | null,

  priceMax: number | null,

  quoteRequired = false,

): string {

  if (quoteRequired) {

    return 'Preventivo su richiesta';

  }

  if (priceMin != null && priceMax != null) {

    return `€${priceMin} – €${priceMax}`;

  }

  if (priceMax != null) {

    return `Fino a €${priceMax}`;

  }

  return '';

}



export function parseServicePrices(inputs: ServicePriceInput[]): ParsedServicePrice[] {

  return inputs.map((input) => ({

    title: input.title,

    serviceSlug: input.serviceSlug,

    priceMin: input.quoteRequired ? null : parsePriceInput(input.minRaw),

    priceMax: input.quoteRequired ? null : parsePriceInput(input.maxRaw),

    quoteRequired: Boolean(input.quoteRequired) && Boolean(input.isCustom),

    isCustom: Boolean(input.isCustom),

  }));

}



export function hasAnyServicePrice(services: ParsedServicePrice[]): boolean {

  return services.some((s) => !s.quoteRequired && (s.priceMin != null || s.priceMax != null));

}


