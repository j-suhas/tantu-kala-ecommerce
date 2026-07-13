# Tantu Kala — website

A mobile-first, handmade-crochet catalog with on-site order booking and **UPI** payment.
Built with **Astro + Tailwind + TypeScript**. Static output, ₹0 to host.

> New here? Read `MVP-SCOPE.md` for what this is (and isn't), and `CLAUDE.md` for the rules.

---

## Run it locally

```bash
npm install
node scripts/make-placeholders.mjs   # only needed until you add real photos
npm run optimize                     # builds .webp + OG images
npm run dev                          # http://localhost:4321
```

Build for production:

```bash
npm run build      # outputs to dist/
npm run preview    # preview the built site
```

---

## The 4 things you'll actually edit

### 1. Add / change a product — `src/data/products.json`
Add one object, drop one image in `public/images/products/`. That's it.

```json
{
  "slug": "rose-rakhi",                     // URL + filename id (no spaces)
  "name": "Rose Rakhi",
  "price": 189,                              // rupees, number only
  "image": "rose-rakhi.jpg",                // file in public/images/products/
  "shortDescription": "One line for cards & previews.",
  "description": "Full paragraph for the product page.",
  "status": "available",                    // available | made_to_order | sold_out
  "stock": 20,                               // optional
  "leadTimeDays": 4,                         // optional, for made_to_order
  "tags": ["floral"]                         // optional
}
```

Then run `npm run optimize` (makes the webp + social-preview image) and rebuild.

- **Sold out?** set `"status": "sold_out"` — the card greys out and Add-to-cart disappears.
- **Made to order?** set `"status": "made_to_order"` and a `leadTimeDays`.

### 2. Replace an image
Drop a JPG/PNG named exactly like the product's `image` into
`public/images/products/`, run `npm run optimize`, rebuild. Use a roughly square photo
(≥1000px) for best results.

### 3. Change the WhatsApp number, UPI ID, contact, cutoff — `src/config/site.mjs`
- `whatsapp`: international format, digits only (e.g. `919812345678`).
- `upi.vpa` + `upi.payeeName`: your UPI ID and display name.
- `orderCutoffISO` / `rakhiDateISO`: drives the countdown banner.
- `shipping.flat` / `shipping.freeAbove`: set flat shipping, or leave `0` to confirm it yourself.
- `url`: set to your live domain before deploying (used for social previews & sitemap).

### 4. Turn on order recording (Sheet + email)
Follow `apps-script/README.md` (5 min), then paste the Web App URL into
`site.mjs → orderWebhookUrl`. Until you do, the site still works — orders just aren't logged.

---

## Deploy (free)

Any static host works. Recommended: **Cloudflare Pages** or **Netlify**.

**Cloudflare Pages:** connect the repo → Framework preset **Astro** → build `npm run build`,
output `dist`. Set your custom domain (optional) in the dashboard.
Add free **Cloudflare Web Analytics**, copy the token into `site.mjs → cfAnalyticsToken`.

After deploy, set `SITE.url` in `site.mjs` to the live URL and redeploy so social-link
previews and the sitemap use the right domain.

---

## Payment note (v1)
Direct UPI, ₹0 fees. Payment confirmation is **manual**: match the incoming UPI credit to
the order ref (`#TK-…`) in the Sheet, verify the amount, then ship. Automated confirmation
via Razorpay is a planned fast-follow (start KYC early — see `MVP-SCOPE.md`).

## Project map
```
src/config/site.mjs      ← all settings you edit
src/data/products.json   ← the catalog
src/pages/               ← index, products/[slug], cart (checkout), about, etc.
src/lib/                 ← cart, order, upi, format
apps-script/             ← Google order recorder (sheet + email)
scripts/                 ← image optimization + placeholders
```
