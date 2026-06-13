/**
 * Genera assets/data/italianMunicipalities.json da:
 * - comuni-ita API (dataset ISTAT aggiornato, ~7896 comuni a gen 2026)
 * - patch manuali per variazioni ISTAT 2026 (→ 7.894 comuni)
 * - opendatasicilia coordinate.csv come fallback lat/lng
 *
 * Esegui: npm run build:municipalities
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const cachePath = path.join(root, '_tmp_api_comuni.json');
const coordsPath = path.join(root, '_tmp_coords.csv');
const outPath = path.join(root, 'assets', 'data', 'italianMunicipalities.json');

const COMUNI_ITA_API = 'https://comuni-ita.nicolorebaioli.dev/comuni';

/** Comuni soppressi dopo l'ultimo snapshot API (ISTAT 2026). */
const SUPPRESSED_ISTAT_CODES = new Set([
  '018082', // Lirio → incorporato in Montalto Pavese (31/01/2026)
  '024027', // Castegnero → Castegnero Nanto (21/02/2026)
  '024071', // Nanto → Castegnero Nanto (21/02/2026)
]);

/** Nuovi comuni da aggiungere dopo l'ultimo snapshot API. */
const ADDED_MUNICIPALITIES = [
  {
    name: 'Castegnero Nanto',
    province: 'VI',
    region: 'Veneto',
    istatCode: '024129',
    population: 5925,
    latitude: 45.434,
    longitude: 11.583,
  },
];

async function loadApiComuni() {
  if (fs.existsSync(cachePath)) {
    try {
      const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      if (Array.isArray(cached) && cached.length >= 7890) {
        console.log(`Using cached API data (${cached.length} comuni) → ${cachePath}`);
        return cached;
      }
    } catch {
      // fall through to network fetch
    }
  }

  console.log(`Fetching ${COMUNI_ITA_API} ...`);
  const response = await fetch(COMUNI_ITA_API);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!Array.isArray(data) || data.length < 7890) {
    throw new Error(`Unexpected API payload: expected ~7896 comuni, got ${data?.length ?? 0}`);
  }

  fs.writeFileSync(cachePath, JSON.stringify(data));
  console.log(`Cached API data (${data.length} comuni) → ${cachePath}`);
  return data;
}

function loadCoordsFallback() {
  const coordsByIstat = new Map();
  if (!fs.existsSync(coordsPath)) return coordsByIstat;

  const lines = fs.readFileSync(coordsPath, 'utf8').split(/\r?\n/).slice(1);
  for (const line of lines) {
    if (!line.trim()) continue;
    const [rawCode, lat, lng] = line.split(',');
    const istatCode = String(rawCode).padStart(6, '0');
    const latitude = Number(lat);
    const longitude = Number(lng);
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      coordsByIstat.set(istatCode, { latitude, longitude });
    }
  }

  return coordsByIstat;
}

function mapApiEntry(entry, coordsFallback) {
  const istatCode = String(entry.codice).padStart(6, '0');
  const item = {
    name: entry.nome,
    province: entry.provincia?.sigla ?? '',
    region: entry.provincia?.regione ?? '',
    istatCode,
    population: entry.popolazione ?? 0,
  };

  const apiCoords = entry.coordinate;
  if (apiCoords && Number.isFinite(apiCoords.lat) && Number.isFinite(apiCoords.lng)) {
    item.latitude = Math.round(apiCoords.lat * 1e4) / 1e4;
    item.longitude = Math.round(apiCoords.lng * 1e4) / 1e4;
  } else {
    const fallback = coordsFallback.get(istatCode);
    if (fallback) {
      item.latitude = Math.round(fallback.latitude * 1e4) / 1e4;
      item.longitude = Math.round(fallback.longitude * 1e4) / 1e4;
    }
  }

  return item;
}

function enrichCastegneroNanto(municipalities, sourceEntries) {
  const castegnero = sourceEntries.find((e) => e.codice === '024027');
  const nanto = sourceEntries.find((e) => e.codice === '024071');
  const added = municipalities.find((m) => m.istatCode === '024129');
  if (!added || !castegnero || !nanto) return;

  added.population = (castegnero.popolazione ?? 0) + (nanto.popolazione ?? 0);

  const c1 = castegnero.coordinate;
  const c2 = nanto.coordinate;
  if (c1 && c2) {
    added.latitude = Math.round(((c1.lat + c2.lat) / 2) * 1e4) / 1e4;
    added.longitude = Math.round(((c1.lng + c2.lng) / 2) * 1e4) / 1e4;
  }
}

function validateMunicipalities(municipalities) {
  const required = [
    'Milano',
    'Roma',
    'Barletta',
    'Andria',
    'Trani',
    'Bisceglie',
    'Margherita di Savoia',
    'Castegnero Nanto',
  ];

  const suppressed = ['Lirio', 'Castegnero', 'Nanto'];
  const byIstat = new Map();
  const byNameProv = new Map();
  const errors = [];

  for (const municipality of municipalities) {
    if (byIstat.has(municipality.istatCode)) {
      errors.push(`Duplicate istatCode ${municipality.istatCode}`);
    }
    byIstat.set(municipality.istatCode, municipality);

    const key = `${municipality.name}|${municipality.province}`;
    if (byNameProv.has(key)) {
      errors.push(`Duplicate name+province ${key}`);
    }
    byNameProv.set(key, municipality);
  }

  for (const name of required) {
    if (!municipalities.some((m) => m.name === name)) {
      errors.push(`Missing required municipality: ${name}`);
    }
  }

  for (const name of suppressed) {
    if (municipalities.some((m) => m.name === name)) {
      errors.push(`Suppressed municipality still present: ${name}`);
    }
  }

  if (municipalities.length !== 7894) {
    errors.push(`Expected 7894 municipalities, got ${municipalities.length}`);
  }

  if (errors.length) {
    throw new Error(`Validation failed:\n- ${errors.join('\n- ')}`);
  }
}

async function main() {
  const apiComuni = await loadApiComuni();
  const coordsFallback = loadCoordsFallback();

  const municipalities = apiComuni
    .filter((entry) => !SUPPRESSED_ISTAT_CODES.has(String(entry.codice).padStart(6, '0')))
    .map((entry) => mapApiEntry(entry, coordsFallback));

  for (const added of ADDED_MUNICIPALITIES) {
    municipalities.push({ ...added });
  }

  enrichCastegneroNanto(municipalities, apiComuni);

  municipalities.sort((a, b) => a.name.localeCompare(b.name, 'it', { sensitivity: 'base' }));

  validateMunicipalities(municipalities);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(municipalities));

  console.log(`Wrote ${municipalities.length} municipalities → ${outPath}`);
  console.log(
    `With coordinates: ${municipalities.filter((m) => m.latitude != null).length}`,
  );
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
