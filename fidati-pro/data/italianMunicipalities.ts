import municipalitiesData from '@/constants/italianMunicipalities.json';

export type ItalianMunicipality = {
  istatCode: string;
  name: string;
  province: string;
  region: string;
  population?: number;
};

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

export function getMunicipalityCount(): number {
  return MUNICIPALITIES.length;
}

export function searchMunicipalities(query: string, limit = 30): ItalianMunicipality[] {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return [];
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
  ).map(({ normalizedName: _normalizedName, ...municipality }) => municipality);
}

export function resolveMunicipalityByName(name: string): ItalianMunicipality | null {
  return findMunicipalitiesByName(name)[0] ?? null;
}
