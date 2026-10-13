# Tantu Kala v2 — Security baseline and threat model

Version 0.1 · 9 Oct 2026 · Status: **proposed**

A small static shop still holds valuable things: customer names, phones and addresses, the
payee UPI ID, and the owner's accounts. This doc lists what we protect, from whom, and how.

## 1. Facts checked (9 Oct 2026)

- The GitHub repo is **public** (its API answered without login). Code is readable by anyone —
  fine as long as no secrets or customer data are ever committed.
- `.env.production` is committed and holds only `PUBLIC_ORDER_WEBHOOK_URL` and
  `PUBLIC_SITE_URL` — both are shipped to every browser anyway, so they are public by design.
- v1 sends orders with `fetch(…, { mode: 'no-cors' })`; the page cannot read the result (see LEAD-QA C8).
- The UPI payee ID lives in `src/config/site.mjs` and is shown to customers.

## 2. What we protect

| Asset                                                       | Why it matters                                           |
| ----------------------------------------------------------- | -------------------------------------------------------- |
| Customer data (name, phone, address, gift messages, photos) | Privacy, trust, India's DPDP Act                         |
| **Payee UPI ID**                                            | If changed, customers pay someone else                   |
| Orders and payment status                                   | Business record; fake/duplicate orders waste making time |
| Owner accounts (GitHub, Google, Cloudflare, domain, UPI)    | Whoever controls these controls the business             |
| Prices, codes, settings                                     | Tampering = revenue loss                                 |

## 3. Threats and controls

| #   | Threat                                                                                                                                      | Control                                                                                                                                                                                                                                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | Fake/spam orders and requests (the Apps Script URL is public)                                                                               | Honeypot, rate limit, validation; **nothing is made or shipped before payment is verified** — manual reconciliation is itself a control                                                                                                                                                                                 |
| T2  | Price/coupon tampering in the browser                                                                                                       | Apps Script recomputes the total from `/pricing.json`; build ID check                                                                                                                                                                                                                                                   |
| T3  | **UPI ID swapped** via a code change or Sheet edit                                                                                          | CODEOWNERS on `src/config/**` and `.env.production`; release checklist: scan the live QR and confirm the payee name before announcing a release. The payee is **embox's merchant account** (CX-10), so checkout states "Payments are received by embox on behalf of Tantu Kala" and the smoke test checks the exact VPA |
| T4  | Customer data exposed through order-status or review lookups                                                                                | Lookup needs order ref **and** matching phone; minimal response (status + tracking only); rate limited; no personal data in public GET responses                                                                                                                                                                        |
| T5  | **Spreadsheet formula injection** — a customer types `=IMPORTXML(...)` in a name or note and the Sheet executes it                          | Apps Script writes all user text as plain text (prefix values starting with `= + - @` with an apostrophe)                                                                                                                                                                                                               |
| T6  | Script injection (XSS) via reviews, request text, product text                                                                              | Astro escapes output by default; never render user text as raw HTML; reviews shown only after owner approval                                                                                                                                                                                                            |
| T7  | Leaky storage sharing                                                                                                                       | Drive photo folders and the Sheet shared only with named owners — never "anyone with the link"                                                                                                                                                                                                                          |
| T8  | Account takeover                                                                                                                            | 2-factor authentication on GitHub, Google, Cloudflare, domain registrar; recovery codes in a password manager; business-owned accounts (LEAD-QA B7)                                                                                                                                                                     |
| T9  | Malicious or vulnerable npm packages                                                                                                        | Few dependencies, lockfile + `npm ci`, Dependabot PRs reviewed, new deps need an ADR                                                                                                                                                                                                                                    |
| T10 | AI agents misusing access or obeying injected instructions                                                                                  | `AGENT-GUARDRAILS.md`: no admin tokens, no real Sheet access, hooks + rulesets, content = data                                                                                                                                                                                                                          |
| T11 | Clickjacking / missing browser protections                                                                                                  | Security headers (CSP, frame-ancestors, Referrer-Policy) via Cloudflare static-asset headers — **verified 11 Oct:** `_headers` is supported natively, and v1 already ships one with CSP, HSTS, frame and referrer rules. v2 updates the CSP (self-hosted fonts → drop the Google Fonts hosts)                           |
| T12 | Data kept forever                                                                                                                           | Retention period + deletion-on-request process (LEAD-QA B11); privacy page                                                                                                                                                                                                                                              |
| T13 | Losing the Sheet                                                                                                                            | Weekly automated copy to Drive (keep 8); export script                                                                                                                                                                                                                                                                  |
| T14 | Automated agents (AI or bots) submit orders/requests at scale                                                                               | Honeypot, rate limits, Log tab review; manual payment verification before any making/shipping; config switch to WhatsApp-only ordering                                                                                                                                                                                  |
| T15 | Hidden instructions in user-submitted text (reviews, requests, gift messages) aimed at AI assistants reading our pages or at our own agents | Owner approves reviews before display; user text escaped and never rendered as HTML; agents treat file/page/Sheet content as data (AGENT-GUARDRAILS #11)                                                                                                                                                                |

## 4. Owner checklist (do once, then yearly)

- [x] 2FA on GitHub, Google, Cloudflare, domain registrar, UPI merchant app
- [x] Recovery codes stored in a password manager
- [x] Sheet + Drive folders shared only with named people
- [x] Separate **test** Sheet + Apps Script for development (D-25)
  - [ ] CODEOWNERS + rulesets active (S-1b, S-3)
- [ ] Privacy page + consent line live before v2 checkout launches

## 5. If something goes wrong

Suspicious orders → pause by switching the site's order button to WhatsApp-only (config flag) →
check the Log tab → rotate the Apps Script deployment URL if abused. Data exposure → remove the
cause, note who was affected, inform them. Every incident gets a short note in `docs/learning/`.
