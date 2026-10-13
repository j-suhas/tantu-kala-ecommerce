// DRAFT PostToolUse hook for Edit|Write (install at .claude/hooks/format-file.mjs on the v2 branch).
// Formats the file an agent just edited with the repo's pinned Prettier, so agents and the owner
// produce identical formatting. Never blocks: formatting problems are reported, not fatal.
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const file = String(input?.tool_input?.file_path ?? '');
const root = input?.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
const prettier = join(root, 'node_modules', 'prettier', 'bin', 'prettier.cjs');

if (!file || !/\.(astro|ts|tsx|js|mjs|cjs|json|css|md|yml|yaml)$/.test(file)) process.exit(0);
if (!existsSync(prettier)) {
  process.stderr.write('format-file: Prettier not installed in this worktree (run npm ci).\n');
  process.exit(0);
}
const res = spawnSync(process.execPath, [prettier, '--write', '--ignore-unknown', file], {
  cwd: root,
  encoding: 'utf8',
});
if (res.status !== 0)
  process.stderr.write(`format-file: Prettier failed on ${file}\n${res.stderr}`);
process.exit(0);
