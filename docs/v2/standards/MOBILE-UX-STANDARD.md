# Tantu Kala — Mobile UX standard

Version 0.1 · 12 Oct 2026 · Status: **proposed** (owner asked 12 Oct for mobile-first, bug-free UI on
every screen). One checklist used three times: `tk-design` designs to it, `tk-frontend` builds to
it, `tk-qa` tests against it. A page isn't done until it passes here.

## 1. Priority order

1. Android phones (stakeholders use varied Android models — D-32), portrait.
2. The same pages inside **Instagram, WhatsApp and Facebook in-app browsers** (most buyers arrive this way).
3. iPhone Safari.
4. Tablets and landscape phones.
5. Desktop (must work and look good; designed last).

Designs are drawn at **360 px first**, then 412 px, then larger.

## 2. Test matrix

| Widths (CSS px)         | 320 (small/older phones) · 360 · 375 · 390 · 412 · 430 · 768 (tablet) · 1280+                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Orientations            | Portrait at all phone widths; landscape at 360×740 equivalent                                                                      |
| Browsers (real devices) | Chrome and Samsung Internet on Android; Instagram and WhatsApp in-app browsers; Safari iOS                                         |
| Text size               | Android/iOS large font settings up to 200%; browser zoom 200%                                                                      |
| Network/CPU             | Slow 4G and a mid-range CPU (Lighthouse mobile throttling)                                                                         |
| Preferences             | Reduced motion; Android "auto dark" on web content (verify our light theme isn't inverted badly — set `color-scheme` deliberately) |

Automated (Playwright, CI): every key page at 320/360/412/768/1280 with screenshot comparisons
(`toHaveScreenshot`, built into Playwright) so layout regressions are caught. Manual (owner +
stakeholders, each release): the real-device rows above.

## 3. Rules every screen must pass

**Layout**

- No horizontal scrolling at 320 px; long words, prices (₹1,24,999), product names and URLs wrap.
- Use `dvh`/`svh` units (not `100vh`, which jumps when mobile browser bars show/hide).
- Respect safe areas (`env(safe-area-inset-*)`) for notches and gesture bars.
- Images reserve their space (width/height or aspect-ratio) — no layout jump while loading.

**Touch**

- Tap targets ≥ 44×44 px with ≥ 8 px spacing; primary actions in the lower, thumb-reachable area.
- Nothing depends on hover; every hover effect has a tap/focus equivalent.
- No double-tap zoom traps; no tiny close buttons; swipe gestures always have a button alternative.

**Forms and keyboard**

- Correct `type`, `inputmode`, `autocomplete` and `enterkeyhint` (phone → `tel`, pincode → numeric,
  name/address autocomplete) so the right keyboard opens and autofill works.
- Inputs ≥ 16 px font (prevents iOS zoom-on-focus).
- When the keyboard opens, the focused field and its error stay visible; **no sticky bar may cover
  an input or the submit button** (lesson from the v1 checkout investigation).
- Errors appear next to the field and in a summary at the top; focus moves to the first error.

**Feedback and state**

- Every action shows a result within 100 ms (pressed state, spinner, or message).
- Buttons that submit are disabled while busy; double taps never create duplicates.
- Back button behaves as expected; refresh never loses a placed order or resubmits it.
- Offline or slow: clear message plus the WhatsApp fallback (LLD-05).

**In-app browsers**

- Don't rely on: clipboard API, `window.open` popups, file downloads, Web Share API, third-party
  cookies. Always provide a fallback (selectable text, normal links).
- UPI deep links can be blocked in some in-app browsers: always offer copy-UPI-ID, copy-amount and
  QR alternatives (v1 already learned this — `feat/upi-mobile-fallback`).

**Readability and accessibility**

- Body text ≥ 16 px; line length ~ 45–75 characters; contrast WCAG 2.2 AA.
- Works at 200% text size without overlapping or cut-off text.
- Reduced-motion users get no animation; nothing flashes.

## 4. Who does what

| Role                 | Responsibility                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| `tk-design`          | Every new design starts at 360 px; mockups show mobile frames first; audits pass/fail against §3 |
| `tk-frontend`        | Builds mobile-first CSS; checks §3 at 320/360/412 before opening a PR; attaches screenshots      |
| `tk-qa`              | Runs the automated matrix and screenshot comparisons; files failures against §3 rule names       |
| Owner + stakeholders | Real-device pass per release on their own Android phones and in Instagram/WhatsApp               |
