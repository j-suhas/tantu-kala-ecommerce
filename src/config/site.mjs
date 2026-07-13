/**
 * Tantu Kala — single source of truth for site-wide config.
 * NON-DEVELOPERS: this is the only file you edit to change contact details,
 * the WhatsApp number, the UPI ID, and the order cutoff. See README.
 */
export const SITE = {
  name: 'Tantu Kala',
  tagline: 'Handmade crochet, knotted with love',
  // Canonical site URL — used for OG images, sitemap, JSON-LD.
  // At deploy time set this to your live URL (e.g. https://tantukala.pages.dev).
  url: 'https://tantukala.pages.dev',
  description:
    'Tantu Kala makes handmade crochet rakhis and gifts — each piece knotted by hand. Book on our site and pay securely via UPI.',
  currency: 'INR',
  currencySymbol: '₹',

  // ---- CONTACT / SOCIAL (placeholders — replace before launch) ----
  // WhatsApp number in international format, digits only, no + or spaces.
  whatsapp: '910000000000',
  instagram: 'https://instagram.com/tantukala',
  facebook: 'https://facebook.com/tantukala',
  email: 'hello@tantukala.example',

  // ---- PAYMENT (Direct UPI) ----
  upi: {
    // Your UPI VPA, e.g. 'tantukala@okhdfcbank' (placeholder below).
    vpa: 'yourname@okhdfcbank',
    // Payee name shown in the customer's UPI app.
    payeeName: 'Tantu Kala',
  },

  // ---- SHIPPING ----
  // flat: rupees added to every order (0 = you confirm shipping separately).
  // freeAbove: subtotal at/above which shipping is free (0 = never auto-free).
  shipping: { flat: 0, freeAbove: 0 },

  // ---- ORDER RECORDING ----
  // Paste the Google Apps Script Web App URL here after deploying it
  // (see apps-script/README.md). Leave '' to disable remote recording
  // (the site still works; orders just aren't logged to the sheet).
  orderWebhookUrl: '',

  // ---- RAKSHA BANDHAN 2026 ----
  // Verify the festival date; set the order cutoff you can reliably ship by.
  rakhiDateISO: '2026-08-28',
  orderCutoffISO: '2026-08-20',

  // ---- ANALYTICS ----
  // Cloudflare Web Analytics token (added after deploy). Leave '' to disable.
  cfAnalyticsToken: '',
};

export const NAV = [
  { label: 'Rakhis', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Shipping & Returns', href: '/shipping-returns' },
  { label: 'Contact', href: '/contact' },
];
