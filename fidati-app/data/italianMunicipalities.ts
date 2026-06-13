import municipalitiesData from '@/assets/data/italianMunicipalities.json';
import { ItalianMunicipality } from '@/types';

const MUNICIPALITIES = municipalitiesData as ItalianMunicipality[];

interface IndexedMunicipality extends ItalianMunicipality {
  normalizedName: string;
}

function municipalitySearchScore(
  municipality: IndexedMunicipality,
  matchType: 'startsWith' | 'contains',
): number {
  const populationBoost = Math.min(municipality.population ?? 0, 500_000) / 500_000;
  const lengthPenalty = municipality.name.length / 100;
  const matchPenalty = matchType === 'startsWith' ? 0 : 1;

  return matchPenalty - populationBoost + lengthPenalty;
}

function sortSearchResults(
  items: IndexedMunicipality[],
  matchType: 'startsWith' | 'contains',
): ItalianMunicipality[] {
  return [...items]
    .sort((a, b) => {
      const scoreDiff =
        municipalitySearchScore(a, matchType) - municipalitySearchScore(b, matchType);
      if (scoreDiff !== 0) return scoreDiff;
      return a.name.localeCompare(b.name, 'it', { sensitivity: 'base' });
    })
    .map(({ normalizedName: _normalizedName, ...municipality }) => municipality);
}

const INDEXED_MUNICIPALITIES: IndexedMunicipality[] = MUNICIPALITIES.map((municipality) => ({
  ...municipality,
  normalizedName: normalizeSearchText(municipality.name),
}));

const POPULAR_MUNICIPALITIES: ItalianMunicipality[] = [...INDEXED_MUNICIPALITIES]
  .sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
  .slice(0, 30)
  .map(({ normalizedName: _normalizedName, ...municipality }) => municipality);

/** Stable alphabetically sorted list for virtualized browsing (7.894 comuni ISTAT). */
export const ALL_MUNICIPALITIES_SORTED: ItalianMunicipality[] = [...MUNICIPALITIES].sort(
  (a, b) => a.name.localeCompare(b.name, 'it', { sensitivity: 'base' }),
);

const BY_ISTAT = new Map<string, ItalianMunicipality>(
  MUNICIPALITIES.map((municipality) => [municipality.istatCode, municipality]),
);

export function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[''`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatMunicipalityLabel(municipality: ItalianMunicipality): string {
  return `${municipality.name}, ${municipality.province}`;
}

export function getAllMunicipalities(): readonly ItalianMunicipality[] {
  return MUNICIPALITIES;
}

export function getMunicipalityCount(): number {
  return MUNICIPALITIES.length;
}

export function getPopularMunicipalities(limit = 30): ItalianMunicipality[] {
  return POPULAR_MUNICIPALITIES.slice(0, limit);
}

export function searchMunicipalities(query: string, limit = 30): ItalianMunicipality[] {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return getPopularMunicipalities(limit);
  }

  const exact: IndexedMunicipality[] = [];
  const startsWith: IndexedMunicipality[] = [];
  const contains: IndexedMunicipality[] = [];

  for (const municipality of INDEXED_MUNICIPALITIES) {
    if (municipality.normalizedName === normalizedQuery) {
      exact.push(municipality);
    } else if (municipality.normalizedName.startsWith(normalizedQuery)) {
      startsWith.push(municipality);
    } else if (municipality.normalizedName.includes(normalizedQuery)) {
      contains.push(municipality);
    }
  }

  const stripIndex = ({ normalizedName: _normalizedName, ...municipality }: IndexedMunicipality) =>
    municipality;

  return [
    ...exact.map(stripIndex),
    ...sortSearchResults(startsWith, 'startsWith'),
    ...sortSearchResults(contains, 'contains'),
  ].slice(0, limit);
}

export function findMunicipalitiesByName(name: string): ItalianMunicipality[] {
  const normalized = normalizeSearchText(name);
  if (!normalized) return [];

  return INDEXED_MUNICIPALITIES.filter(
    (municipality) => municipality.normalizedName === normalized,
  );
}

function normalizeProvinceHint(value?: string | null): string | null {
  if (!value?.trim()) return null;
  const cleaned = value.trim();
  if (cleaned.length === 2) return cleaned.toUpperCase();
  return normalizeSearchText(cleaned);
}

function matchesProvinceHint(municipality: ItalianMunicipality, hint: string | null): boolean {
  if (!hint) return false;
  if (hint.length === 2) return municipality.province.toUpperCase() === hint;
  return (
    normalizeSearchText(municipality.province) === hint ||
    normalizeSearchText(municipality.region) === hint
  );
}

export function matchMunicipalityFromGeocode(
  city?: string | null,
  subregion?: string | null,
  region?: string | null,
): ItalianMunicipality | null {
  const provinceHint = normalizeProvinceHint(subregion) ?? normalizeProvinceHint(region);

  for (const candidateName of [city, subregion]) {
    if (!candidateName?.trim()) continue;

    const exactMatches = findMunicipalitiesByName(candidateName);
    if (exactMatches.length === 1) return exactMatches[0];

    if (exactMatches.length > 1 && provinceHint) {
      const withProvince = exactMatches.find((municipality) =>
        matchesProvinceHint(municipality, provinceHint),
      );
      if (withProvince) return withProvince;
    }

    if (exactMatches.length > 0) return exactMatches[0];
  }

  const normalizedCity = city ? normalizeSearchText(city) : '';
  if (!normalizedCity) return null;

  const partialMatches = searchMunicipalities(normalizedCity, 30).filter((municipality) => {
    const normalizedName = normalizeSearchText(municipality.name);
    return (
      normalizedName === normalizedCity ||
      normalizedName.startsWith(normalizedCity) ||
      normalizedName.includes(normalizedCity)
    );
  });

  if (partialMatches.length === 1) return partialMatches[0];

  if (partialMatches.length > 1 && provinceHint) {
    const withProvince = partialMatches.find((municipality) =>
      matchesProvinceHint(municipality, provinceHint),
    );
    if (withProvince) return withProvince;
  }

  return partialMatches[0] ?? null;
}

export function resolveMunicipalityByName(name: string): ItalianMunicipality | null {
  const matches = findMunicipalitiesByName(name);
  return matches[0] ?? null;
}

export function resolveMunicipality(input: ItalianMunicipality | string): ItalianMunicipality | null {
  if (typeof input === 'string') {
    return resolveMunicipalityByName(input);
  }
  if (input.istatCode && BY_ISTAT.has(input.istatCode)) {
    return BY_ISTAT.get(input.istatCode) ?? input;
  }
  return input;
}

export function getMunicipalityFilterName(municipality: ItalianMunicipality | null): string | null {
  return municipality?.name?.trim() || null;
}
