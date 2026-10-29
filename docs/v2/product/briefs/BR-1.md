# Task brief: BR-1 — Brand voice guide

- Requirement IDs: — (Backlog item only)
- Owner role: brand (tk-brand), with the owner
- Branch: `task/BR-1-brand-voice` from `v2`
- Depends on (must be Done): S-8 (Done); **owner input IN-30** (how the brand should sound)
- Files to create/edit: `docs/design/BRAND-VOICE.md` (new)
- Files NOT to touch: `docs/design/DESIGN-SYSTEM.md`, `src/config/site.mjs`, product copy
- Contracts used (types / API actions): None.
- Read only (max 3 doc sections, file + §): `docs/design/BRAND-RESEARCH.md`; `docs/design/DESIGN-SYSTEM.md` (voice/tone parts only)
- Model: agent default (Sonnet)

## Why (context — required)

- Why it exists: Every content and brand review (product copy, page copy, campaigns, packs) needs one written standard to review against. Today the voice lives in the owner's head and scattered mockup copy.
- Backlog row (verbatim):
> **BR-1** — `BRAND-VOICE.md` drafted by `tk-brand` from the design system + owner input; owner approves | brand + owner | S-8 | Blocked
- Requirements (verbatim):
> (no requirement row; see the Backlog row)
- Decisions this task implements (verbatim from `DECISIONS-LOG.md`):
> **D-60** (12 Oct, D): Location wording (owner's final say): **"Handmade in Delhi & Pune"** on brand pages and footer

## Goal

A one-to-two-page voice guide the content agent writes to and the brand agent reviews against, which the owner approves.

## Acceptance criteria

- [ ] States who the brand speaks to and how it sounds, with 3 do / don't pairs in the owner's own words from IN-30.
- [ ] Lists words and claims to avoid, including the standing rules: no location on packs, no material claim where a decision forbids it, and "our shop" never used for third-party stalls.
- [ ] Each rule traces to an owner statement or a decision ID; nothing invented. Any rule without a source is marked **proposed**.
- [ ] Includes 5 before/after rewrites of real site copy as examples.
- [ ] Owner approval is recorded in the PR before the status becomes Done.

## Assumptions (labelled, to confirm)

- Tagline wording is settled in PR #22 (renumbered D-79) and is not re-decided here. Until that PR merges, the guide leaves the tagline out.

## Out of scope

- Rewriting site copy (BR-2 site part, content tasks).

_Status: drafted by the lead on 22 Oct 2026. Proposed only; the owner decides. Not yet on the board._
