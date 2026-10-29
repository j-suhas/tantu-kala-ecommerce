# Installing the agent kit on `v2` (tasks S-1b, S-2, S-3, S-6, S-8)

Version 0.2 · 13 Oct 2026 · For the owner, by hand, in PowerShell from the repo root
(`C:\Users\suhas\global-workspace\project-tantu-kala`).

## 0. What "installing" means

Claude Code reads its configuration from fixed places in the repo. The kit in this folder is the
reviewed **source**; installing = copying it to those places on the `v2` branch only (v1 on `main`
keeps its own `CLAUDE.md`). `install-kit.mjs` does the copying and then tests the hooks.

| Kit file (source)       | Installed as                       | Read by                                                               |
| ----------------------- | ---------------------------------- | --------------------------------------------------------------------- |
| `CLAUDE.v2.md`          | `CLAUDE.md`                        | every session and agent, at start                                     |
| `AGENTS.v2.md`          | `AGENTS.md`                        | other AI tools (points to `CLAUDE.md`)                                |
| `settings.v2.json`      | `.claude/settings.json`            | Claude Code: deny rules, hooks, worktree base                         |
| `agents/tk-*.md` (12)   | `.claude/agents/`                  | `/agents`; the lead delegates to them                                 |
| `hooks/*.mjs`           | `.claude/hooks/`                   | run before/after every tool call                                      |
| `skills/*/SKILL.md` (5) | `.claude/skills/`                  | the lead's repeatable procedures                                      |
| `CODEOWNERS.v2`         | `.github/CODEOWNERS`               | GitHub: who must review which paths                                   |
| `../templates/PR.md`    | `.github/pull_request_template.md` | GitHub PR form                                                        |
| (lines added)           | `.gitignore`                       | `.claude/worktrees/`, `.claude/settings.local.json`, `docs/learning/` |

Not installed yet: `ci.v2.yml` (task CI-1, once F-7 scripts exist) and `vscode-settings.v2.json`
(S-9; `.vscode/` is git-ignored, so it's only for your own editor).

## 1. Branch and rulesets (S-1b) — two things found on 12 Oct

**a. Your working copy is on `feat/bug-fixes`, and local `main` is behind `origin/main`**
(local `4174cae`, origin `10cde35` = `v1.0.0`). Create `v2` from the up-to-date `main`. The new,
untracked docs come with you when you switch branches.

```powershell
git switch main
git pull
git fetch --tags
git switch -c v2
git push -u origin v2
```

**b. Self-approval trap.** GitHub never lets a PR's author approve it. Agents push with your Git
login, so their PRs count as yours — "1 required approval" would block every merge. Set the
rulesets like this (GitHub → repo → Settings → Rules → Rulesets):

| Ruleset           | Target                   | Rules                                                                                                        | Bypass list                                   |
| ----------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| `protect-tags`    | Tags matching `v*`       | Restrict updates, Restrict deletions                                                                         | none                                          |
| `protect-main-v2` | Branches `main` and `v2` | Restrict deletions, Block force pushes, Require a pull request (1 approval, Require review from Code Owners) | Repository admin → **For pull requests only** |

"For pull requests only" (GitHub docs, checked 12 Oct): nobody — you, or an agent using your
login — can push straight to `main`/`v2`; you can still merge a PR after reviewing it, ticking the
bypass box. Also tick Settings → General → **Automatically delete head branches**.
Proper fix later: agents get their own GitHub machine account (IN-21), so their PRs need your real
approval and they have no bypass. Until then, merging is blocked for agents only by our local
hook (`gh pr merge` is denied) — a known gap, logged in AGENT-GUARDRAILS.

## 1b. Agent identity: the bot account (do this before §2)

Goal: everything Claude Code does on GitHub runs as `tantu-kala-bot`; your own terminals (VS Code)
and browser stay exactly as they are — nothing about your own login changes. Prerequisites: bot
account with 2FA, collaborator invite **accepted** (Settings → Collaborators shows it without
"Pending"), classic token with only `repo` + `project`, stored in your password manager.

All paths below are inside the repo folder `C:\Users\suhas\global-workspace\project-tantu-kala`.
Run the commands in a VS Code terminal opened at that folder (the prompt ends with
`project-tantu-kala>`). Folders starting with a dot (`.git`, `.claude`) are hidden by VS Code's
explorer, but they're there.

1. **GitHub CLI installed** (agents use it for pull requests; it does **not** need you to log in):
   `gh --version` — if missing: `winget install --id GitHub.cli`, then open a new terminal.

2. **Keep the token file out of git — before creating it:**
   `Add-Content .git\info\exclude ".claude/settings.local.json"` (skip if already done).

3. **Create the file that gives Claude Code the bot identity.** Get the bot's private email first
   (as the bot: Settings → Emails → tick "Keep my email addresses private" → copy the
   `…@users.noreply.github.com` address). Then:

   ```powershell
   New-Item -ItemType Directory -Force .claude | Out-Null
   code .claude\settings.local.json
   ```

   Paste this, fill in the two `< >` values, save:

   ```json
   {
     "env": {
       "GH_TOKEN": "<bot token from your password manager>",
       "GIT_AUTHOR_NAME": "tantu-kala-bot",
       "GIT_AUTHOR_EMAIL": "<bot noreply email>",
       "GIT_COMMITTER_NAME": "tantu-kala-bot",
       "GIT_COMMITTER_EMAIL": "<bot noreply email>",
       "GIT_TERMINAL_PROMPT": "0",
       "GIT_ASKPASS": "",
       "GIT_CONFIG_COUNT": "2",
       "GIT_CONFIG_KEY_0": "credential.https://github.com.helper",
       "GIT_CONFIG_VALUE_0": "",
       "GIT_CONFIG_KEY_1": "credential.https://github.com.helper",
       "GIT_CONFIG_VALUE_1": "!f() { test -n \"$GH_TOKEN\" && echo username=x-access-token && echo \"password=$GH_TOKEN\"; }; f"
     }
   }
   ```

   `git status` must **not** list this file. Never paste the token anywhere else.

What the `GIT_CONFIG_*` lines do: only inside Claude Code, they switch off your saved GitHub login
for git and hand git the bot token instead. If the token is ever missing, git fails rather than
falling back to you (tested 13 Oct with stand-in helpers: owner login without these lines, bot
token with them, failure when the token is missing).

Why this is safe enough: Claude Code applies `env` only to its own sessions (after you trust the
folder). The hooks also refuse `git push` and `gh` commands when the token isn't loaded, and stop
agents from reading this file or printing the token. Anyone with access to your laptop can read the
file — the bot's limited rights keep that acceptable. Renew the token before it expires (90 days).

## 2. Commit the docs and install the kit (S-2, S-3) on a setup branch

`v2` now requires PRs, so use a branch, exactly like an agent will:

```powershell
git switch v2
git switch -c task/S-3-setup
git status                      # untracked: docs/README.md, docs/design/, docs/v2/, .editorconfig, .prettier*

git add docs/README.md docs/design docs/v2
git commit -m "docs(S-2): v2 docs, design mockups and decisions log"

node docs/v2/claude-code/install-kit.mjs     # copies the kit, adds .gitignore lines, runs 112 hook tests
git add CLAUDE.md AGENTS.md .claude .github .gitignore .editorconfig .prettierrc.json .prettierignore
git status                      # must NOT show docs/learning/, any .env file, or .claude/worktrees/
git commit -m "chore(S-3): install Claude Code agent kit"
git push -u origin task/S-3-setup
```

On GitHub: open a PR **base `v2` ← `task/S-3-setup`**, read "Files changed", merge. Then:

```powershell
git switch v2
git pull
```

Notes: the self-test must print `112/112 hook cases passed`; if not, stop and send me the output.
GitHub shows the PR template only once it reaches the default branch (`main`), so agents pass
the template text themselves until v2 ships.

## 3. Check Claude Code sees it (S-6)

Use the standalone CLI for these checks (install: `irm https://claude.ai/install.ps1 | iex`, then a
new terminal). The VS Code extension runs the same engine but offers only some slash commands.

```powershell
claude --version                # must be 2.1.295 or newer (needed for the hooks' onFailure: block)
claude doctor                   # read-only: install health + settings-file validation errors
claude                          # start the lead session from the repo root, on v2
```

Inside the session:

1. Accept the **workspace trust** prompt — project hooks and the bot `env` don't apply until you do.
2. **Agents:** ask the lead "List the project subagents you can delegate to." → 12 `tk-*` names.
   (`/agents` now only prints a reminder to edit `.claude/agents/` — that's expected since Claude
   Code v2.1.198. If an agent is missing, restart with `claude --debug`: skipped agent files are
   logged with the reason.)
3. **Hooks loaded:** `/hooks` (CLI) — or, in the VS Code extension, the **Customize → Hooks** section
   → PreToolUse `Bash|PowerShell` and `Edit|Write|NotebookEdit`, PostToolUse, SessionStart, all from
   project settings.
4. **Hooks actually run:** ask the lead "Run `printenv GIT_AUTHOR_NAME`." → must be **blocked**
   ("Blocked by Tantu Kala guardrails: printing environment variables…"). If it prints
   `tantu-kala-bot`, the bot identity loaded but the hooks did **not** run — stop and tell me.
5. **Permissions:** `/permissions` (CLI) → the deny rules (pushes, tags, deploys, `.env`,
   owner-only files).
6. **Bot identity:** ask the lead "Run `gh api user --jq .login`." → `tantu-kala-bot`. (This alone
   doesn't prove the hooks run — step 4 does.)
7. If an agent fails with a model error on your plan, change its `model:` (e.g. `opus` or `sonnet`) to `inherit` in
   the kit's agent files and reinstall (section 5).

## 4. Smoke-test the permissions (S-8) — say these to the lead

| Say to the lead                                                                                                                       | Expected                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Use tk-reviewer to run `echo test > smoke.txt`."                                                                                     | Blocked: read-only shell                                                                                                                                                                                                   |
| "Use tk-frontend to create `src/pages/smoke-test.astro` with `<p>ok</p>`, then add a comment to `src/config/site.mjs`. Don't commit." | First allowed; second blocked: outside tk-frontend's scope                                                                                                                                                                 |
| "Add a line to CLAUDE.md."                                                                                                            | Blocked: owner-only                                                                                                                                                                                                        |
| "Run `git push origin v2`."                                                                                                           | Blocked                                                                                                                                                                                                                    |
| "Create branch `task/T-0-bot-check` with an empty commit, push it and open a draft PR into `v2`."                                     | PR author and commit author = **tantu-kala-bot**; on GitHub, repo → **Activity** shows the push by tantu-kala-bot (proves git used the bot token). You can approve it. Then close it without merging and delete the branch |
| "Run `gh project list --owner j-suhas`" via tk-frontend                                                                               | Blocked: only the lead updates the board                                                                                                                                                                                   |
| "Remove the smoke-test worktree and its branch."                                                                                      | Lead cleans up                                                                                                                                                                                                             |

Note what happened in your journal (`docs/learning/`) — a block you expected but didn't see is
the important finding.

## 5. Changing the kit later

The kit folder is the source; never hand-edit `.claude/`. Edit the kit (or let Cowork draft it),
then on a `task/...` branch run `node docs/v2/claude-code/install-kit.mjs` and open a PR. Check for
drift any time with `node docs/v2/claude-code/install-kit.mjs --check` (exit 1 = installed copy
differs). Both folders are owner-only for Claude Code and covered by CODEOWNERS.

## 6. If something goes wrong

- `install-kit: you are on "main"` → you skipped `git switch -c task/S-3-setup`.
- "bot token (GH_TOKEN) is not loaded" → `.claude/settings.local.json` is missing, has a JSON error, or the
  folder isn't trusted yet; fix it and restart `claude`.
- A hook error mentioning `node` → Node isn't on the PATH Claude Code uses; run `node --version`.
- Agents can edit outside their scope → hooks aren't running: re-check step 3.1 and `/hooks`.
- Your Claude Code uses the PowerShell tool instead of Bash for agents → tell me; worker tool
  lists name `Bash` only (the hooks already cover both).

## 7. Kit v3 (29 Oct 2026): gated workflow, new skills and agents

What changes: 17 process skills, 2 new agents (`tk-social`, `tk-analyst`), all agents get the
`Skill` tool, a new `gate-check.mjs` hook, check scripts in `.claude/scripts/`, truth files in
`docs/truth/`. The permission model is unchanged; new roles follow the same rules (145/145 hook
cases pass, including the original 113).

```powershell
git switch v2; git pull
git switch -c task/S-12-kit-v3
node C:\Users\suhas\global-workspace\agent-research\builds\tantu-kala-kit-v3\apply.mjs
node docs/v2/claude-code/install-kit.mjs        # expect 145/145 hook cases passed
git add -A docs .claude CLAUDE.md AGENTS.md
git status                                     # no settings.local.json, no docs/learning
git commit -m "chore(S-12): agent kit v3 — gated workflow, 17 skills, tk-social, tk-analyst"
git push -u origin task/S-12-kit-v3
```

Open the PR, squash-merge with the bypass box, `git switch v2; git pull`, then start a new lead
session. Optional plugin (Instagram skills for `tk-social`), installed by you, **local scope** so
it isn't written into the shared settings file:

```text
/plugin marketplace add Jakeschincariol/instagram-agent-skill
/plugin install instagram-agent@instagram-agent-skill      → choose "local" scope
```

Its checks are small Python scripts; install Python 3 if you want them (`winget install
Python.Python.3.12`), otherwise `tk-social` follows the written method.
