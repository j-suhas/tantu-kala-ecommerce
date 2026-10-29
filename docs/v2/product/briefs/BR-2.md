# Task brief: BR-2 — Tagline on the website

- Requirement IDs: — (Backlog item only)
- Owner role: content + data, after brand and SEO review
- Branch: `task/BR-2-site-tagline` from `v2`
- Depends on (must be Done): PR #22 merged (decides the tagline, D-79 after renumbering); existing deferred input IN-27 (homepage title)
- Files to create/edit: `src/config/site.mjs`, Footer and `Seo` tagline usage only
- Files NOT to touch: packaging files, `docs/design/concepts/`
- Contracts used (types / API actions): None.
- Read only (max 3 doc sections, file + §): `SEO.md` homepage title section; the PK-1 decisions once merged
- Model: agent default (Sonnet)

## Why (context — required)

- Why it exists: The owner chose the tagline "Art made from threads" for packs and said to update the website as well, but `Seo.astro` builds the homepage title from the tagline, so changing it alone would also change the page title. The owner deferred the title discussion.
- Backlog row (verbatim):
> (BR-2 is added to the Backlog by PR #22, not yet on `v2`; copy the row verbatim once it merges.)
- Requirements (verbatim):
> (no requirement row; see the Backlog row)
- Decisions this task implements (verbatim from `DECISIONS-LOG.md`):
> **D-60** (12 Oct, D): Location wording (owner's final say): **"Handmade in Delhi & Pune"** on brand pages and footer

## Goal

Website tagline matches the packs without silently changing the homepage title.

## Acceptance criteria

- [ ] Footer and any tagline slot show the chosen wording.
- [ ] Homepage `<title>` and `og:title` are unchanged unless IN-27 is answered (show before/after).
- [ ] SEO lint passes (SEO-8).

## Assumptions (labelled, to confirm)

- Stays **Blocked** until PR #22 merges and IN-27 is answered or the owner accepts "change the tagline only, keep the current title".

## Out of scope

- New homepage title, packaging.

_Status: drafted by the lead on 22 Oct 2026. Proposed only; the owner decides. Not yet on the board._
