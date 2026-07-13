# Setup: contact details & UPI payment

All of these live in **`src/config/site.mjs`**. Edit the value, rebuild, done.
Nothing here is secret — but the **UPI VPA is where money lands**, so double-check it.

| Field (`SITE.…`) | What to put | Used where |
|---|---|---|
| `whatsapp` | Your WhatsApp number, **international format, digits only** (no `+`, no spaces). e.g. `918812345678` | WhatsApp links in header/footer/contact + the optional "confirm order" button on the pay screen |
| `upi.vpa` | Your UPI ID, e.g. `tantukala@okhdfcbank` | The **Pay** button (mobile) and **QR** (desktop) — this is who gets paid |
| `upi.payeeName` | Display name shown in the customer's UPI app, e.g. `Tantu Kala` | UPI button / QR |
| `instagram` | Full URL, e.g. `https://instagram.com/tantukala` | Header, footer, Contact page |
| `facebook` | Full URL | Footer, Contact page |
| `email` | Public contact email | Footer, Contact page |
| `url` | Your live site URL after deploy, e.g. `https://tantukala.pages.dev` | Social/link previews (OG) + sitemap. **Set this before sharing links.** |

### What I need from you to wire these
Send me (or fill in yourself): **WhatsApp number**, **UPI VPA + payee name**, **Instagram/Facebook URLs**, **contact email**. Leave any you don't have yet — placeholders keep the site working.

> Tip: test the UPI VPA by paying yourself ₹1 from the built site before launch.
