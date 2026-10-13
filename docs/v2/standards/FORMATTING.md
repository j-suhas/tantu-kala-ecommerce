# Tantu Kala — one formatting standard for owner, agents and Cowork

Version 0.1 · 9 Oct 2026 · Status: **phase 1 active; phase 2 proposed (needs owner OK — adds dev dependencies)**

Goal: saving a file never reformats lines you didn't touch. That only works if every editor,
agent and tool formats with the **same tool, same version, same settings**, and the repo has
been formatted once with them.

## What caused the churn

- The repo had **no formatter config**, so your editor's Prettier used its own defaults
  (double quotes, 80-column wrapping), while v1 code mostly uses single quotes and longer lines.
- Some files in the working copy have Windows (CRLF) line endings.
- Docs written by Claude had compact Markdown tables; Prettier pads tables on save.

## Phase 1 — active now (no dependency changes)

Added at the repo root (untracked until committed to `v2` in S-2/S-3):

| File               | Purpose                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| `.editorconfig`    | UTF-8, LF line endings, 2-space indent, final newline — read by almost every editor                           |
| `.prettierrc.json` | The standard: `printWidth 100`, single quotes, semicolons, trailing commas, LF, Markdown prose not re-wrapped |
| `.prettierignore`  | Skips build output, dependencies, images, HTML mockups, Claude worktrees                                      |

All v2 docs, agent definitions, hooks and skills were formatted once with **Prettier 3.9.9**
using this config (the hooks were re-tested afterwards). Saving them in your editor should now
change nothing. `.gitattributes` already stores text as LF.

**Your editor:** if you use VS Code, keep the Prettier extension and turn on
"Prettier: Require Config" so it only formats where this config exists. `.astro` files are not
formatted in phase 1 (needs the Astro plugin, phase 2).

## Phase 2 — on the `v2` branch (setup task S-9, needs your OK)

1. **Pin the tools** as dev dependencies (exact versions, no `^`): `prettier`,
   `prettier-plugin-astro`; add `"plugins": ["prettier-plugin-astro"]` to the config.
   Scripts: `format` (`prettier --write .`) and `format:check` (`prettier --check .`).
2. **One baseline commit** — "style: format repo with Prettier" — formatting only, no logic
   changes. Measured on v1 code: **30 files, ~714 lines added / 455 removed** (excluding line-ending
   fixes). Its commit hash goes into `.git-blame-ignore-revs` so `git blame` skips it.
3. **Shared editor settings** committed in `.vscode/settings.json` (format on save, Prettier as
   default formatter, require config, use the repo's Prettier) and `.vscode/extensions.json`
   (recommended extensions). `.gitignore` currently ignores all of `.vscode/` — un-ignore just
   these two files.
4. **Agents format automatically:** a Claude Code `PostToolUse` hook runs Prettier on every
   file an agent edits (`claude-code/hooks/format-file.mjs`).
5. **CI enforces it:** `npm run format:check` fails a PR that isn't formatted.
6. **Cowork (Claude here)** runs the repo's pinned Prettier on every file it edits.

Rule for everyone: **never mix formatting changes with logic changes in one commit.**
