#!/usr/bin/env node
// Deterministic decision-register check. No model, no tokens.
//  - every ID in the register is defined once (catches the 21 Oct D-72 / IN-22 collision)
//  - every ID referenced in the docs exists in a register
//   node decision-check.mjs --register docs/v2/DECISIONS-LOG.md:D --register docs/v2/product/OWNER-INPUTS.md:IN [--docs docs] [--json]
// A register row is a table line starting with "| <PREFIX>-<n> |". Exit 1 on any problem.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const regs = [];
const docs = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--register') { const [file, prefix] = args[++i].split(':'); regs.push({ file, prefix }); }
  else if (args[i] === '--docs') docs.push(args[++i]);
}
const json = args.includes('--json');
const problems = [];
const defined = new Map(); // id -> [file:line]

for (const { file, prefix } of regs) {
  readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, i) => {
    const m = line.match(new RegExp(`^\\|\\s*(${prefix}-\\d+[a-z]?)\\s*\\|`));
    if (!m) return;
    const id = m[1];
    if (!defined.has(id)) defined.set(id, []);
    defined.get(id).push(`${file}:${i + 1}`);
  });
}
for (const [id, where] of defined)
  if (where.length > 1) problems.push({ kind: 'duplicate-id', id, where });

const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? (f === 'node_modules' || f.startsWith('.') ? [] : walk(p)) : (/\.(md|mdx|html)$/.test(f) ? [p] : []);
});
const prefixes = regs.map((r) => r.prefix).join('|');
const refRe = new RegExp(`\\b(${prefixes})-(\\d+)[a-z]?\\b`, 'g');
for (const d of docs)
  for (const file of walk(d)) {
    readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, i) => {
      for (const m of line.matchAll(refRe)) {
        const id = m[0];
        if (!defined.has(id) && !/…|\.\.\./.test(line.slice(m.index - 2, m.index + id.length + 2)))
          problems.push({ kind: 'unknown-reference', id, where: [`${file}:${i + 1}`] });
      }
    });
  }

if (json) console.log(JSON.stringify({ defined: defined.size, problems }, null, 2));
else {
  for (const p of problems) console.log(`${p.kind}: ${p.id}  ${p.where.join(', ')}`);
  console.log(`decision-check: ${defined.size} IDs defined, ${problems.length} problem(s)`);
}
process.exit(problems.length ? 1 : 0);
