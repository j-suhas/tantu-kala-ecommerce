---
name: design-gates
description: 'Use for every Tantu Kala design, mockup, page build or design review. Three tiers of gates — Floor (never ships), Reflex (AI defaults: fix or waive on the record), Finish (craft, answered) — plus a pre-show critique, so pages look made by a careful designer, not generated, and work on Android phones first.'
---

# Design gates

Credits: tier model, waivers and many gates adapted from nutlope/hallmark `gates.md` (MIT);
critique vocabulary from pbakaus/impeccable (Apache-2.0); mobile rules from our
`docs/v2/standards/MOBILE-UX-STANDARD.md`. Rewritten for Tantu Kala.

**Our design system is the theme.** `docs/truth/DESIGN.md` (from `docs/design/DESIGN-SYSTEM.md`,
owner-approved) wins over any generic gate. Note: hallmark flags "ivory paper + serif display +
terracotta accent" as a reflex look on *custom* builds — for us it is the approved brand, so that
gate is waived by design decision, not by taste.

## Floor — never ships (no waiver)
1. Text contrast below WCAG AA (4.5:1 body, 3:1 large); focus not visible on every control.
2. Any horizontal scroll at 320–412 px; layout broken at 360 px; text under 12 px.
3. Tap targets under 44×44 px (buttons, inputs, nav, chips).
4. Motion that ignores `prefers-reduced-motion`; hover-only actions; `100vh` heroes (use `dvh/svh`).
5. Invented facts: fake reviews, counts, "bestseller", stock levels, ratings, logos, delivery
   promises not in `PRODUCT.md`.
6. AI or stock images used as product photos; images without meaningful `alt`.
7. A card inside a card; two sticky bars stacked (pay bar over inputs).
8. Colours or fonts outside the tokens; raw spacing values where a spacing token exists.
9. Placeholder copy (Lorem, Jane Doe) or generic buzzwords (seamless, elevate, unlock, curated).

## Reflex — the defaults a model falls into (fix, or waive on the record with a reason)
- Hero + three equal feature cards + CTA + four-column footer: the AI template.
- Three equal columns of icon-above-heading tiles; icons in rounded squares.
- Every section the same height, gap and background.
- Centred everything; more than ~80 words before the first action on a phone.
- Gradient text, glow blobs, glassmorphism, drop shadows on everything.
- Tracked uppercase micro-labels everywhere; an accented word in a heading.
- Email sign-up as the closing section when the page's job is to sell.
- Emoji as bullets or icons; a drawn illustration where a real product photo belongs.

Waiver format, in the design file or PR: `Waive: <gate> — <evidence> — <reason>`.
Three waivers of the same gate → propose a design-system rule instead.

## Finish — craft details (answer each, never blocking)
Line length 45–75 characters for prose; heading spacing (more above than below); price and
delivery estimate readable at arm's length; image crops consistent across a grid; empty, loading
and error states designed; WhatsApp/Instagram in-app browser check.

## Before showing anything: critique (score 1–5)
Purpose (could a customer say what this page is for?) · Hierarchy (survives a squint) ·
Specificity (could belong to no other brand) · Restraint (one decoration too many?) ·
Mobile (thumb reach, one-hand use) · Truth (every claim sourced). Anything under 3 → revise first.
Name the weakest axis and the fix in one line.

## Checks that need no AI
`node .claude/scripts/ui-lint.mjs <page> --widths 320,360,412 --fonts "Fraunces,Karla"` once
Playwright is installed (ADR-006), and `prose-lint` on the copy. Fresh-context review: give a
reviewer only the page and the brief and ask "would a careful designer at this studio ship this?
What gives it away?"
