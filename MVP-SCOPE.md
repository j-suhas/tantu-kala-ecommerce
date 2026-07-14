# Tantu Kala — v1 (MVP) Scope  ✅ APPROVED 14 Jul 2026

**Goal:** Ship a mobile-first, content-rich crochet catalog with **on-site order booking + UPI payment**, live by **early August 2026**, to sell 500–1000 rakhis for Raksha Bandhan (**~28 Aug 2026** — verify exact date; drives the order cutoff banner).
**Positioning:** a real, on-platform store — customers browse, book, and pay **on the site**. WhatsApp is optional support, not the order mechanism. No off-platform bounce that reads as "just another IG shop."

**Approved decisions:** Direct UPI (button + QR) · on-site order capture → Google Sheet + email notification · Astro + Tailwind + TS · one free serverless function · hosting/domain decided later.

---

## 1. What v1 includes / excludes

### In scope
- Mobile-first, content-heavy catalog: product grid + product detail (photos, name, price, short description, stock state).
- Client-side cart (localStorage, no accounts).
- **On-site checkout** — customer fills name/phone/address/pincode; order is **recorded and the team notified**, no dependency on WhatsApp.
  - **Order recording (₹0):** Google Apps Script Web App → appends to a **Google Sheet** (live ledger) **and emails the team** on every order.
- **UPI payment on-site (Direct UPI, ₹0):** `upi://pay?pa=<VPA>&am=<amt>&tn=<orderRef>` as a **tap-to-pay button on mobile** and a **scannable QR on desktop**. Manual reconciliation against the order ref before shipping.
- On-site order confirmation screen with the `#TK-…` ref + clear "how it works" (book → pay via UPI → we verify & ship).
- About / brand-story page (first-class).
- Shipping / Returns / Refund + Contact pages (required for trust *and* future Razorpay KYC / Meta ads).
- SEO + Open Graph per page/product (IG/WA link previews).
- Build-time image optimization (responsive AVIF/WebP + JPG OG images).
- Free cookieless analytics; conversion events on **checkout submit** and **UPI-pay tap**.
- Products in a single JSON file; add product = add JSON entry + drop image.
- Repo **`CLAUDE.md`/`AGENTS.md` constitution** encoding scope guardrails, the ₹0 rule, phase gates, and the "add-a-product" contract.

### Explicitly excluded (→ v2 parking lot)
- Automated payment gateway (Razorpay/Cashfree) — **fast-follow**, not v1 (see §2).
- Admin panel / CMS · accounts / login / order history.
- Server-side DB (Sheet is the ledger in v1).
- Inventory automation, coupons, search/filter, reviews, wishlist, multi-language, blog.
- Meta Pixel / ad conversion tracking (add when paid ads start).

---

## 2. Order + payment flow (approved)

**Flow:** browse → add to cart → checkout form → order recorded (Sheet + email) → on-site UPI pay (button/QR) → customer pays to VPA → **we verify the received amount against `#TK-…` ref → confirm & ship.**

### Why this design
- **On-platform, desktop-safe:** order is captured and recorded on the site regardless of whether WhatsApp is installed/logged in anywhere. Kills both the desktop dead-end and the "sketchy IG shop" feel.
- **₹0:** Direct bank UPI (P2M) carries a government-mandated **0% MDR**; recording via Apps Script + Gmail is free. No gateway, no setup/AMC.
- **You always have the order** (Sheet row + email) even if payment is abandoned.

### Direct UPI details
- Mobile: `upi://pay?...` intent button opens GPay/PhonePe/Paytm with amount + note prefilled.
- Desktop: render the same as a **QR** (upi: links don't open without an app).
- **Accepted caveats:** no automated payment confirmation → **manual reconciliation**; a few apps let the payer edit the prefilled amount → **verify amount received, not just "paid"**; no chargeback protection (low risk for made-to-order handmade).

### Order message / record format (built for your ops at 50+/day)
Order ref `#TK-<ddMM>-<4hex>`; the Sheet row and notification email carry: ref, timestamp, line items (qty × name @ unit price), item count, subtotal, customer name/phone/full address/pincode, and UPI-amount-expected. Fixed labels so it's greppable and later scriptable.

### Payment upgrade path (fast-follow, not blocking launch)
Start **Razorpay KYC in parallel now** (KYC is the long pole — days). When it clears, swap the Pay step to the gateway for **automated success/failure confirmation** (fee ~2% + GST; ₹149 rakhi ≈ ₹3.5). Same serverless function that records orders will create gateway orders. Ships as v1.x once approved — never gates go-live.

---

## 3. Essentials being built in (unchanged from brainstorm)
SEO (titles/meta, semantic HTML, `sitemap.xml`, `robots.txt`, **Product JSON-LD** with price + `availability` tied to stock). **Open Graph** per page/product — OG images as **JPG/PNG ~1200×630 <300KB** (WhatsApp won't render AVIF/WebP and caches hard). **Image pipeline**: drop hi-res JPG → build emits responsive AVIF/WebP + srcset + blur placeholder + a JPG OG image. **Analytics**: Cloudflare Web Analytics (cookieless, no consent banner). **About/brand story** as a feature; persistent WhatsApp/IG/FB contact. **Stock**: `status: available | made_to_order | sold_out` (+ optional `stock`), badge + disabled add-to-cart + JSON-LD availability. **Rakhi cutoff** banner. **Policy pages** (Shipping/Returns/Refund/Privacy) — light, not legal advice; GST/registration is your call with a CA.

---

## 4. Tech stack & hosting
**Stack (I own it):** Astro (SSG) + Tailwind + TypeScript. Zero-JS by default, best-in-class build-time images, cart as one client island on localStorage. **One free serverless function** (Cloudflare Pages Functions / Netlify Functions) for order capture + payment — still "static site + one tiny function," never a server to patch. **EC2 remains off the table.**
**Hosting/domain:** decided at the pre-deploy checkpoint. Launch works ₹0 on a platform subdomain; a `.com/.in` (~₹700–1k/yr) is the only optional recurring cost.

---

## 5. Build plan & what I need from you

| Milestone | Deliverable | Needs from you |
|---|---|---|
| **M0 — Scope** ✅ | Approved this doc | Done |
| **M1 — Scaffold** | Astro+Tailwind+TS project, `products.json` schema, `CLAUDE.md` constitution, README stub | WhatsApp #, VPA/UPI ID, brand colours/logo *(placeholders until then)* |
| **M2 — Catalog + cart** | Grid, product page, cart, stock states — placeholder data | — |
| **M3 — Checkout + UPI + recording** | Checkout form, UPI button/QR, Apps Script → Sheet + email, confirmation screen | Google account for Sheet/Apps Script deploy *(I supply code + steps)* |
| **M4 — Trust + content** | About/brand story, Shipping/Returns/Refund/Contact, "how ordering works" | Brand story copy *(I draft, you edit)*, ship lead time, return wording |
| **M5 — SEO/OG/analytics/images** | Meta+OG, JSON-LD, sitemap, analytics, image pipeline | — |
| **M6 — Self-review** ⛔ | Full journey tested mobile+desktop (cart→checkout→record→UPI) | Review before deploy |
| **M7 — Deploy & verify** | Live on free host, previews + 4G speed verified, launch checklist | Hosting/domain decision, real WhatsApp Business #, real products/photos, live VPA |
| **Parallel** | — | **Start Razorpay KYC now** (long pole for the payment upgrade) |

**Blockers you own (site builds on placeholders; these gate *real* launch):** WhatsApp Business #, UPI VPA, Google account for Sheet+Apps Script, real photos/prices, brand story copy, ship lead time + return policy, hosting/domain decision, Razorpay KYC.

---

## v2 parking lot
Automated payment gateway (Razorpay/Cashfree) · admin/CMS · accounts & order history · server DB · Meta Pixel + ad tracking · search/filter/sort · coupons · reviews · wishlist · inventory automation · multi-language · blog.

---

### Execution model
I orchestrate the whole build and spin up subagents internally when useful (e.g. a review/verification subagent at the M6 gate). You interact only at the ⛔ checkpoints. Next stop: **M6 demo/walkthrough before we deploy.**
