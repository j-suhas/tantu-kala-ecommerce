/**
 * Tantu Kala — single source of truth for site-wide config.
 * NON-DEVELOPERS: this is the only file you edit to change contact details,
 * the WhatsApp number, the UPI ID, and the order cutoff. See README.
 */
export const SITE = {
  name: "Tantu Kala",
  tagline: "Handmade crochet, knotted with love",
  // Canonical site URL — drives OG images, canonical tags, sitemap, JSON-LD.
  // Env-driven (PUBLIC_SITE_URL): prod domain from .env.production, localhost from
  // .env.development. astro.config reads the same var (via loadEnv) for `site:`.
  // Localhost fallback keeps `astro dev` working on a fresh clone that has no
  // .env.development (prevents `new URL(SITE.url)` throwing); prod always overrides.
  url: import.meta.env.PUBLIC_SITE_URL || "http://localhost:4321",
  description:
    "Tantu Kala makes handmade crochet rakhis and gifts — each piece knotted by hand. Book on our site and pay securely via UPI.",
  currency: "INR",
  currencySymbol: "₹",

  // ---- CONTACT / SOCIAL (placeholders — replace before launch) ----
  // WhatsApp number in international format, digits only, no + or spaces.
  whatsapp: "918999282304",
  instagram: "https://www.instagram.com/tantu_kala_/",
  facebook: "https://www.facebook.com/share/1CjoDUUpzU/",
  email: "tantu.kala@gmail.com",

  // ---- PAYMENT (Direct UPI) ----
  upi: {
    // Your UPI VPA, e.g. 'tantukala@okhdfcbank' (placeholder below).
    vpa: "sushama.jaybhaye@oksbi",
    // Payee name shown in the customer's UPI app.
    payeeName: "Sushama Jaybhaye",
  },

  // ---- SHIPPING ----
  // flat: rupees added to every order (0 = free / you confirm separately).
  // freeAbove: subtotal at/above which shipping is free (0 = never auto-free).
  // strikethroughFrom: the "was" shipping price shown crossed out to signal the
  //   free-shipping perk on the cart (e.g. 79 -> "₹79  FREE"). Set 0 to hide it.
  shipping: { flat: 0, freeAbove: 0, strikethroughFrom: 79 },

  // ---- DELIVERY ESTIMATE (location-independent) ----
  // Shown as "Delivery in ~(dispatch+min)–(dispatch+max) days".
  delivery: { dispatchDays: 2, transitDaysMin: 3, transitDaysMax: 7 },

  // ---- AUTO-APPLIED COUPONS ----
  // Applied automatically on the order value (AFTER per-product discounts).
  // Stacks on top of product discounts. Highest matching tier wins.
  // Add/adjust tiers freely; leave the array empty to disable.
  coupons: {
    autoOrderValue: [
      {
        minSubtotal: 500,
        percentOff: 20,
        label: "Festive 20% off (orders over ₹500)",
      },
    ],
  },

  // ---- ORDER RECORDING ----
  // Paste the Google Apps Script Web App URL here after deploying it
  // (see apps-script/README.md). Leave '' to disable remote recording
  // (the site still works; orders just aren't logged to the sheet).
  // No hardcoded URL — both environments come from env files:
  //   .env.production  (committed)  -> prod Apps Script  (used by `npm run build`)
  //   .env.development (gitignored) -> your test Apps Script (used by `npm run dev`)
  orderWebhookUrl: import.meta.env.PUBLIC_ORDER_WEBHOOK_URL,

  // ---- RAKSHA BANDHAN 2026 ----
  // Verify the festival date; set the order cutoff you can reliably ship by.
  rakhiDateISO: "2026-08-28",
  orderCutoffISO: "2026-08-20",

  // ---- ANALYTICS ----
  // Cloudflare Web Analytics token (added after deploy). Leave '' to disable.
  cfAnalyticsToken: "",
};

export const NAV = [
  { label: "Rakhis", href: "/" },
  { label: "About", href: "/about" },
  { label: "Shipping & Returns", href: "/shipping-returns" },
  { label: "Contact", href: "/contact" },
];
