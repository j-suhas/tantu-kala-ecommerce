# PRODUCT: Tantu Kala (truth file)

Approved by Suhas 29 Oct 2026 (D-87) · facts from `docs/v2/DECISIONS-LOG.md` (v2 @ b3cc7c9) ·
≤ 120 lines · agents read this before whole docs; it never adds a decision.

## What it is
- Tantu Kala, "art made from threads": handmade **crochet, macramé and pipe-cleaner** pieces
  (D-13). Business of the founder (Suhas's sister); Suhas runs the store and lends the embox
  domain and merchant UPI/bank account — customers see embox as the payee (D-46, CX-10).
- Made to order. Handmade in Delhi; store run from Pune; wording on brand pages and footer:
  **"Handmade in Delhi & Pune"** (D-60). Most parcels ship from Delhi, some from Pune (D-59).
- No shop of its own; delivery only. May later supply a few third-party shops (stockists),
  never presented as our shop (D-41, IN-22).
- Site: `tantukala.embox.in` (D-42). English first (D-43).

## Who buys, and how
- Mostly Android phones, often inside Instagram or WhatsApp in-app browsers; Chrome and Samsung
  Internet; iOS Safari supported (D-32). Mobile first, 360 px first (D-63).
- Gifting around festivals (Raksha Bandhan, Navratri, Diwali, Ganesh Chaturthi) and every day.
- Catalog: Type (one or more) × Occasion (none = Everyday) (D-03); sold-out stays visible (D-50).

## Ordering and money
- Final total shown → order recorded → customer pays that exact amount by **Direct UPI** →
  owner verifies → ships. The total never changes after recording. No payment gateway (D-17).
- Full advance payment; non-refundable unless not yet made or T&C allows (D-08).
- Standard shipping **₹89** incl. packaging; free above a threshold of about ₹500–700 — exact
  value open (D-06, IN-06).
- Gift message up to 500 characters; gift wrap about ₹30, once per order (D-10, D-64 K-4).
- Discounts: automatic order-value tiers + festival codes + loyalty codes; values set later
  (D-09); discounts never stack (D-49); the offer that saves more wins (D-64 K-2).
- Custom orders: request only, no price or payment on the site; photos to Google Drive (D-04, D-05).
- Bulk / corporate: over the size or cart limit → quote with MOQ, valid 10 days (D-07).
- Not GST-registered: receipts, not GST invoices (D-11). Default courier India Post Speed Post (D-12).
- Loyalty comes last; v2 launches without it (D-51, D-18).

## Hard rules for every agent
- Tier 0 only: static Astro on Cloudflare + one Apps Script + Google Sheets/Drive; ₹0 recurring
  (D-01, D-31). Add a product = one JSON entry + image file(s).
- Never invent: prices, delivery times, reviews, ratings, stock levels, customer quotes, numbers.
- Real product photos only: no AI-generated or stock product images.
- Nothing is posted, sent or published by an agent; Suhas approves public content (D-52).

## Current goal
- Diwali 2026 goal: ₹1 lakh pure product sales, 6 Oct – 8 Nov, "not a must" (D-14).
- Release R1 (catalog + brand) in progress: first wave F-1, F-6S, F-7, DZ-1, BR-1, BR-2.

## Pending (do not fill in — ask)
- Tagline "Art made from threads" agreed on the packaging branch (PK-1); confirm once merged.
- Free-shipping threshold (IN-06), wrap fee final (IN-07), discount values (IN-09), legal seller
  details (IN-05), data retention (IN-17), stockist questions (IN-22).

## Where the full truth lives
Decisions: `docs/v2/DECISIONS-LOG.md` · Requirements: `docs/v2/product/REQUIREMENTS.md` ·
Open inputs: `docs/v2/product/OWNER-INPUTS.md` · Design: `docs/truth/DESIGN.md`.
