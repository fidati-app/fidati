#!/usr/bin/env node
/**
 * Applica le migration Barletta su Supabase remoto.
 * Richiede DATABASE_URL (connection string Postgres da Dashboard → Settings → Database).
 *
 * Uso:
 *   set DATABASE_URL=postgresql://postgres.[ref]:[password]@...
 *   node supabase/scripts/apply-barletta-migrations.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, '..', 'migrations');

const FILES = [
  '20260609_categories_v12.sql',
  '20260609_caldaie_condizionatori_split.sql',
  '20260609_professionals_zone_fields.sql',
  '20260609_professionals_barletta_seed.sql',
];

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error('DATABASE_URL mancante.');
  console.error('Copia la connection string da Supabase Dashboard → Project Settings → Database.');
  console.error('Oppure incolla manualmente i file SQL nell’ordine:');
  FILES.forEach((file, index) => console.error(`  ${index + 1}. supabase/migrations/${file}`));
  process.exit(1);
}

let pg;
try {
  pg = await import('pg');
} catch {
  console.error('Installa pg: npm install --save-dev pg (nella cartella supabase/scripts)');
  process.exit(1);
}

const client = new pg.default.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log('Connesso. Applicazione migration in ordine...\n');

  for (const file of FILES) {
    const sql = readFileSync(join(migrationsDir, file), 'utf8');
    console.log(`→ ${file}`);
    await client.query(sql);
    console.log(`  ✓ OK\n`);
  }

  const { rows } = await client.query(`
    SELECT category_slug, COUNT(*)::int AS n
    FROM professionals
    WHERE verified = true
      AND 'Barletta' = ANY(service_areas)
    GROUP BY category_slug
    ORDER BY category_slug
  `);

  console.log('Professionisti verificati con Barletta in service_areas per categoria:');
  console.table(rows);
} catch (error) {
  console.error('Errore:', error.message ?? error);
  process.exit(1);
} finally {
  await client.end();
}
