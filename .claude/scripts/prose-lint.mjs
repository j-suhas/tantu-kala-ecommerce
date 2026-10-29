#!/usr/bin/env node
// Deterministic prose lint: catches AI-writing tells before a human or an AI reviewer sees the
// text. No network, no model, no tokens. Exit 1 when any error is found.
//   node prose-lint.mjs <file...> [--extra words.txt] [--json]
// Markdown code blocks and inline code are ignored. Rules: prose-rules.json (see credits there).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const json = args.includes('--json');
const extraIdx = args.indexOf('--extra');
const extra = extraIdx >= 0 ? readFileSync(args[extraIdx + 1], 'utf8').split(/\r?\n/).map((s) => s.trim().toLowerCase()).filter(Boolean) : [];
const files = args.filter((a, i) => !a.startsWith('--') && !(extraIdx >= 0 && i === extraIdx + 1));
const rules = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'prose-rules.json'), 'utf8'));
if (extra.length) rules.errors['project-never-use'] = extra;

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toRe = (phrase) => new RegExp(phrase.includes('.*') ? phrase : `(^|[^a-z])${esc(phrase)}(?=$|[^a-z])`, 'i');
const INVISIBLE = /[\u200B-\u200D\u2060\uFEFF\u00AD\u202A-\u202E]/;
const EMOJI_BULLET = /^\s*(?:[-*]\s*)?\p{Extended_Pictographic}/u;

let errors = 0, warnings = 0;
const out = [];
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  let inCode = false, words = 0, dashes = 0, bangs = 0, emojiBullets = 0;
  lines.forEach((raw, i) => {
    if (/^\s*```/.test(raw)) { inCode = !inCode; return; }
    if (inCode) return;
    const line = raw.replace(/`[^`]*`/g, '');
    const add = (level, rule, match) => {
      level === 'error' ? errors++ : warnings++;
      out.push({ file, line: i + 1, level, rule, match: String(match).trim().slice(0, 60) });
    };
    if (INVISIBLE.test(line)) add('error', 'invisible-character', 'hidden Unicode (watermark or formatting) character');
    for (const [rule, list] of Object.entries(rules.errors))
      for (const p of list) { const m = line.match(toRe(p)); if (m) add('error', rule, p); }
    for (const [rule, list] of Object.entries(rules.warnings))
      for (const p of list) { const m = line.match(toRe(p)); if (m) add('warning', rule, p); }
    words += (line.match(/\b[\p{L}'-]+\b/gu) ?? []).length;
    dashes += (line.match(/—/g) ?? []).length;
    bangs += (line.match(/!(?=\s|$)/g) ?? []).length;
    if (EMOJI_BULLET.test(line)) emojiBullets++;
  });
  const per100 = (n) => (words ? (n * 100) / words : 0);
  const L = rules.limits;
  if (per100(dashes) > L.emDashPer100Words) { errors++; out.push({ file, line: 0, level: 'error', rule: 'em-dash-density', match: `${dashes} em dashes in ${words} words` }); }
  if (per100(bangs) > L.exclamationPer100Words) { warnings++; out.push({ file, line: 0, level: 'warning', rule: 'exclamation-density', match: `${bangs} in ${words} words` }); }
  if (emojiBullets > L.emojiBulletLines) { warnings++; out.push({ file, line: 0, level: 'warning', rule: 'emoji-bullets', match: `${emojiBullets} lines` }); }
}

if (json) console.log(JSON.stringify({ errors, warnings, findings: out }, null, 2));
else {
  for (const f of out) console.log(`${f.level === 'error' ? 'ERROR' : 'warn '} ${f.file}:${f.line}  ${f.rule}: "${f.match}"`);
  console.log(`prose-lint: ${errors} error(s), ${warnings} warning(s) in ${files.length} file(s)`);
}
process.exit(errors ? 1 : 0);
