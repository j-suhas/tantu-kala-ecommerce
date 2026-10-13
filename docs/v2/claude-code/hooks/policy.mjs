// DRAFT — the single source of truth for who may change what (install at .claude/hooks/policy.mjs).
// Used by guard-files.mjs (Edit/Write) and guard-bash.mjs (Bash/PowerShell).
// The human-readable copy of this table is docs/v2/process/AGENT-WORKFLOW.md §2 — keep both in sync
// (owner-only file: changes need the owner's review via CODEOWNERS).
//
// Model: the main session (no agent_type) is the lead. Every tk-* worker is DEFAULT-DENY: it may
// write only inside its ALLOW_ONLY scope, and shared files are further limited by GROUPS. Any other
// agent type (built-in Explore/Plan/general-purpose, forks, unknown names) may not write at all.

/** Repo-relative, forward-slash path. Strips Claude-managed worktree prefixes. null = outside repo. */
export function toRepoPath(filePath, projectDir) {
  let p = String(filePath ?? '').replace(/\\/g, '/');
  const wt = p.match(/\/\.claude\/worktrees\/[^/]+\/(.*)$/);
  if (wt) return wt[1];
  if (!/^([a-zA-Z]:)?\//.test(p)) return p.replace(/^\.\//, ''); // already relative
  const root = String(projectDir ?? '')
    .replace(/\\/g, '/')
    .replace(/\/+$/, '');
  if (root && p.toLowerCase().startsWith(root.toLowerCase() + '/')) return p.slice(root.length + 1);
  return null;
}

/** Nobody edits these through Claude Code — the owner changes them by hand (CODEOWNERS too). */
export const OWNER_ONLY = [
  /^CLAUDE\.md$/,
  /^AGENTS\.md$/,
  /^\.claude\//, // settings, agents, hooks, skills (worktree paths are stripped before matching)
  /^\.github\//,
  /^\.git(\/|$)/,
  /(^|\/)\.env(\.|$)/,
  /^wrangler\.jsonc?$/, // Cloudflare deploy config
  /^docs\/v2\/process\/(AGENT-WORKFLOW|AGENT-GUARDRAILS|GIT-STRATEGY)\.md$/,
  /^docs\/v2\/claude-code\//, // the install kit is the source of .claude/ — same protection
];

/** Shared paths: only these roles may edit them (first match wins, most specific first). */
export const GROUPS = [
  { re: /^docs\/v2\/DECISIONS-LOG\.md$/, roles: ['lead'] },
  { re: /^docs\/v2\/product\/(BACKLOG|OWNER-INPUTS)\.md$/, roles: ['lead'] },
  { re: /^docs\/v2\/(templates|archive)\//, roles: ['lead'] },
  { re: /^docs\/learning\//, roles: ['lead'] },
  { re: /^docs\/v2\/architecture\//, roles: ['lead', 'tk-architect', 'tk-docs'] },
  { re: /^docs\/v2\/standards\/SECURITY\.md$/, roles: ['lead', 'tk-security', 'tk-docs'] },
  { re: /^docs\/v2\/standards\/SEO\.md$/, roles: ['lead', 'tk-seo', 'tk-docs'] },
  {
    re: /^docs\/v2\/standards\/MOBILE-UX-STANDARD\.md$/,
    roles: ['lead', 'tk-design', 'tk-docs'],
  },
  { re: /^docs\/v2\/reports\/seo\//, roles: ['lead', 'tk-seo', 'tk-docs'] },
  { re: /^docs\/design\/BRAND-VOICE\.md$/, roles: ['lead', 'tk-brand', 'tk-docs'] },
  { re: /^docs\/design\//, roles: ['lead', 'tk-design', 'tk-docs'] },
  { re: /^docs\//, roles: ['lead', 'tk-docs'] },
  { re: /^src\/data\/products\.json$/, roles: ['lead', 'tk-data', 'tk-content'] },
  { re: /^src\/lib\/types\.ts$/, roles: ['lead', 'tk-architect', 'tk-data'] },
  { re: /^src\/config\//, roles: ['lead', 'tk-data'] }, // UPI ID lives here — CODEOWNERS too
  { re: /^public\/_headers$/, roles: ['lead', 'tk-architect'] }, // CSP/HSTS — CODEOWNERS too
  { re: /^public\/images\/products\//, roles: ['lead', 'tk-data'] },
  { re: /^scripts\/ci\//, roles: ['lead', 'tk-qa'] }, // guardrail scripts — CODEOWNERS too
  { re: /^apps-script\//, roles: ['lead', 'tk-apps-script'] },
  { re: /^package(-lock)?\.json$/, roles: ['lead', 'tk-data', 'tk-qa'] }, // deps — CODEOWNERS too
  { re: /^(astro\.config\.mjs|tsconfig\.json)$/, roles: ['lead', 'tk-architect'] },
];

/** Each worker's whole write scope (default-deny outside it). */
export const ALLOW_ONLY = {
  'tk-architect': [
    /^docs\/v2\/architecture\//,
    /^src\/lib\/types\.ts$/,
    /^spikes\//,
    /^public\/_headers$/,
    /^(astro\.config\.mjs|tsconfig\.json)$/,
  ],
  'tk-data': [
    /^src\/(lib|config|data)\//,
    /^scripts\/(?!ci\/)/,
    /^tests\//,
    /^public\/images\/products\//,
    /^package(-lock)?\.json$/,
  ],
  'tk-frontend': [
    /^src\/(pages|components|layouts|islands|scripts|styles)\//,
    /^public\/(?!_headers$|images\/products\/)/,
    /^tests\//,
    /^tailwind\.config\.mjs$/,
  ],
  'tk-apps-script': [/^apps-script\//, /^tests\//],
  'tk-qa': [
    /^tests\//,
    /^e2e\//,
    /^scripts\/ci\//,
    /^(playwright|vitest)\.config\.(ts|mts|mjs|js)$/,
    /^lighthouserc(\.json|\.js|\.cjs)?$/,
    /^package(-lock)?\.json$/,
  ],
  'tk-design': [
    /^docs\/design\/(?!BRAND-VOICE\.md$)/,
    /^docs\/v2\/standards\/MOBILE-UX-STANDARD\.md$/,
  ],
  'tk-brand': [/^docs\/design\/BRAND-VOICE\.md$/],
  'tk-content': [/^src\/data\/products\.json$/, /^src\/content\//],
  'tk-seo': [/^docs\/v2\/standards\/SEO\.md$/, /^docs\/v2\/reports\/seo\//],
  'tk-docs': [/^docs\/(?!learning\/)/, /^README\.md$/],
  'tk-security': [/^docs\/v2\/standards\/SECURITY\.md$/],
  'tk-reviewer': [],
};

/** Roles whose shell is limited to read-only commands (READ_ONLY_COMMANDS). */
export const READ_ONLY_SHELL = new Set(['tk-reviewer', 'tk-security', 'tk-docs', 'tk-seo']);

/** Every command segment of a read-only role must match one of these. */
export const READ_ONLY_COMMANDS = [
  /^git\s+(status|log|diff|show|blame|ls-files|ls-tree|rev-parse|merge-base|grep|shortlog|describe|cat-file|fetch)\b(?!.*\s(--output|-O|--open-files-in-pager|--ext-diff))/,
  /^git\s+branch(\s+(--list|-a|-r|--all|--remotes|--show-current|--contains|--merged|--no-merged|-v|-vv)\b[^;]*)?$/,
  /^git\s+worktree\s+list\b/,
  /^gh\s+(pr|issue|run)\s+(view|diff|list|checks|status)\b/,
  /^(ls|cat|head|tail|wc|grep|uniq|cut|tr|diff|file|stat|pwd|echo|which|date|du)\b/,
  /^sort\b(?!.*\s-o\b)/, // sort -o writes a file
  /^rg\b(?!.*\s--pre\b)/, // rg --pre runs a program
  /^find\b(?!.*\s-(delete|exec|execdir|ok|fprint)\b)/,
  /^npm\s+(ls|audit|outdated|view|explain)\b(?!.*\bfix\b)/,
  /^npm\s+(test|run\s+(test|check|lint|typecheck|validate)(:[\w-]+)?)\b/,
  /^npx\s+(tsc\s+--noEmit|prettier\s+--check|astro\s+check)\b/,
  /^node\s+(--version|-v)$/,
];

export const KNOWN_ROLES = new Set(['lead', ...Object.keys(ALLOW_ONLY)]);
