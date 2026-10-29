# Task brief: DZ-2b — Apply patterns to the 10 mockups

- Requirement IDs: NFR-2, NFR-9
- Owner role: design (tk-design); copy check by brand (tk-brand)
- Branch: `task/DZ-2b-apply-patterns` from `v2`
- Depends on (must be Done): DZ-2a; owner input IN-34 (homepage shape). IN-35 and IN-36 are not blocking; they stay `[OWNER: …]` gaps until answered.
- Files to create/edit: the 10 files in `docs/design/mockups/` (`404`, `about`, `cart-checkout`, `catalog-nav`, `contact`, `custom-order`, `festival-landing`, `homepage`, `product-detail`, `shipping-returns`)
- Files NOT to touch: `patterns.html` and `DESIGN-SYSTEM.md` (DZ-2a), all of `src/`
- Contracts used (types / API actions): None.
- Read only (max 3 doc sections, file + §): `docs/design/mockups/patterns.html`; `docs/design/AUDIT-R1.md` §3; `docs/truth/PRODUCT.md`
- Model: agent default (Sonnet)

## Why (context — required)

- Why it exists: on 29 Oct, the design-gates and brand reviews of the 10 mockups found the following
  beyond DZ-1's measurements:
  - **Invented facts:**
    - "Loved this week"
    - "Ships in 3–5 days" and "In stock" on made-to-order pieces
    - catalog counts
    - the About stat strip
    - shipping and returns timelines
    - reply times
    - `tantukala@upi`
  - **A cart total that leaves out shipping**, which breaks hard rule 5.
  - **"Handmade in India"** on 7 pages, against D-60.
  - **No macramé anywhere**, against D-13.
  - **Template layouts** and **inconsistent names for the same action** (custom order/request, Add/Add to Cart).

  Builders copy mockups, so these must be fixed in the mockups.
- Requirements (verbatim):
> **NFR-2**: Accessibility: WCAG AA contrast for text; every hover interaction has a tap/focus equivalent; reduced-motion respected
> **NFR-9**: Mobile quality bar: every page passes `MOBILE-UX-STANDARD.md` (320–430 px phones, in-app browsers, 200% text, keyboard open); screenshot regression in CI; real-device pass by owner each release
- Decisions this task implements (verbatim from `DECISIONS-LOG.md`):
> **D-06**: Standard shipping ₹89 (incl. packaging); free above ~₹500–700
> **D-13**: Brand = art from threads: crochet, macramé, pipe cleaner
> **D-60**: Location wording (owner's final say): **"Handmade in Delhi & Pune"** on brand pages and footer
> **D-63**: Mobile first and bug-free on every screen: `MOBILE-UX-STANDARD.md` (test matrix, rules); `tk-design` designs at 360 px first; screenshot regression at 320/360/412/768/1280
- Hard rules: CLAUDE.md rule 5 (the total never changes after recording) and rule 8 (no invented facts).

## Goal

Ten mockups built only from DZ-2a pieces. They state only sourced facts and pass design-gates, so R1 pages can be built from them.

## Acceptance criteria

- [ ] Every page uses only DZ-2a pieces: one header (with menu), one footer, one card, one chip and three button types. No one-off component classes remain.
- [ ] Every DZ-1 Must fix (M1–M11) that applies to a page is fixed or explicitly waived with a reason in the PR.
- [ ] No fact appears without a source. Each price, time, count, stat, quote, contact detail or policy line is either backed by a D-number/IN-answer or replaced with a visible `[OWNER: …]` gap. tk-brand confirms this per page.
- [ ] The cart shows a shipping line (₹89 per D-06, or "free above [OWNER: IN-06]"), and the total equals subtotal + shipping (rule 5).
- [ ] The footer says "Handmade in Delhi & Pune" on all 10 pages (D-60). Macramé appears wherever the crafts are listed (D-13).
- [ ] One name for the custom flow and one label per action across all pages, as listed in the PR.
- [ ] The homepage follows IN-34. On the festival page, the festival name and cutoff date are `[OWNER: …]` gaps; no festival date is hard-coded. Deity-motif products are held until IN-36 is answered.
- [ ] Each page shows its missing states (empty cart, 0 filter results, form error, sent/added, busy).
- [ ] `prose-lint` runs on all 10 files with 0 errors. False positives from comments are noted as such (see proposal P-05). design-gates is clean on Floor.

## Assumptions (labelled, to confirm)

- Mockup disclaimers ("Mockup for design review") stay, marked so the build drops them.

## Out of scope

- Writing final copy (tk-content, after the owner inputs are answered), any code in `src/`.

_Status: drafted by the lead on 29 Oct 2026. Proposed only; the owner decides. Blocked on DZ-2a and IN-34._
