/**
 * Dev helper: generate simple labelled placeholder JPGs for any product in
 * products.json that doesn't yet have a real photo. Run: `node scripts/make-placeholders.mjs`
 * Delete/overwrite these files when real photos arrive.
 */
import sharp from 'sharp';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'public', 'images', 'products');
const palette = ['#E8873A', '#7A1F2B', '#B84A2E', '#5E7A4F', '#C9772E', '#8A2E3C'];

function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

async function main() {
  await mkdir(DIR, { recursive: true });
  const products = JSON.parse(await readFile(path.join(ROOT, 'src', 'data', 'products.json'), 'utf8'));
  let i = 0;
  for (const p of products) {
    const out = path.join(DIR, p.image);
    if (existsSync(out)) { i++; continue; }
    const bg = palette[i % palette.length];
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900">` +
      `<rect width="900" height="900" fill="${bg}"/>` +
      `<circle cx="450" cy="450" r="150" fill="#FBF4E9" opacity="0.9"/>` +
      `<text x="450" y="470" font-family="Georgia" font-size="46" fill="${bg}" text-anchor="middle">Tantu Kala</text>` +
      `<text x="450" y="820" font-family="Georgia" font-size="40" fill="#FBF4E9" text-anchor="middle">${esc(p.name)}</text>` +
      `</svg>`;
    await sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toFile(out);
    console.log('placeholder:', p.image);
    i++;
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
