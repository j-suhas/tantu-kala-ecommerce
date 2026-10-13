// DRAFT PreToolUse hook for Edit|Write|NotebookEdit (install at .claude/hooks/guard-files.mjs).
// Role = the hook input's `agent_type` (set for subagents and `claude --agent <name>` sessions).
// No agent_type = the main thread = the lead. Hand-started workers MUST use `claude --agent tk-<role>`.
// Rules live in policy.mjs. Exit 2 + stderr = blocked; the reason is shown to the agent.
import { readFileSync } from 'node:fs';
import { ALLOW_ONLY, GROUPS, KNOWN_ROLES, OWNER_ONLY, toRepoPath } from './policy.mjs';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const raw = input?.tool_input?.file_path ?? input?.tool_input?.notebook_path ?? '';
const role = input?.agent_type ?? 'lead';
const rel = toRepoPath(raw, process.env.CLAUDE_PROJECT_DIR ?? input?.cwd);

function deny(msg) {
  process.stderr.write(
    `Blocked by Tantu Kala guardrails: ${msg} Propose the change in your handoff note instead.\n`,
  );
  process.exit(2);
}

if (!KNOWN_ROLES.has(role))
  deny(`agent type "${role}" may not write files. The lead delegates edits to a tk-* agent.`);
if (rel === null) {
  if (role !== 'lead') deny(`${raw} is outside the repository.`);
  process.exit(0); // lead outside the repo: Claude Code's own permission prompt applies
}
if (OWNER_ONLY.some((re) => re.test(rel))) deny(`${rel} is owner-only.`);
if (role !== 'lead' && !ALLOW_ONLY[role].some((re) => re.test(rel)))
  deny(`${rel} is outside ${role}'s write scope (see AGENT-WORKFLOW §2).`);
const group = GROUPS.find((g) => g.re.test(rel));
if (group && !group.roles.includes(role))
  deny(`${rel} is reserved for: ${group.roles.join(', ')} (you are ${role}).`);
process.exit(0);
