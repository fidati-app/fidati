import {
  formatMunicipalityLabel,
  normalizeSearchText,
  resolveMunicipalityByName,
  searchMunicipalities,
  type ItalianMunicipality,
} from '@/data/italianMunicipalities';

export type CityCatalogResult = {
  id: string;
  name: string;
  province: string | null;
  region: string;
  label: string;
};

function mapMunicipality(row: ItalianMunicipality): CityCatalogResult {
  return {
    id: row.istatCode,
    name: row.name,
    province: row.province,
    region: row.region,
    label: formatMunicipalityLabel(row),
  };
}

/** Ricerca locale su ~7900 comuni ISTAT — stessa logica di fidati-app. */
export function searchCityCatalog(query: string, limit = 20): CityCatalogResult[] {
  const trimmed = query.trim();
  if (trimmed.length < 1) return [];

  return searchMunicipalities(trimmed, limit).map(mapMunicipality);
}

export function findCityCatalogExactMatch(query: string): CityCatalogResult | null {
  const trimmed = query.trim();
  if (trimmed.length < 1) return null;

  const match = resolveMunicipalityByName(trimmed);
  if (match) return mapMunicipality(match);

  const results = searchCityCatalog(trimmed, 12);
  const normalized = normalizeSearchText(trimmed);

  return (
    results.find(
      (row) =>
        normalizeSearchText(row.name) === normalized ||
        normalizeSearchText(row.label) === normalized,
    ) ?? null
  );
}
