/**
 * Image pipeline (run: `npm run optimize`).
 *
 * Drop a raw photo (even 2–5 MB) as public/images/products/<slug>.jpg, then run this.
 * For every product image it:
 *   1. Backs up your untouched master to public/images/products/_originals/ (once).
 *   2. Resizes the served JPG/PNG in place to max 1400px, compressed (~100–250 KB).
 *   3. Writes a .webp next to it (max 1200px) — what modern browsers actually load.
 *   4. Generates a stable public/og/<slug>.jpg (1200×630) for WhatsApp/FB previews.
 * Plus a default OG image. Idempotent: it always re-derives from the master in
 * _originals/, so repeat runs never degrade quality.
 */
import sharp from 'sharp';
import { readFile, readdir, mkdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'public', 'images', 'products');
const ORIG = path.join(SRC, '_originals');
const OG = path.join(ROOT, 'public', 'og');

const MAX_DISPLAY = 1400; // longest edge for the served image
const MAX_WEBP = 1200;

const isImage = (f) => /\.(jpe?g|png)$/i.test(f);

async function main() {
  await mkdir(ORIG, { recursive: true });
  await mkdir(OG, { recursive: true });

  const files = existsSync(SRC) ? await readdir(SRC, { withFileTypes: true }) : [];
  for (const ent of files) {
    if (ent.isDirectory() || !isImage(ent.name)) continue;
    const name = ent.name;
    const served = path.join(SRC, name);
    const master = path.join(ORIG, name);

    // 1. Preserve the master once, before we ever compress the served copy.
    if (!existsSync(master)) await copyFile(served, master);

    // 2. Re-derive the served image from the master (idempotent, no cumulative loss).
    // Decode the master ONCE and .clone() the pipeline for each output, so a big
    // batch doesn't re-decode the same large file twice per image.
    const isPng = /\.png$/i.test(name);
    const base = sharp(master).rotate(); // single decode + auto-orient

    let display = base.clone().resize({ width: MAX_DISPLAY, height: MAX_DISPLAY, fit: 'inside', withoutEnlargement: true });
    display = isPng ? display.png({ compressionLevel: 9 }) : display.jpeg({ quality: 82, mozjpeg: true });
    await display.toFile(served);

    // 3. WebP variant (what browsers load first via <picture>).
    const webp = path.join(SRC, name.replace(/\.(jpe?g|png)$/i, '.webp'));
    await base.clone().resize({ width: MAX_WEBP, withoutEnlargement: true }).webp({ quality: 78 }).toFile(webp);

    console.log('optimized:', name, '(+webp)');
  }

  // 4. Per-product OG image (JPG/PNG only — WhatsApp won't render webp/avif).
  const products = JSON.parse(await readFile(path.join(ROOT, 'src', 'data', 'products.json'), 'utf8'));
  for (const p of products) {
    const master = path.join(ORIG, p.image);
    const source = existsSync(master) ? master : path.join(SRC, p.image);
    if (!existsSync(source)) continue;
    const out = path.join(OG, `${p.slug}.jpg`);
    await sharp(source).rotate().resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
    console.log('og:', path.basename(out));
  }

  // 5. Default OG (brand card).
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
