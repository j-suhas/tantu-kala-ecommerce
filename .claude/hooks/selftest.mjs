// Self-test for the guard hooks. Run from the repo root: node .claude/hooks/selftest.mjs
// Expect: all cases pass. Re-run after any change to policy.mjs or the guard hooks.
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const R = 'C:/repo'; // fake project root; worktree paths look like <root>/.claude/worktrees/<name>/...
// [role (null = lead), path or command, expected exit code: 0 allow, 2 block]
const fileCases = [
  [null, `${R}/src/pages/index.astro`, 0],
  [null, `${R}/CLAUDE.md`, 2],
  [null, `${R}/.claude/agents/tk-qa.md`, 2],
  [null, `${R}/docs/v2/claude-code/hooks/policy.mjs`, 2],
  [null, `${R}/docs/v2/DECISIONS-LOG.md`, 0],
  [null, `${R}/docs/learning/X.md`, 0],
  ['tk-frontend', `${R}/.claude/worktrees/f1/src/components/ui/Button.tsx`, 0],
  ['tk-frontend', 'C:\\repo\\.claude\\worktrees\\f1\\src\\pages\\a.astro', 0],
  ['tk-frontend', `${R}/.claude/worktrees/f1/src/lib/pricing.ts`, 2],
  ['tk-frontend', `${R}/.claude/worktrees/f1/public/_headers`, 2],
  ['tk-frontend', `${R}/.claude/worktrees/f1/public/fonts/a.woff2`, 0],
  ['tk-frontend', `${R}/.claude/worktrees/f1/.claude/agents/tk-frontend.md`, 2],
  ['tk-frontend', 'C:/Users/suhas/.bashrc', 2],
  ['tk-data', `${R}/.claude/worktrees/d1/src/config/site.mjs`, 0],
  ['tk-data', `${R}/.claude/worktrees/d1/scripts/ci/scope-check.mjs`, 2],
  ['tk-data', `${R}/.claude/worktrees/d1/package.json`, 0],
  ['tk-data', `${R}/.claude/worktrees/d1/src/lib/types.ts`, 0],
  ['tk-qa', `${R}/.claude/worktrees/q1/scripts/ci/scope-check.mjs`, 0],
  ['tk-qa', `${R}/.claude/worktrees/q1/src/pages/a.astro`, 2],
  ['tk-design', `${R}/.claude/worktrees/x/docs/design/mockups/homepage.html`, 0],
  ['tk-design', `${R}/.claude/worktrees/x/docs/design/BRAND-VOICE.md`, 2],
  ['tk-design', `${R}/.claude/worktrees/x/src/styles/tokens.css`, 2],
  ['tk-brand', `${R}/.claude/worktrees/x/docs/design/BRAND-VOICE.md`, 0],
  ['tk-brand', `${R}/.claude/worktrees/x/src/data/products.json`, 2],
  ['tk-content', `${R}/.claude/worktrees/x/src/data/products.json`, 0],
  ['tk-content', `${R}/.claude/worktrees/x/src/config/site.mjs`, 2],
  ['tk-docs', `${R}/.claude/worktrees/x/docs/v2/product/REQUIREMENTS.md`, 0],
  ['tk-docs', `${R}/.claude/worktrees/x/docs/v2/DECISIONS-LOG.md`, 2],
  ['tk-docs', `${R}/.claude/worktrees/x/docs/v2/process/GIT-STRATEGY.md`, 2],
  ['tk-docs', `${R}/.claude/worktrees/x/docs/v2/process/CI-CD.md`, 0],
  ['tk-docs', `${R}/.claude/worktrees/x/docs/learning/a.md`, 2],
  ['tk-docs', `${R}/.claude/worktrees/x/src/lib/a.ts`, 2],
  ['tk-security', `${R}/.claude/worktrees/x/docs/v2/standards/SECURITY.md`, 0],
  ['tk-security', `${R}/.claude/worktrees/x/apps-script/Code.gs`, 2],
  ['tk-reviewer', `${R}/src/pages/a.astro`, 2],
  ['tk-seo', `${R}/.claude/worktrees/x/docs/v2/reports/seo/2026-11.md`, 0],
  ['tk-seo', `${R}/.claude/worktrees/x/public/robots.txt`, 2],
  ['tk-architect', `${R}/.claude/worktrees/x/docs/v2/architecture/lld/LLD-08.md`, 0],
  ['tk-architect', `${R}/.claude/worktrees/x/public/_headers`, 0],
  ['tk-architect', `${R}/.claude/worktrees/x/src/pages/a.astro`, 2],
  ['tk-apps-script', `${R}/.claude/worktrees/x/apps-script/src/router.ts`, 0],
  ['general-purpose', `${R}/src/pages/a.astro`, 2],
  ['Explore', `${R}/docs/x.md`, 2],
];
const shellCases = [
  [null, 'git push origin main', 2],
  [null, 'git push -u origin task/F-1-types', 0],
  [null, 'git switch v2 && git pull', 0],
  [null, 'gh pr merge 12 --squash', 2],
  [null, 'cat .env.production', 2],
  [null, 'grep -r "process.env.PUBLIC" src', 0],
  [null, 'npx wrangler deploy', 2],
  [null, 'git tag v2.0.0', 2],
  [null, 'npm install -D vitest', 0],
  ['tk-frontend', 'npm run build && npm test', 0],
  ['tk-frontend', 'git push -u origin task/F-4-header', 0],
  ['tk-frontend', 'git checkout task/F-4-header', 0],
  ['tk-frontend', 'git checkout v2', 2],
  [null, 'git push -u origin task/S-3-setup', 0],
  ['tk-frontend', 'git switch main', 2],
  ['tk-frontend', 'npm i -D some-lib', 2],
  ['tk-frontend', 'npm ci', 0],
  ['tk-frontend', 'npm install', 0],
  ['tk-frontend', "sed -i 's/x/y/' src/config/site.mjs", 2],
  ['tk-frontend', 'echo hi > CLAUDE.md', 2],
  ['tk-frontend', 'cp /tmp/x .claude/settings.json', 2],
  ['tk-frontend', 'git branch -m task/F-4-header', 0],
  ['tk-frontend', 'git worktree remove .claude/worktrees/x', 2],
  ['tk-frontend', 'git reset --hard HEAD~1', 2],
  ['tk-frontend', 'gh pr create --base v2 --title "[F-4] header"', 0],
  ['tk-reviewer', 'git diff origin/v2...origin/v2/F-4-header', 0],
  ['tk-reviewer', 'gh pr diff 12', 0],
  ['tk-reviewer', 'git log --oneline -20 | head -5', 0],
  ['tk-reviewer', 'npm test 2>&1', 0],
  ['tk-reviewer', 'git diff > /tmp/x.patch', 2],
  ['tk-reviewer', "sed -i 's/a/b/' src/a.ts", 2],
  ['tk-reviewer', "node -e \"require('fs').writeFileSync('a','b')\"", 2],
  ['tk-reviewer', 'echo $(whoami)', 2],
  ['tk-reviewer', 'git branch -D task/F-1', 2],
  ['tk-reviewer', 'git branch -a', 0],
  ['tk-reviewer', 'find . -name "*.tmp" -delete', 2],
  ['tk-security', 'npm audit', 0],
  ['tk-security', 'npm audit fix', 2],
  ['tk-security', 'rg --pre ./x.sh foo', 2],
  ['tk-docs', 'git log --since=2026-10-01 --stat', 0],
  ['tk-docs', 'git diff --output=a.txt', 2],
  ['tk-seo', 'npm run lint:seo', 0],
  ['tk-seo', 'curl https://example.com', 2],
  ['Explore', 'ls src && grep -rn "upi" src', 0],
  ['Explore', 'rm -rf dist', 2],
  ['tk-data', 'git push origin v2', 2],
  ['tk-data', 'git push --force origin task/F-1-types', 2],
  ['tk-data', 'git push --force-with-lease origin task/F-1-types', 0],
  [null, 'gh api -X PUT repos/j-suhas/tantu-kala-ecommerce/pulls/12/merge', 2],
  [null, 'gh api --method=PUT repos/x/y/pulls/12/merge', 2],
  [
    null,
    "gh api graphql -f query='mutation { mergePullRequest(input:{}) { clientMutationId } }'",
    2,
  ],
  [null, 'gh api repos/x/y/pulls/12/reviews -f event=APPROVE', 2],
  [null, 'gh auth token', 2],
  [null, 'git credential fill', 2],
  ['tk-frontend', 'gh pr view 12 --json state', 0],
  ['tk-frontend', 'gh api repos/x/y/pulls/12/comments', 0],
];

function run(hook, input, token = 'test-bot-token') {
  const env = { ...process.env, CLAUDE_PROJECT_DIR: R, GH_TOKEN: token };
  if (!token) delete env.GH_TOKEN;
  const res = spawnSync(process.execPath, [join(here, hook)], {
    input: JSON.stringify(input),
    encoding: 'utf8',
    env,
  });
  return res.status;
}

let failed = 0;
const check = (hook, role, toolName, toolInput, expected, label, token) => {
  const input = { tool_name: toolName, tool_input: toolInput };
  if (role) input.agent_type = role;
  const got = run(hook, input, token);
  if (got !== expected) {
    failed++;
    console.log(`FAIL ${hook} [${role ?? 'lead'}] ${label}: expected ${expected}, got ${got}`);
  }
};
for (const [role, path, exp] of fileCases)
  check('guard-files.mjs', role, 'Edit', { file_path: path }, exp, path);
for (const [role, cmd, exp] of shellCases)
  check('guard-bash.mjs', role, 'Bash', { command: cmd }, exp, cmd);
check(
  'guard-bash.mjs',
  null,
  'PowerShell',
  { command: 'git push origin main' },
  2,
  'PowerShell push',
);

// Bot identity and secrets: [role, command, expected, token ('' = not loaded)]
const identityCases = [
  [null, 'git push -u origin task/F-1-types', 2, ''],
  [null, 'gh pr create --base v2 --fill', 2, ''],
  ['tk-frontend', 'git push -u origin task/F-4-header', 2, ''],
  ['tk-frontend', 'npm run build', 0, ''],
  [null, 'git push -u origin task/F-1-types', 0, undefined],
  [null, 'cat .claude/settings.local.json', 2, undefined],
  [null, 'echo $GH_TOKEN', 2, undefined],
  [null, 'printenv', 2, undefined],
  ['tk-frontend', 'env | grep TOKEN', 2, undefined],
  ['tk-frontend', 'env NODE_ENV=test npm test', 0, undefined],
  [null, 'Get-ChildItem env:', 2, undefined],
  [null, 'gh project item-list 1 --owner j-suhas', 0, undefined],
  ['tk-frontend', 'gh project item-edit --id X', 2, undefined],
];
for (const [role, cmd, exp, token] of identityCases)
  check(
    'guard-bash.mjs',
    role,
    'Bash',
    { command: cmd },
    exp,
    `${cmd} [token ${token === '' ? 'missing' : 'set'}]`,
    token,
  );


// ---- kit v3: new roles, work/ gate files, check scripts, process gates ----
const v3Files = [
  ['tk-social', `${R}/.claude/worktrees/x/marketing/social/2026-11-diwali-reel.md`, 0],
  ['tk-social', `${R}/.claude/worktrees/x/src/pages/index.astro`, 2],
  ['tk-social', `${R}/.claude/worktrees/x/work/F-9/rulings.md`, 0],
  ['tk-social', `${R}/.claude/worktrees/x/work/F-9/plan.md`, 2],
  ['tk-content', `${R}/.claude/worktrees/x/marketing/social/post.md`, 2],
  ['tk-analyst', `${R}/.claude/worktrees/x/docs/v2/analysis/stockists.md`, 0],
  ['tk-analyst', `${R}/.claude/worktrees/x/docs/v2/product/REQUIREMENTS.md`, 2],
  ['tk-docs', `${R}/.claude/worktrees/x/docs/v2/analysis/stockists.md`, 0],
  ['tk-frontend', `${R}/.claude/worktrees/x/work/F-9/handoff.md`, 0],
  ['tk-frontend', `${R}/.claude/worktrees/x/work/F-9/verify.md`, 2],
  ['tk-qa', `${R}/.claude/worktrees/x/work/F-9/verify.md`, 0],
  ['tk-qa', `${R}/.claude/worktrees/x/work/F-9/spec.md`, 2],
  [null, `${R}/work/F-9/plan.md`, 0],
  ['tk-reviewer', `${R}/work/F-9/review.md`, 2],
];
for (const [role, path, exp] of v3Files) check('guard-files.mjs', role, 'Edit', { file_path: path }, exp, path);
const v3Shell = [
  ['tk-reviewer', 'node .claude/scripts/prose-lint.mjs marketing/social/post.md', 0],
  ['tk-analyst', 'node .claude/scripts/decision-check.mjs --register docs/v2/DECISIONS-LOG.md:D', 0],
  ['tk-analyst', 'node -e "1"', 2],
  ['tk-analyst', 'echo hi > x.md', 2],
  ['tk-social', 'python3 skills/ig-human/detect.py draft.txt', 0],
  ['tk-social', 'git push origin v2', 2],
];
for (const [role, cmd, exp] of v3Shell) check('guard-bash.mjs', role, 'Bash', { command: cmd }, exp, cmd);

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
const G = mkdtempSync(join(tmpdir(), 'tk-gate-')).replace(/\\/g, '/');
const git = (...a) => execFileSync('git', ['-C', G, ...a], { stdio: 'ignore' });
git('init', '-q'); git('checkout', '-q', '-b', 'task/F-9-cart-badge');
const W = `${G}/work/F-9`; mkdirSync(W, { recursive: true });
let gateCount = 0;
const gate = (label, role, toolName, toolInput, expected) => {
  gateCount++;
  const input = { tool_name: toolName, tool_input: toolInput, cwd: G };
  if (role) input.agent_type = role;
  const res = spawnSync(process.execPath, [join(here, 'gate-check.mjs')], {
    input: JSON.stringify(input), encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: G },
  });
  if (res.status !== expected) { failed++; console.log(`FAIL gate ${label}: expected ${expected}, got ${res.status} ${res.stderr}`); }
};
const ed = (p) => ({ file_path: `${G}/${p}` });
gate('worker edits code, no plan', 'tk-frontend', 'Edit', ed('src/components/CartBadge.astro'), 2);
writeFileSync(`${W}/plan.md`, '# Plan\nStatus: draft\n');
gate('plan not approved', 'tk-frontend', 'Edit', ed('src/components/CartBadge.astro'), 2);
writeFileSync(`${W}/plan.md`, '# Plan\nApproved: owner 2026-10-29\n');
gate('plan approved', 'tk-frontend', 'Edit', ed('src/components/CartBadge.astro'), 0);
gate('lead not gated', null, 'Write', ed('src/lib/x.ts'), 0);
gate('tests not gated', 'tk-qa', 'Write', ed('tests/badge.test.ts'), 0);
gate('marketing not gated', 'tk-social', 'Write', ed('marketing/social/a.md'), 0);
gate('PR without verify', null, 'Bash', { command: 'gh pr create --base v2 --fill' }, 2);
writeFileSync(`${W}/verify.md`, 'Result: PASS\n');
gate('PR without review', null, 'Bash', { command: 'gh pr create --base v2 --fill' }, 2);
writeFileSync(`${W}/review.md`, 'Verdict: request changes\n');
gate('PR review not approve', null, 'Bash', { command: 'gh pr create --base v2 --fill' }, 2);
writeFileSync(`${W}/review.md`, 'Verdict: approve\n');
gate('PR all gates passed', null, 'Bash', { command: 'gh pr create --base v2 --fill' }, 0);
git('checkout', '-q', '-b', 'task/F-7-test-harness');
gate('in-flight task exempt', 'tk-qa', 'Bash', { command: 'gh pr create --base v2 --fill' }, 0);
git('checkout', '-q', '-b', 'task/lead-status-sync');
gate('lead branch not gated', null, 'Bash', { command: 'gh pr create --base v2 --fill' }, 0);
rmSync(G, { recursive: true, force: true });

const total = fileCases.length + shellCases.length + identityCases.length + 1 + v3Files.length + v3Shell.length + gateCount;
console.log(`${total - failed}/${total} hook cases passed`);
process.exit(failed ? 1 : 0);
