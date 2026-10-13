// Installs the Tantu Kala v2 agent kit (task S-3). The kit folder is the source of truth;
// .claude/, .github/, CLAUDE.md and AGENTS.md are installed copies.
//
//   node docs/v2/claude-code/install-kit.mjs           copy kit -> repo, then run the hook self-test
//   node docs/v2/claude-code/install-kit.mjs --check   report differences only (changes nothing)
//
// Run from the repo root, on `v2` or a `task/...` branch (never on main). See INSTALL.md.
import { execSync, spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  appendFileSync,
} from 'node:fs';
import { dirname, join, relative } from 'node:path';

const check = process.argv.includes('--check');
const kit = 'docs/v2/claude-code';
if (!existsSync(join(kit, 'settings.v2.json'))) fail('run this from the repo root');
const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
if (!check && !/^(v2|task\/)/.test(branch))
  fail(`you are on "${branch}"; switch to the task/S-3-setup branch first`);

// kit source -> installed destination
const map = new Map([
  [`${kit}/CLAUDE.v2.md`, 'CLAUDE.md'],
  [`${kit}/AGENTS.v2.md`, 'AGENTS.md'],
  [`${kit}/settings.v2.json`, '.claude/settings.json'],
  [`${kit}/CODEOWNERS.v2`, '.github/CODEOWNERS'],
  ['docs/v2/templates/PR.md', '.github/pull_request_template.md'],
]);
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
for (const sub of ['agents', 'hooks', 'skills'])
  for (const f of walk(join(kit, sub)))
    map.set(
      f.replace(/\\/g, '/'),
      `.claude/${sub}/${relative(join(kit, sub), f).replace(/\\/g, '/')}`,
    );

let differences = 0;
for (const [src, dst] of map) {
  const same = existsSync(dst) && readFileSync(src).equals(readFileSync(dst));
  if (check) {
    if (!same) (differences++, console.log(`differs: ${dst}`));
    continue;
  }
  mkdirSync(dirname(dst), { recursive: true });
  copyFileSync(src, dst);
  console.log(`${same ? 'unchanged' : 'installed'}  ${dst}`);
}

const ignore = ['.claude/worktrees/', '.claude/settings.local.json', 'docs/learning/'];
const current = existsSync('.gitignore') ? readFileSync('.gitignore', 'utf8').split(/\r?\n/) : [];
const missing = ignore.filter((l) => !current.includes(l));
if (check) {
  missing.forEach((l) => (differences++, console.log(`.gitignore missing: ${l}`)));
  console.log(differences ? `${differences} difference(s)` : 'installed copies match the kit');
  process.exit(differences ? 1 : 0);
}
if (missing.length) {
  appendFileSync(
    '.gitignore',
    `\n# v2: Claude Code worktrees, personal settings, private learning notes\n${missing.join('\n')}\n`,
  );
  console.log(`.gitignore   added ${missing.join(', ')}`);
}

console.log('\nRunning the hook self-test...');
const t = spawnSync(process.execPath, ['.claude/hooks/selftest.mjs'], { stdio: 'inherit' });
process.exit(t.status ?? 1);

function fail(msg) {
  console.error(`install-kit: ${msg}`);
  process.exit(1);
}
