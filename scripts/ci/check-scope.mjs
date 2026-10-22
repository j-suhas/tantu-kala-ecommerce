// check-scope: fail if a diff touches an owner-only path (mirrors OWNER_ONLY in .claude/hooks/policy.mjs).
// Usage: node scripts/ci/check-scope.mjs [baseRef=origin/v2]     (diffs baseRef...HEAD)
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const OWNER_ONLY = [
  /^CLAUDE\.md$/,
  /^AGENTS\.md$/,
  /^\.claude\//,
  /^\.github\//,
  /^\.git(\/|$)/,
  /(^|\/)\.env(\.|$)/,
  /^wrangler\.jsonc?$/,
  /^docs\/v2\/process\/(AGENT-WORKFLOW|AGENT-GUARDRAILS|GIT-STRATEGY)\.md$/,
  /^docs\/v2\/claude-code\//,
];

/** Returns the paths (repo-relative) that are owner-only. `.env.example` is allowed (no secrets by design). */
export function ownerOnlyViolations(paths) {
  return paths
    .map((p) => p.replace(/\\/g, '/').replace(/^\.\//, ''))
    .filter((p) => !/(^|\/)\.env\.example$/.test(p))
    .filter((p) => OWNER_ONLY.some((re) => re.test(p)));
}

function main() {
  const base = process.argv[2] ?? 'origin/v2';
  const out = execFileSync('git', ['diff', '--name-only', `${base}...HEAD`], { encoding: 'utf8' });
  const bad = ownerOnlyViolations(out.split('\n').filter(Boolean));
  if (bad.length) {
    console.error('check-scope FAIL: owner-only paths changed:\n  ' + bad.join('\n  '));
    process.exit(1);
  }
  console.log('check-scope OK: no owner-only paths changed.');
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();
