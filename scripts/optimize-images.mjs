/**
 * Image pipeline (run: `npm run optimize`).
 * For every product image in public/images/products/:
 *   - resizes to max 1200px and writes a .webp alongside it
 * For every product in src/data/products.json:
 *   - generates a stable public/og/<slug>.jpg (1200x630) for social previews
 *     (WhatsApp/Facebook need JPG/PNG, not webp).
 * Safe to run repeatedly; skips nothing, just regenerates.
 */
import sharp from 'sharp';
import { readFile, readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'public', 'images', 'products');
const OG = path.join(ROOT, 'public', 'og');

async function main() {
  await mkdir(OG, { recursive: true });

  // 1) webp variants
  const files = existsSync(SRC) ? await readdir(SRC) : [];
  for (const f of files) {
    if (!/\.(jpe?g|png)$/i.test(f)) continue;
    const input = path.join(SRC, f);
    const webp = path.join(SRC, f.replace(/\.(jpe?g|png)$/i, '.webp'));
    await sharp(input).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 78 }).toFile(webp);
    // also compress the original in place-ish (write to tmp then rename would be ideal;
    // for MVP we leave originals untouched to avoid data loss)
    console.log('webp:', path.basename(webp));
  }

  // 2) per-product OG jpg
  const products = JSON.parse(await readFile(path.join(ROOT, 'src', 'data', 'products.json'), 'utf8'));
  for (const p of products) {
    const input = path.join(SRC, p.image);
    const out = path.join(OG, `${p.slug}.jpg`);
    if (existsSync(input)) {
      await sharp(input).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 82 }).toFile(out);
      console.log('og:', path.basename(out));
    }
  }

  // 3) default OG
  const def = path.join(OG, 'default.jpg');
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#7A1F2B' } })
    .composite([{
      input: Buffer.from(
        `<svg width="1200" height="630"><text x="60" y="330" font-family="Georgia" font-size="86" fill="#FBF4E9">Tantu Kala</text>` +
        `<text x="62" y="400" font-family="Georgia" font-size="34" fill="#E8873A">Handmade crochet rakhis</text></svg>`
      ),
      top: 0, left: 0,
    }])
    .jpeg({ quality: 82 })
    .toFile(def);
  console.log('og: default.jpg');
}

main().catch((e) => { console.error(e); process.exit(1); });
