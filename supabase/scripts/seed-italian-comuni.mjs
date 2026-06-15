/**
 * Seed catalogo comuni italiani in city_catalog.
 * Fonte: comuni-json (open data, ~7900 comuni)
 *
 * Uso:
 *   node supabase/scripts/seed-italian-comuni.mjs
 *
 * Richiede SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY in env
 * (oppure VITE_SUPABASE_URL + service role da .env locale)
 */
import { createClient } from '@supabase/supabase-js';

const SOURCE =
  'https://raw.githubusercontent.com/matteocontrini/comuni-json/master/comuni.json';

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

if (!url || !key) {
  console.error('Imposta SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key);

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function main() {
  console.log('Scarico comuni italiani…');
  const res = await fetch(SOURCE);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const comuni = await res.json();

  console.log(`Trovati ${comuni.length} comuni. Upload a batch…`);

  const batchSize = 500;
  let inserted = 0;

  for (let i = 0; i < comuni.length; i += batchSize) {
    const chunk = comuni.slice(i, i + batchSize).map((c) => ({
      name: c.nome,
      province: c.sigla ?? c.provincia?.sigla ?? null,
      region: c.regione?.nome ?? 'Italia',
      istat_code: String(c.codice ?? c.codiceCatastale ?? ''),
      slug: slugify(c.nome),
      is_active: true,
      sort_order: 0,
    }));

    const { error } = await supabase.from('city_catalog').upsert(chunk, {
      onConflict: 'istat_code',
      ignoreDuplicates: false,
    });

    if (error) {
      // fallback se unique istat non ancora migrato
      const { error: err2 } = await supabase.from('city_catalog').upsert(chunk, {
        onConflict: 'name,province',
      });
      if (err2) {
        console.error('Batch error', i, err2.message);
        process.exit(1);
      }
    }

    inserted += chunk.length;
    console.log(`  ${inserted}/${comuni.length}`);
  }

  console.log('Completato.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
