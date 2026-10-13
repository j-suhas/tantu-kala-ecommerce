// DRAFT PreToolUse hook for Bash|PowerShell (install at .claude/hooks/guard-bash.mjs).
// Reads the tool call JSON from stdin; exits 2 with a reason on stderr to block it.
// Local (L3) control — GitHub rulesets, CODEOWNERS and CI (L4) remain the real backstop.
import { readFileSync } from 'node:fs';
import { KNOWN_ROLES, READ_ONLY_COMMANDS, READ_ONLY_SHELL } from './policy.mjs';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const cmd = String(input?.tool_input?.command ?? '');
const agent = input?.agent_type ?? 'lead'; // no agent_type = main thread = lead

function block(reason) {
  process.stderr.write(`Blocked by Tantu Kala guardrails: ${reason}. Command: ${cmd}\n`);
  process.exit(2);
}

// 1. Everyone, lead included.
const always = [
  [
    /\bgit\s+push\b[^\n]*\b(origin\s+)?(main|v2)(\s|$|:)/,
    'pushing to main or v2 is owner-only (merge via PR)',
  ],
  [
    /\bgit\s+push\b[^\n]*\s(--force(?!-with-lease)|-f)(\s|$)/,
    'plain force-push is forbidden; use --force-with-lease on your own task branch',
  ],
  [
    /\bgit\s+push\b[^\n]*\s(--delete|-d|--tags|--mirror)(\s|$)/,
    'deleting branches/tags or pushing tags is owner-only',
  ],
  [/\bgit\s+tag\b/, 'tags are created by the owner only'],
  [/--no-verify\b/, 'skipping git hooks is forbidden'],
  [/core\.hooksPath/, 'changing the hooks path is forbidden'],
  [/\bgit\s+remote\b/, 'changing remotes is forbidden'],
  [/\bgit\s+(filter-branch|filter-repo|replace)\b/, 'history rewriting is forbidden'],
  [
    /\bgh\s+(pr\s+merge|release|repo\s+(delete|edit|rename)|secret|variable|ruleset)\b/,
    'merging, releases and repo settings are owner-only',
  ],
  [
    /\bgh\s+api\b[^\n]*(-X|--method)[\s=]*['"]?(DELETE|PUT|PATCH)\b/i,
    'changing GitHub settings through the API is owner-only',
  ],
  [
    /\bgh\s+api\b[^\n]*(\/pulls\/\d+\/(merge|reviews)\b|mergePullRequest|enablePullRequestAutoMerge|addPullRequestReview|deleteRef|updateRef)/i,
    'merging or approving PRs through the API is owner-only',
  ],
  [
    /\bgh\s+auth\s+(token|login|logout|refresh|setup-git|switch)\b|\bgit\s+credential\b|\bgit\s+config\b[^\n]*credential/i,
    'reading or changing GitHub credentials is forbidden',
  ],
  [
    /\b(npx\s+)?wrangler\s+(deploy|publish|secret|versions\s+deploy|rollback)\b/,
    'deploys are owner-only',
  ],
  [/\bclasp\s+(push|deploy)\b/, 'Apps Script deploys are owner-only'],
  [/\bnpm\s+publish\b/, 'publishing is forbidden'],
  [
    /\brm\s+-[a-zA-Z]*r[a-zA-Z]*f?\s+(\/|~|\.\.)/,
    'recursive delete outside the worktree is forbidden',
  ],
  [
    /Remove-Item\b[^\n]*-Recurse[^\n]*\s(\/|~|\.\.|[A-Za-z]:\\)/i,
    'recursive delete outside the worktree is forbidden',
  ],
  [
    /(^|[\s'"=/\\])\.env(\.[\w.-]+)?(?=$|[\s'"/;|&)])/,
    'reading or writing .env files is forbidden',
  ],
];
// Secrets: the bot token lives in .claude/settings.local.json and the GH_TOKEN variable.
const secrets = [
  [
    /settings\.local\.json/,
    'local Claude Code settings hold the bot token; never read or change them',
  ],
  [
    /\b(GH_TOKEN|GITHUB_TOKEN|GH_ENTERPRISE_TOKEN)\b|\bprintenv\b|(^|[;&|]\s*)(env|set|export\s+-p|declare\s+-x)\s*($|[;&|])|\$env:|\b(Get-ChildItem|gci|dir|ls)\s+env:/i,
    'printing environment variables or tokens is forbidden',
  ],
];
for (const [re, reason] of [...always, ...secrets]) if (re.test(cmd)) block(reason);

// Identity: every GitHub action from Claude Code must run as the bot account, never as the owner.
// If the bot token isn't loaded, gh/git would silently fall back to the owner's own login.
if (/\bgit\s+push\b|(^|[\s;&|(])gh\s+\w/.test(cmd) && !process.env.GH_TOKEN)
  block(
    'the bot token (GH_TOKEN) is not loaded in this session, so this would run as the owner. Check .claude/settings.local.json and restart Claude Code',
  );
if (agent === 'lead') process.exit(0);

// 2. Unknown agent types (built-in Explore/Plan/general-purpose, forks) and review roles: read-only.
if (!KNOWN_ROLES.has(agent) || READ_ONLY_SHELL.has(agent)) {
  if (/\$\(|`|<\(/.test(cmd)) block(`${agent} has a read-only shell: no command substitution`);
  const noRedirects = cmd.replace(/\s\d?>&\d|\s&?\d?>\s*\/dev\/null/g, ' ');
  if (/>/.test(noRedirects)) block(`${agent} has a read-only shell: no output redirection`);
  const segments = cmd
    .split(/&&|\|\||[;|\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const bad = segments.find((s) => !READ_ONLY_COMMANDS.some((re) => re.test(s)));
  if (bad)
    block(`${agent} has a read-only shell; "${bad}" is not on the read-only list (policy.mjs)`);
  process.exit(0);
}

// 3. Building workers (tk-frontend, tk-data, tk-apps-script, tk-qa, tk-architect, tk-design, ...).
const worker = [
  [/\bgh\s+project\b/, 'only the lead updates the project board'],
  [/\bgit\s+reset\s+--hard\b/, 'git reset --hard is lead-only (ask the lead)'],
  [/\bgit\s+clean\s+-[a-zA-Z]*[fdx]/, 'git clean is lead-only'],
  [/\bgit\s+worktree\s+(add|remove|prune|move)\b/, 'creating/removing worktrees is lead-only'],
  [
    /\bgit\s+(checkout|switch)\s+(-[bBcC]\s+\S+\s+)?(origin\/)?(main|v2)(?=\s|$|;|&|\|)/,
    'worker agents stay on their own task branch',
  ],
  [/\bgit\s+(merge|rebase)\b[^\n]*\b(origin\/)?main\b/, 'workers never merge or rebase onto main'],
  [/\bgh\s+pr\s+(review\s+--approve|ready)\b/, 'approving PRs is for the owner'],
  [
    /\bnpm\s+(i|install|add|uninstall|remove|rm|un|update|up)\b(\s+-\S+)*\s+[^-\s]\S*/,
    'adding/removing dependencies needs an approved ADR — ask the lead',
  ],
];
for (const [re, reason] of worker) if (re.test(cmd)) block(reason);

// Shell writes to protected paths (best effort; CI scope check + CODEOWNERS are the backstop, #23).
const writes =
  /(>|\btee\b|\bsed\s+-i|\bcp\b|\bmv\b|\brm\b|\btouch\b|\bln\b|\bchmod\b|Set-Content|Add-Content|Out-File|Copy-Item|Move-Item|Remove-Item|New-Item|writeFileSync|\bperl\s+-[a-z]*i)/i;
const protectedPaths =
  /(CLAUDE\.md|AGENTS\.md|\.claude[\\/]|\.github[\\/]|\.git[\\/]|wrangler\.jsonc?|src[\\/]config[\\/]|scripts[\\/]ci[\\/]|public[\\/]_headers|package(-lock)?\.json|docs[\\/]v2[\\/](DECISIONS-LOG|process|claude-code|product[\\/](BACKLOG|OWNER-INPUTS)))/;
if (writes.test(cmd) && protectedPaths.test(cmd))
  block(
    'shell commands may not change protected files; use Edit/Write inside your scope or hand back to the lead',
  );
process.exit(0);
