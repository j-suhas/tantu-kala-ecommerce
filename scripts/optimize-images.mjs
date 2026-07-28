/**
 * Image pipeline (run: `npm run optimize`).
 *
 * WORKFLOW: keep your original photo in `image-masters/<slug>.<ext>` — any common
 * image format sharp can read (JPG, PNG, WebP, AVIF, TIFF, GIF; not HEIC) — outside
 * `public/`, kept local & git-ignored. Then run this. For every product in
 * products.json it regenerates, from the master, into public/images/products/:
 *   - <slug>.jpg  — compressed JPG fallback (~100–250 KB), even if the master is a PNG
 *   - <slug>.webp — what modern browsers actually load (via <picture>)
 * and public/og/<slug>.jpg (1200×630) for WhatsApp/Facebook link previews.
 *
 * It never ships PNGs and prunes stale files from BOTH public/images/products and
 * public/og so they stay in sync with the catalog. Idempotent: derived from masters.
 */
import sharp from 'sharp';
import { readFile, readdir, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'public', 'images', 'products'); // generated output (committed)
const ORIG = path.join(ROOT, 'image-masters'); // your originals (local, git-ignored)
const OG = path.join(ROOT, 'public', 'og');

const MAX_DISPLAY = 1400;
const MAX_WEBP = 1200;

async function main() {
  await mkdir(ORIG, { recursive: true });
  await mkdir(OG, { recursive: true });
  await mkdir(SRC, { recursive: true });

  // Index masters by base name (any extension), so we accept whatever format you saved
  // the original as — no hard-coded extension list to keep in sync.
  const masterByBase = new Map();
  for (const f of existsSync(ORIG) ? await readdir(ORIG) : []) {
    if (!f.includes('.')) continue;
    masterByBase.set(f.replace(/\.[^.]+$/, '').toLowerCase(), path.join(ORIG, f));
  }
  const findMaster = (base) => masterByBase.get(base.toLowerCase()) ?? null;

  const products = JSON.parse(await readFile(path.join(ROOT, 'src', 'data', 'products.json'), 'utf8'));
  const keepBase = new Set(); // <base> that should stay in public/images/products
  const keepOg = new Set(); // <slug>.jpg that should stay in public/og

  for (const p of products) {
    const base = String(p.image || '').replace(/\.[^.]+$/, '');
    if (!base || !p.slug) continue;
    keepBase.add(base);
    keepOg.add(`${p.slug}.jpg`);

    const master = findMaster(base);
    if (!master) {
      console.warn(`! no master in image-masters/ for "${base}" (product ${p.slug}) — skipped`);
      continue;
    }

    try {
      const img = sharp(master).rotate(); // decode + auto-orient once, then clone per output
      await img.clone()
        .resize({ width: MAX_DISPLAY, height: MAX_DISPLAY, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(SRC, `${base}.jpg`));
      await img.clone()
        .resize({ width: MAX_WEBP, withoutEnlargement: true })
        .webp({ quality: 78 }).toFile(path.join(SRC, `${base}.webp`));
      await img.clone()
        .resize(1200, 630, { fit: 'cover' })
        .jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(OG, `${p.slug}.jpg`));
      console.log(`optimized: ${base} (jpg + webp + og)`);
    } catch (err) {
      console.warn(`! failed to process master for "${p.slug}" (${path.basename(master)}): ${err.message}`);
    }
  }

  // Prune public/images/products: drop PNGs (we serve JPG) and anything not in the catalog.
  for (const ent of await readdir(SRC, { withFileTypes: true })) {
    if (ent.isDirectory()) continue;
    const f = ent.name;
    const ext = f.split('.').pop().toLowerCase();
    const base = f.replace(/\.[^.]+$/, '');
    if (ext === 'png' || (['jpg', 'jpeg', 'webp'].includes(ext) && !keepBase.has(base))) {
      await rm(path.join(SRC, f));
      console.log(`removed stale image: ${f}`);
    }
  }

  // Prune public/og: keep only current products' OG images + the default brand card.
  for (const ent of await readdir(OG, { withFileTypes: true })) {
    if (ent.isDirectory()) continue;
    const f = ent.name;
    if (f !== 'default.jpg' && !keepOg.has(f)) {
      await rm(path.join(OG, f));
      console.log(`removed stale og: ${f}`);
    }
  }

  // Default OG (brand card).
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#7A1F2B' } })
    .composite([{
      input: Buffer.from(
        `<svg width="1200" height="630"><text x="60" y="330" font-family="Georgia" font-size="86" fill="#FBF4E9">Tantu Kala</text>` +
        `<text x="62" y="400" font-family="Georgia" font-size="34" fill="#E8873A">Handmade crochet rakhis</text></svg>`
      ),
      top: 0, left: 0,
    }])
    .jpeg({ quality: 82 })
    .toFile(path.join(OG, 'default.jpg'));
  console.log('og: default.jpg');
}

main().catch((e) => { console.error(e); process.exit(1); });
