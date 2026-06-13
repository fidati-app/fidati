/**
 * Downloads category source images, resizes to max 1080px width, converts to WebP (q75).
 * Saves locally to supabase/storage/category-images/{slug}.webp
 * Optionally uploads to Supabase Storage bucket category-images.
 *
 * Env (optional upload): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Run: node supabase/scripts/optimize-category-images.mjs
 */
import { writeFileSync, statSync } from 'fs';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { OFFICIAL_CATEGORIES, STORAGE_BUCKET } from './category-catalog.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'storage', 'category-images');
const MAX_WIDTH = 1080;
const WEBP_QUALITY = 75;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function downloadImage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function processImage(slug, sourceUrl) {
  const input = await downloadImage(sourceUrl);
  const output = await sharp(input)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  await mkdir(OUT_DIR, { recursive: true });
  const filePath = join(OUT_DIR, `${slug}.webp`);
  writeFileSync(filePath, output);
  const size = statSync(filePath).size;
  console.log(`  ${slug}.webp — ${formatBytes(size)}`);
  return { filePath, buffer: output, size };
}

async function uploadToSupabase(slug, buffer) {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return false;

  const path = `${slug}.webp`;
  const url = `${supabaseUrl}/storage/v1/object/${STORAGE_BUCKET}/${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'image/webp',
      'x-upsert': 'true',
    },
    body: buffer,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Upload failed for ${slug}: ${res.status} ${body}`);
  }
  console.log(`  ↑ uploaded ${path}`);
  return true;
}

async function main() {
  console.log(`Processing ${OFFICIAL_CATEGORIES.length} category images → ${OUT_DIR}`);
  const canUpload = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (canUpload) console.log('Supabase upload: enabled');
  else console.log('Supabase upload: skipped (set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to upload)');

  let totalBytes = 0;
  for (const cat of OFFICIAL_CATEGORIES) {
    console.log(`\n${cat.slug}`);
    const { buffer, size } = await processImage(cat.slug, cat.sourceImage);
    totalBytes += size;
    if (canUpload) await uploadToSupabase(cat.slug, buffer);
  }

  console.log(`\nDone. Total local size: ${formatBytes(totalBytes)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
