# Tantu Kala v2 — Git branching strategy (strict)

Version 0.3 · 13 Oct 2026 · Status: **proposed** (supersedes the branching parts of ADR-002 once accepted)

Changelog: 0.3 (13 Oct) — task branches renamed `v2/<id>-<slug>` → `task/<id>-<slug>`: git stores
branches as paths, so a branch `v2` and branches `v2/…` can't exist together (found while testing
the install). 0.2 — worktrees are Claude-managed (`.claude/worktrees/`), not `../tk-<id>`; hotfix
sync `main` → `v2` goes through a PR merged by the owner (the lead can't push to `v2`).

Every agent follows this exactly. Breaking it is a stop-and-report event, not a judgment call.

## 1. Branches

| Branch                  | Purpose                                | Who may push                                | Protection (GitHub ruleset)                                 |
| ----------------------- | -------------------------------------- | ------------------------------------------- | ----------------------------------------------------------- |
| `main`                  | Production (what Cloudflare deploys)   | Nobody directly; PR merge by **owner** only | PR required, 1 approval, no force push, no deletion         |
| `v2`                    | v2 integration                         | Nobody directly; PR merge by **owner**      | PR required, status checks pass, no force push, no deletion |
| `task/<task-id>-<slug>` | One backlog task                       | The **one agent** assigned to that task     | None (but see §4)                                           |
| `hotfix/v1-<slug>`      | Urgent fix to live v1                  | Owner or lead, on request                   | —                                                           |
| `release/v2.N`          | Optional freeze before a phase release | Lead                                        | No force push                                               |

Solo-owner note: GitHub never lets a PR's author approve it, and agents currently push with the
owner's login. So the owner is on the ruleset bypass list **for pull requests only** (merge after
review; no direct pushes for anyone) until agents get their own GitHub account (IN-21). Exact
settings: `claude-code/INSTALL.md` §1.

Tags: `v1.0.0` (done), `v1.0.x` hotfixes, `v2.0.0`, `v2.1.0`, … one per phase release.
Tag ruleset on `v*`: no deletion, no update.

## 2. Flow

```
main ──●───────────────●(v2.0.0)────────●(v2.1.0)──►
        \             / merge release   /
v2 ──────●──●──●──●──●──────●──●──●───●────────────►
          \  /  \  /         \  /
   task/F-1 ●─● task/F-3 ●─●  task/L3-1 ●─●   (each = one agent, one worktree)
```

1. Lead updates its checkout to the latest `v2` (`git switch v2 && git pull`) and spawns the worker;
   Claude Code creates the worker's worktree under `.claude/worktrees/` from that HEAD (§5a).
2. Agent works only in its worktree and first renames its branch:
   `git branch -m task/<task-id>-<slug>`.
3. Before PR: `git fetch origin && git rebase origin/v2`; re-run checks.
4. PR → `v2`. Squash-merge by owner (one commit per task on `v2`, message `feat(<task-id>): …`).
5. Phase release: PR `v2` → `main` by owner after UAT; tag `v2.N.0`.
6. v1 hotfix: `hotfix/v1-*` from `main` → PR to `main` → tag `v1.0.x` → lead opens a PR `main` → `v2`;
   the owner merges it.

## 3. Commit and PR rules

- Conventional commits with task ID: `feat(L3-1): order summary shows shipping waiver`.
- One task per branch, one branch per agent. Never commit to another task's branch.
- PR title `[<task-id>] <summary>`; body from `templates/PR.md`.
- No merge commits on task branches (rebase only). No `--force` except `--force-with-lease`
  on your _own_ task branch after a rebase.

## 4. Forbidden for every agent (enforced, see `AGENT-GUARDRAILS.md`)

- `git push` to `main` or `v2`; any push with `--force` (plain); `git push --delete`; tag
  creation or deletion; `--no-verify`; `git reset --hard` or `git clean -fdx` outside your own
  worktree; rewriting history on shared branches; editing `.git/` directly; changing remotes.
- Worker agents may push **only** their own `task/<task-id>-*` branch. Merges are the owner's.

## 5a. Claude Code–managed worktrees (verified in Claude Code docs, 9 Oct 2026)

- Subagents marked `isolation: worktree` (every `tk-*` agent that writes files) get
  their own worktree under `.claude/worktrees/` automatically. Parallel sessions can also be
  started with `claude --worktree <name>`.
- **Base branch trap:** by default these worktrees branch from the repo's default branch
  (`main` = v1). Our settings set `"worktree": { "baseRef": "head" }`, so the lead session
  must be on an up-to-date `v2` before spawning workers.
- Claude names these branches `worktree-<name>`; the agent renames its branch to
  `task/<task-id>-<slug>` before its first push.
- Add `.claude/worktrees/` to `.gitignore` on `v2` (S-3).

## 5. Worktree housekeeping

- Lead keeps a table of active worktrees in `BACKLOG.md` (task, path, branch, agent).
- After merge: Claude Code cleans up a subagent's worktree when it has no changes; otherwise the
  lead runs `git worktree remove .claude/worktrees/<name>`. The owner deletes the remote task
  branch (or enables GitHub's "automatically delete head branches").
- `node_modules` is per worktree; install with `npm ci` inside it.
