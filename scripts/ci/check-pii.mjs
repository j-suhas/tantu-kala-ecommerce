// check-pii: fail if tracked text files contain personal data or secrets
// (10-digit Indian mobile, email, UPI ID, long hex/base64 token).
// Usage: node scripts/ci/check-pii.mjs        (scans `git ls-files`)
// Prints rule + file:line only, never the matched value.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const UPI_HANDLES =
  'okaxis|oksbi|okhdfcbank|okicici|ybl|ibl|axl|paytm|apl|upi|sbi|icici|hdfcbank|axisbank|pnb|fbl|barodampay|aubank|idfcbank|kotak|waaxis|waicici|wasbi|wahdfcbank';

export const RULES = [
  { name: 'phone', re: /(?<![\d.])(?:\+?91[\s-]?)?[6-9]\d{9}(?!\d)/ },
  { name: 'email', re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/ },
  { name: 'upi-id', re: new RegExp(`[A-Za-z0-9._-]{2,}@(?:${UPI_HANDLES})\\b`, 'i') },
  { name: 'webhook-url', re: /script\.google\.com\/macros\/s\/[A-Za-z0-9_-]{20,}/ },
  { name: 'hex-token', re: /(?<![A-Za-z0-9])[A-Fa-f0-9]{32,}(?![A-Za-z0-9])/ },
  { name: 'base64-token', re: /(?<![A-Za-z0-9+/_-])[A-Za-z0-9+/]{40,}={0,2}(?![A-Za-z0-9+/])/ },
];

// Known files reported loudly but not failing, until the owner decides (brief assumption).
export const KNOWN_REPORT_ONLY = [/^\.env\.production$/, /^\.env\.example$/];
// Never scanned: lockfile integrity hashes, binaries.
const SKIP = /(^|\/)package-lock\.json$|\.(png|jpe?g|webp|gif|ico|pdf|woff2?|ttf|zip)$/i;

// Business-public contact details and obvious placeholders already in the repo (site config, docs,
// mockups). Stored as sha256 prefixes so this file holds no PII itself. Owner to confirm the list.
export const ALLOWED_HASHES = new Set([
  '9fbdb74aacb6f47f', 'ed53f08187b75d9a', 'ec687f4f03c8feda', '28247e8fd3006e93', 'cd60dc94ee609262',
  '51690bc929cdd270', '2c025c2ececf011b', '697eaf27b50a2deb', 'f3d702746df9b712', '23065867a4e007e9',
  'ad709c5c5131b2de', '53e6cdc30765aade',
]);
export const hashValue = (v) => createHash('sha256').update(v).digest('hex').slice(0, 16);
const normalise = (rule, v) => (rule === 'phone' ? v.replace(/\D/g, '').slice(-10) : v.toLowerCase());

const isMixedToken = (s) => /[a-z]/.test(s) && /[A-Z]/.test(s) && /\d/.test(s);

/** Scan text. Returns [{rule, line}] (values are never returned). */
export function scanText(text) {
  const hits = [];
  text.split(/\r?\n/).forEach((line, i) => {
    for (const { name, re } of RULES) {
      const global = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
      for (const m of line.matchAll(global)) {
        // Skips are decided per match, so an allowed value never hides a real one on the same line.
        if (name === 'base64-token' && (!isMixedToken(m[0]) || (m[0].match(/\//g) ?? []).length >= 2)) continue; // path-like
        if (ALLOWED_HASHES.has(hashValue(normalise(name, m[0])))) continue;
        hits.push({ rule: name, line: i + 1 });
      }
    }
  });
  return hits;
}

export function scanFiles(files, read = (f) => readFileSync(f, 'utf8')) {
  const failing = [];
  const reportOnly = [];
  for (const f of files) {
    if (SKIP.test(f)) continue;
    let text;
    try {
      text = read(f);
    } catch {
      continue;
    }
    if (text.includes('\0')) continue;
    for (const h of scanText(text)) {
      (KNOWN_REPORT_ONLY.some((re) => re.test(f)) ? reportOnly : failing).push({ file: f, ...h });
    }
  }
  return { failing, reportOnly };
}

function main() {
  const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean);
  const { failing, reportOnly } = scanFiles(files);
  for (const h of reportOnly) console.warn(`REPORT-ONLY (known file, owner to decide): ${h.rule} at ${h.file}:${h.line}`);
  if (failing.length) {
    console.error('check-pii FAIL (values not shown):');
    for (const h of failing) console.error(`  ${h.rule} at ${h.file}:${h.line}`);
    process.exit(1);
  }
  console.log('check-pii OK: no personal data or secrets in tracked files.');
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();
