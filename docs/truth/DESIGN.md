# DESIGN: Tantu Kala (truth file)

Approved by Suhas 29 Oct 2026 (D-87) · from `docs/design/DESIGN-SYSTEM.md` (still marked
PROPOSAL there; exact hex values and Karla are not yet confirmed) and `MOBILE-UX-STANDARD.md` ·
the design-gates skill reads this file.

## Tokens (proposal)
| Token | Hex | Use |
| --- | --- | --- |
| Umber | `#4D3126` | Brand anchor (logo brown, confirmed); headlines, primary buttons |
| Terracotta | `#B5603A` | CTAs, price, hover |
| Mustard | `#C99A44` | Accent only: badges, dividers, occasion tags |
| Warm Ivory | `#FAF3E7` | Page background |
| Clay Sand | `#EDE1CC` | Cards, panels |
| Charcoal Umber | `#33241E` | Body text |
| Sage | `#6B7A5E` | Availability / in-stock |
| Rosewood | `#6E2E33` | Festival moments only, never everyday identity |
| Muted text | `#6F6053` | Hints, fine print, "(optional)" — 5.48:1 on ivory (D-89) |
| Text terracotta | `#9A4D2C` | Small links, prices, active nav — 5.48:1 on ivory (D-89) |
| Text sage | `#56634A` | Availability, small success text — 5.81:1 on ivory (D-89) |

Brand Terracotta and Sage are for buttons, bold text ≥ 18.66 px and accents only (D-89).

Fonts: **Fraunces** for display and H1/H2 (confirmed); **Karla** for body and UI (proposed;
alternative Work Sans). `ui-lint --fonts "Fraunces,Karla"`. Body 16 px / 1.6.

## Photography
Studio register for the catalog (warm ivory paper, one soft light, same angle, 1:1, no props,
≥ 2000 px); editorial register for stories (real daylight, real use, 4:5 or 1:1 on mobile).
Real product photos only.

## Floor: never ships (design-gates)
WCAG AA contrast and visible focus; no horizontal scroll at 320–412 px; tap targets ≥ 44 px;
reduced motion respected; `dvh/svh` not `100vh`; no invented facts or reviews; no AI/stock
product photos; no card inside a card; tokens only; no placeholder copy or buzzwords.

## Banned defaults (Reflex: fix or waive with a reason)
AI template (hero + three equal feature cards + CTA + four-column footer); emoji icons;
gradient text, glow blobs; centred everything; same gap and background on every section;
email sign-up as the closing section on selling pages; drawn illustrations where a product
photo belongs.

## Labels (decided)
Small labels are **sentence case**, no letter-spacing, ≥ 12 px, emphasis by weight and colour (D-90).
One shared header on every page: logo, zero-JS menu button, cart, ≥ 44 px targets (D-91).

## Note on the brand look
Ivory paper + high-contrast serif + terracotta accent is exactly the "named look" generic AI
designs fall into. It is our approved brand, so specificity must come from the real things:
the products, the making, the cities, the festivals — never from decoration.
