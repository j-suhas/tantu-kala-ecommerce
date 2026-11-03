#!/usr/bin/env node
// Deterministic UI "Floor" checks in a real browser (idea from nutlope/hallmark's sloplint and
// pbakaus/impeccable's detectors; rules rewritten for our mobile standard). No model, no tokens.
//   node ui-lint.mjs <url-or-file> [--widths 320,360,412] [--fonts "Fraunces,Inter Tight"] [--json]
// Needs the project's own Playwright (npm i -D playwright && npx playwright install chromium).
// STATUS: written 29 Oct 2026, not yet run (sandbox had no browser). First run happens in a test
// task on the owner's machine; treat early results as needing review.
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const target = args.find((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));
const widths = opt('--widths', '320,360,412').split(',').map(Number);
const fonts = opt('--fonts', '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
const json = args.includes('--json');
const url = /^https?:/.test(target) ? target : pathToFileURL(resolve(target)).href;

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { console.error('ui-lint: install Playwright in this project first (npm i -D playwright).'); process.exit(2); }

const findings = [];
const browser = await chromium.launch();
for (const width of widths) {
  for (const reducedMotion of ['no-preference', 'reduce']) {
    const page = await browser.newPage({ viewport: { width, height: 800 }, reducedMotion });
    await page.goto(url, { waitUntil: 'networkidle' });
    const r = await page.evaluate(({ fonts, reducedMotion }) => {
      const out = [];
      const add = (level, rule, el, detail) => out.push({ level, rule, detail, el: el ? (el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '')) : '' });
      const de = document.documentElement;
      if (de.scrollWidth > de.clientWidth + 1) add('error', 'horizontal-scroll', null, `${de.scrollWidth}px > ${de.clientWidth}px`);
      if (reducedMotion === 'reduce') {
        const moving = document.getAnimations().filter((a) => a.playState === 'running' && (a.effect?.getTiming().duration ?? 0) > 0);
        if (moving.length) add('error', 'motion-ignores-reduced-motion', null, `${moving.length} animation(s) still running`);
        return out;
      }
      const visible = (el) => { const s = getComputedStyle(el); const b = el.getBoundingClientRect(); return s.visibility !== 'hidden' && s.display !== 'none' && b.width > 0 && b.height > 0; };
      for (const el of document.querySelectorAll('button, input:not([type=hidden]), select, textarea, [role=button], a[href]')) {
        if (!visible(el)) continue;
        const b = el.getBoundingClientRect();
        const inline = el.tagName === 'A' && el.closest('p, li') && getComputedStyle(el).display === 'inline';
        if (b.width < 44 || b.height < 44) add(inline ? 'warning' : 'error', 'tap-target-under-44px', el, `${Math.round(b.width)}x${Math.round(b.height)}`);
      }
      for (const img of document.querySelectorAll('img')) if (!img.hasAttribute('alt')) add('error', 'img-missing-alt', img, img.src.slice(-40));
      const lum = (c) => { const m = c.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 1]; const [r, g, b] = m.slice(0, 3).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return { L: 0.2126 * r + 0.7152 * g + 0.0722 * b, a: m[3] ?? 1 }; };
      const bgOf = (el) => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (lum(c).a > 0.5 && c !== 'transparent') return c; } return 'rgb(255,255,255)'; };
      const seen = new Set();
      for (const el of document.querySelectorAll('body *')) {
        if (!visible(el) || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
        const s = getComputedStyle(el);
        const fg = lum(s.color).L, bg = lum(bgOf(el)).L;
        const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
        const size = parseFloat(s.fontSize), bold = Number(s.fontWeight) >= 700;
        const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
        const key = `${s.color}|${bgOf(el)}|${need}`;
        if (ratio < need && !seen.has(key)) { seen.add(key); add('error', 'low-contrast', el, `${ratio.toFixed(2)}:1 < ${need}:1`); }
        const fam = s.fontFamily.split(',')[0].replace(/["']/g, '').trim().toLowerCase();
        if (fonts.length && !fonts.includes(fam) && !seen.has('font:' + fam)) { seen.add('font:' + fam); add('warning', 'font-outside-design-system', el, fam); }
        if (size < 12 && !seen.has('size:' + size)) { seen.add('size:' + size); add('warning', 'text-under-12px', el, `${size}px`); }
      }
      return out;
    }, { fonts, reducedMotion });
    for (const f of r) findings.push({ width, ...f });
    await page.close();
  }
}
await browser.close();

const errors = findings.filter((f) => f.level === 'error').length;
if (json) console.log(JSON.stringify({ url, errors, findings }, null, 2));
else {
  for (const f of findings) console.log(`${f.level === 'error' ? 'ERROR' : 'warn '} @${f.width}px ${f.rule} ${f.el} ${f.detail}`);
  console.log(`ui-lint: ${errors} error(s), ${findings.length - errors} warning(s) at ${widths.join('/')} px`);
}
process.exit(errors ? 1 : 0);
