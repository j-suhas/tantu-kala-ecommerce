# Task brief: DZ-1 — Design audit

- Requirement IDs: NFR-1, NFR-2, NFR-9
- Owner role: design (tk-design)
- Branch: `task/DZ-1-design-audit` from `v2`
- Depends on (must be Done): S-8 (Done)
- Files to create/edit: `docs/design/AUDIT-R1.md` (new)
- Files NOT to touch: `docs/design/DESIGN-SYSTEM.md`, `docs/design/mockups/*.html` (approved; findings are *proposals* for the owner), all of `src/`
- Contracts used (types / API actions): None.
- Read only (max 3 doc sections, file + §): `docs/design/DESIGN-SYSTEM.md`; `docs/design/DESIGN-CHANGES.md`; `standards/MOBILE-UX-STANDARD.md`
- Model: agent default (Sonnet)

## Why (context — required)

- Why it exists: The owner approved the mockups, and the mobile standard (D-63) and component model (D-61) were decided around the same time (12 Oct). Whether the mockups meet them has not been checked. Building R1 on a flawed plan means rebuilding pages, so the plan is audited first.
- Backlog row (verbatim):
> **DZ-1** — **Design audit:** `tk-design` reviews the full design plan (system + all mockups + design-change list) against UI/UX standards and the requirements; findings to owner before R1 build | design | S-8 | Blocked
- Requirements (verbatim):
> **NFR-1**: Mobile performance: Lighthouse mobile ≥ 90 performance on catalog and product pages; JS per page island ≤ ~15 KB gzipped unless justified in the PR
> **NFR-2**: Accessibility: WCAG AA contrast for text; every hover interaction has a tap/focus equivalent; reduced-motion respected
> **NFR-9**: Mobile quality bar: every page passes `MOBILE-UX-STANDARD.md` (320–430 px phones, in-app browsers, 200% text, keyboard open); screenshot regression in CI; real-device pass by owner each release
- Decisions this task implements (verbatim from `DECISIONS-LOG.md`):
> **D-61** (12 Oct, D): LLD-02 components approved: C-1 shared UI pieces in Preact rendered static by default; C-2 filters work on cards already in the page; C-3 checkout = one island/state machine; C-4 zero-JS menu/drawer/gallery/FAQ/effects; C-5 keep v1 image pipeline; C-6 approved reviews pulled at publish time
> **D-63** (12 Oct, D): Mobile first and bug-free on every screen: `MOBILE-UX-STANDARD.md` (test matrix, rules); `tk-design` designs at 360 px first; screenshot regression at 320/360/412/768/1280

## Goal

A ranked list of design flaws and fixes in the full design plan, so the owner can decide what changes before R1 pages are built.

## Acceptance criteria

- [ ] Every approved mockup is checked at 320, 360 and 412 px against `MOBILE-UX-STANDARD.md`; each finding names the mockup, the viewport and the rule.
- [ ] Contrast, tap-target and hover-equivalent checks (NFR-2) are recorded with the measured values, not impressions.
- [ ] Findings are ranked **Must fix before R1 / Should fix / Nice**, and each says which requirement ID it touches.
- [ ] The audit lists anything in the design system that conflicts with D-61 (Preact islands, zero-JS default) or the Lighthouse target in NFR-1.
- [ ] No file other than `AUDIT-R1.md` changes.

## Assumptions (labelled, to confirm)

- Mockups are audited as static HTML at the viewports above; real-phone testing remains an owner task.

## Out of scope

- Redesigns, new mockups, any code.

_Status: drafted by the lead on 22 Oct 2026. Proposed only; the owner decides. Not yet on the board._
