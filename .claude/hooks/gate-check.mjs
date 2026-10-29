// DRAFT kit v3 — PreToolUse process gates (install at .claude/hooks/gate-check.mjs).
// Forces the gated workflow (D-xx, kit v3) without touching the permission rules:
//  - A worker editing an implementation path (GATES.implementationScopes) on a task branch needs
//    work/<task>/plan.md with an "Approved:" line. Only the lead can write that file (GROUPS).
//  - `gh pr create` on a task branch needs work/<task>/verify.md "Result: PASS" and
//    work/<task>/review.md "Verdict: approve".
// Task id = branch name match (task/F-1-types → F-1); lead branches (task/lead-…) are not gated.
// Errors block (fail closed). Credits: gate idea from obra/superpowers + EveryInc compound (MIT).
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { GATES, toRepoPath } from './policy.mjs';

function block(msg) {
  process.stderr.write(`Blocked by Tantu Kala gates: ${msg}\n`);
  process.exit(2);
}
const has = (file, re) => existsSync(file) && re.test(readFileSync(file, 'utf8'));

try {
  const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
  const role = input?.agent_type ?? 'lead';
  const root = String(process.env.CLAUDE_PROJECT_DIR ?? input?.cwd ?? '').replace(/\\/g, '/');
  const tool = input?.tool_name ?? '';
  const filePath = String(input?.tool_input?.file_path ?? input?.tool_input?.notebook_path ?? '').replace(/\\/g, '/');
  const isEdit = /^(Edit|Write|NotebookEdit)$/.test(tool);
  const cmd = String(input?.tool_input?.command ?? '');
  const isPr = /\bgh\s+pr\s+create\b/.test(cmd);
  const rel = isEdit ? (toRepoPath(filePath, root) ?? '') : '';
  const scoped = isEdit && role !== 'lead' && GATES.implementationScopes.some((re) => re.test(rel));
  if (!scoped && !isPr) process.exit(0); // nothing gated: no git call needed

  const wt = filePath.match(/^(.*\/\.claude\/worktrees\/[^/]+)\//);
  const where = wt ? wt[1] : isEdit ? root : String(input?.cwd ?? root);
  const branch =
    process.env.TK_GATE_BRANCH ??
    execFileSync('git', ['-C', where, 'branch', '--show-current'], { encoding: 'utf8' }).trim();
  const m = branch.match(GATES.branchPattern);
  if (!m || (GATES.exemptTasks ?? []).includes(m[1])) process.exit(0);
  const dir = join(where, GATES.workDir, m[1]);

  if (scoped && !has(join(dir, 'plan.md'), /^Approved:\s*\S+/m))
    block(
      `no approved plan for ${m[1]}: ${GATES.workDir}/${m[1]}/plan.md needs an "Approved:" line written by the lead. Ask the lead for the plan (skill write-plan).`,
    );
  if (isPr) {
    if (!has(join(dir, 'verify.md'), /^Result:\s*PASS\b/m))
      block(`work/${m[1]}/verify.md is missing or not "Result: PASS" — run the verify skill first.`);
    if (!has(join(dir, 'review.md'), /^Verdict:\s*approve\b/im))
      block(`work/${m[1]}/review.md is missing or not "Verdict: approve" — run review-task first.`);
  }
  process.exit(0);
} catch (e) {
  block(`gate error (${e.message})`);
}
