// check-deps: fail if package.json gains a dependency that is not on the approved list.
// Dependencies already present at the base ref are the accepted baseline.
// Usage: node scripts/ci/check-deps.mjs [baseRef=origin/v2]
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// D-27/D-28: Preact, Vitest, Playwright. Prettier (IN-15) is NOT approved until the owner answers.
export const APPROVED = ['preact', 'vitest', 'playwright', '@playwright/test'];

const names = (pkg) => [
  ...Object.keys(pkg?.dependencies ?? {}),
  ...Object.keys(pkg?.devDependencies ?? {}),
  ...Object.keys(pkg?.optionalDependencies ?? {}),
  ...Object.keys(pkg?.peerDependencies ?? {}),
];

/** Names present in head but not in base and not approved. */
export function unapprovedNewDeps(basePkg, headPkg, approved = APPROVED) {
  const have = new Set(names(basePkg));
  return [...new Set(names(headPkg))].filter((n) => !have.has(n) && !approved.includes(n));
}

function main() {
  const base = process.argv[2] ?? 'origin/v2';
  const basePkg = JSON.parse(execFileSync('git', ['show', `${base}:package.json`], { encoding: 'utf8' }));
  const headPkg = JSON.parse(readFileSync('package.json', 'utf8'));
  const bad = unapprovedNewDeps(basePkg, headPkg);
  if (bad.length) {
    console.error('check-deps FAIL: new dependencies not on the approved list (needs ADR + owner):\n  ' + bad.join('\n  '));
    process.exit(1);
  }
  console.log('check-deps OK: no unapproved new dependencies.');
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();
