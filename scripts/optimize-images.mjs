/**
 * Image pipeline (run: `npm run optimize`).
 *
 * WORKFLOW: keep your original photo (any size/format) in `image-masters/<slug>.<ext>`
 * (outside public/, kept local, git-ignored). Then run this. For every product in
 * products.json it regenerates, from the master, into public/images/products/:
 *   - <slug>.jpg  — compressed JPG fallback (~100–250 KB), even if the master is a PNG
 *   - <slug>.webp — what modern browsers actually load (via <picture>)
 * and public/og/<slug>.jpg (1200×630) for WhatsApp/Facebook link previews.
 *
 * We never ship PNGs (huge for photos) — the script deletes stale PNGs and any served
 * files that don't belong to a current product. Idempotent: always derived from masters.
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

/** Find a product's master by base name, whatever extension it was saved as. */
function findMaster(base) {
  for (const ext of ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG']) {
    const p = path.join(ORIG, `${base}.${ext}`);
    if (existsSync(p)) return p;
  }
  return null;
}

async function main() {
  await mkdir(ORIG, { recursive: true });
  await mkdir(OG, { recursive: true });
  await mkdir(SRC, { recursive: true });

  const products = JSON.parse(await readFile(path.join(ROOT, 'src', 'data', 'products.json'), 'utf8'));
  const keep = new Set(); // base names that should stay in SRC

  for (const p of products) {
    const base = String(p.image || '').replace(/\.[^.]+$/, '');
    if (!base) continue;
    keep.add(base);

    const master = findMaster(base);
    if (!master) {
      console.warn(`! no master in image-masters/ for "${base}" (product ${p.slug}) — skipped`);
      continue;
    }

    const img = sharp(master).rotate(); // decode + auto-orient once, then clone per output
    await img
      .clone()
      .resize({ width: MAX_DISPLAY, height: MAX_DISPLAY, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(path.join(SRC, `${base}.jpg`));
    await img
      .clone()
      .resize({ width: MAX_WEBP, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(path.join(SRC, `${base}.webp`));
    await img
      .clone()
      .resize(1200, 630, { fit: 'cover' })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(path.join(OG, `${p.slug}.jpg`));

    console.log(`optimized: ${base} (jpg + webp + og)`);
  }

  // Clean SRC: drop every PNG (we serve JPG now) and any jpg/webp not tied to a product.
  for (const ent of await readdir(SRC, { withFileTypes: true })) {
    if (ent.isDirectory()) continue;
    const f = ent.name;
    const ext = f.split('.').pop().toLowerCase();
    const base = f.replace(/\.[^.]+$/, '');
    const stale = ext === 'png' || ((ext === 'jpg' || ext === 'jpeg' || ext === 'webp') && !keep.has(base));
    if (stale) {
      await rm(path.join(SRC, f));
      console.log(`removed stale: ${f}`);
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
