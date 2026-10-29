# Task brief: DZ-2a — Design patterns sheet

- Requirement IDs: NFR-2, NFR-9
- Owner role: design (tk-design)
- Branch: `task/DZ-2a-patterns-sheet` from `v2`
- Depends on (must be Done): DZ-1 (PR #30 merged). Owner inputs answered: D-89, D-90, D-91.
- Files to create/edit: `docs/design/mockups/patterns.html` (new); `docs/design/DESIGN-SYSTEM.md` (tokens and label rule only, per D-89/D-90)
- Files NOT to touch: the 10 page mockups (that is DZ-2b), all of `src/`
- Contracts used (types / API actions): None.
- Read only (max 3 doc sections, file + §): `docs/design/AUDIT-R1.md` §1; `docs/v2/standards/MOBILE-UX-STANDARD.md` §3; `docs/truth/DESIGN.md`
- Model: agent default (Sonnet)

## Why (context — required)

- Why it exists: the DZ-1 audit (11 Must fix) and the 29 Oct design-gates review found the same faults
  repeated across pages. Examples: 6 header variants with 22 px links and no mobile menu, 8 button
  classes, five chip shapes, form fields at 14 px, an undocumented grey at 2.89:1, and no
  focus/empty/error states. Fixing them once in a shared sheet means DZ-2b and the R1 build
  (F-3, F-4) copy correct pieces instead of fixing the same thing 10 times.
  Owner chose "patterns, then pages" on 29 Oct.
- Requirements (verbatim):
> **NFR-2**: Accessibility: WCAG AA contrast for text; every hover interaction has a tap/focus equivalent; reduced-motion respected
> **NFR-9**: Mobile quality bar: every page passes `MOBILE-UX-STANDARD.md` (320–430 px phones, in-app browsers, 200% text, keyboard open); screenshot regression in CI; real-device pass by owner each release
- Decisions this task implements (verbatim from `DECISIONS-LOG.md`):
> **D-61**: LLD-02 components approved: C-1 shared UI pieces in Preact rendered static by default; C-2 filters work on cards already in the page; C-3 checkout = one island/state machine; C-4 zero-JS menu/drawer/gallery/FAQ/effects; C-5 keep v1 image pipeline; C-6 approved reviews pulled at publish time
> **D-63**: Mobile first and bug-free on every screen: `MOBILE-UX-STANDARD.md` (test matrix, rules); `tk-design` designs at 360 px first; screenshot regression at 320/360/412/768/1280
> **D-89**: Text colours: three text shades — muted `#6F6053`, text terracotta `#9A4D2C`, text sage `#56634A`; brand terracotta `#B5603A` and sage `#6B7A5E` stay for buttons, bold ≥ 18.66 px text and accents
> **D-90**: Small labels: sentence case, no letter-spacing, ≥ 12 px, emphasis by weight and colour
> **D-91**: One shared header on every page: logo, a zero-JS menu button (D-61 C-4) and the cart, tap targets ≥ 44 px
> **D-60**: Location wording (owner's final say): **"Handmade in Delhi & Pune"** on brand pages and footer

## Goal

One HTML sheet showing every shared piece in all of its states at 360 px. Each piece must pass the design-gates Floor, so the page redraws (DZ-2b) and the build copy from it.

## Acceptance criteria

- [ ] `patterns.html` shows the following, each with default, focus-visible, pressed, disabled and (where it applies) error, busy, empty and success states:
  - header with a zero-JS menu button and cart
  - footer
  - product card
  - one chip
  - primary, secondary and text-link buttons
  - form field (label, input, hint, error, optional marker)
  - a notice in 2 tones
  - breadcrumb
  - quantity stepper
  - toast
  - photo placeholders at 1:1 studio and 4:5 editorial
- [ ] Every colour is a token from DESIGN-SYSTEM.md as updated per D-89; no other hex values. All text is ≥ 4.5:1 (or ≥ 3:1 if bold ≥ 18.66 px), measured with the values listed.
- [ ] Tap targets are ≥ 44×44 px, inputs use 16 px text and are ≥ 44 px tall, and no text is under 12 px. Labels follow D-90.
- [ ] The file has a `prefers-reduced-motion` rule and a defined focus ring token. It uses no `100vh`. It has no horizontal scroll at 320, 360 and 412 px.
- [ ] The footer says "Handmade in Delhi & Pune" (D-60).
- [ ] design-gates review is attached to the PR: Floor clean, Reflex fixed or waived with a reason.
- [ ] Every interactive piece is marked static (C-1/C-4) or island (C-2/C-3).

## Assumptions (labelled, to confirm)

- Measurements use a headless browser as DZ-1 did. `ui-lint.mjs` needs Playwright, which is deferred (D-84). If no browser is available, findings are labelled "unmeasured".

## Out of scope

- Redrawing the 10 pages (DZ-2b), any code in `src/`, copy changes.

_Status: drafted by the lead on 29 Oct 2026. Proposed only; the owner decides. Blocked on DZ-1 merge only (inputs answered 29 Oct)._
