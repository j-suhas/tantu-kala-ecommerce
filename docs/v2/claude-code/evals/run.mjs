#!/usr/bin/env node
// Skill eval runner (test-first skills). For each case: run the prompt headless with Claude Code
// (`claude -p`), save the output, grade it. Deterministic checks first; "judge" checks ask a fresh
// headless Claude for PASS/FAIL. Use `--baseline` to run without the plugin (to see the failure).
//   node docs/v2/claude-code/evals/run.mjs <skill> [--baseline]   (run from the repo root, on a task branch)
// STATUS: written 29 Oct 2026, not yet run (needs the claude CLI on the owner's machine). Each run
// uses plan usage: keep 3–5 cases per skill and run before releases, not on every edit.
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const [skill] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const baseline = process.argv.includes('--baseline');
const { cases } = JSON.parse(readFileSync(join(here, skill, 'cases.json'), 'utf8'));
const outDir = join(here, skill, 'results', new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-') + (baseline ? '-baseline' : ''));
mkdirSync(outDir, { recursive: true });

const claude = (prompt, extra = []) => {
  const r = spawnSync('claude', ['-p', prompt, '--output-format', 'text', ...extra], { encoding: 'utf8', timeout: 300000 });
  if (r.error) throw new Error('claude CLI not available: ' + r.error.message);
  return r.stdout;
};
// Project skills load automatically from .claude/skills; baseline turns the Skill tool off.
const pluginArgs = baseline ? ['--disallowedTools', 'Skill'] : [];

let pass = 0, total = 0;
for (const c of cases) {
  const output = claude(c.prompt, pluginArgs);
  writeFileSync(join(outDir, `${c.id}.txt`), output);
  for (const e of c.expectations) {
    total++;
    let ok = false;
    if (e.type === 'regex-absent') ok = !new RegExp(e.pattern, 'i').test(output);
    else if (e.type === 'regex-present') ok = new RegExp(e.pattern, 'i').test(output);
    else if (e.type === 'lint-clean') {
      const f = join(mkdtempSync(join(tmpdir(), 'eval-')), 'out.md'); writeFileSync(f, output);
      ok = spawnSync(process.execPath, [join(here, '..', 'scripts', 'prose-lint.mjs'), f]).status === 0;
    } else if (e.type === 'judge') {
      const v = claude(`You are grading an AI output. Statement: "${e.statement}". Output to grade:\n---\n${output}\n---\nAnswer with exactly PASS or FAIL on the first line, then one line of reason.`);
      ok = /^\s*PASS/i.test(v);
    }
    if (ok) pass++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${c.id}  ${e.type}: ${e.statement ?? e.pattern ?? e.tool}`);
  }
}
console.log(`${skill}${baseline ? ' (baseline)' : ''}: ${pass}/${total} expectations passed — outputs in ${outDir}`);
process.exit(pass === total ? 0 : 1);
