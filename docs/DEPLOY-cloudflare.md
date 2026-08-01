# Deploy — Cloudflare (Workers Static Assets)

This site deploys as a **Cloudflare Worker serving static assets** (Cloudflare's
recommended path for new projects; Pages also works). Static Astro → no adapter needed.

## Config already in the repo
- **`wrangler.jsonc`** — serves `./dist`, serves `/404.html` on unknown routes.
  `"name"` MUST match your Worker's name in the Cloudflare dashboard.
- **`public/_headers`** → copied to `dist/_headers` at build; Workers Static Assets honors
  it (CSP + security headers). Verify it's applied after the first deploy.
- Build command: `npm run build`  ·  Output: `dist/`

## First deploy
1. Push to the branch connected in Cloudflare (Workers & Pages → your project → Builds).
2. Build runs `npm run build` → `dist/`; deploy uploads `dist/` via wrangler.
3. If the deploy **uploads a version but the site isn't live**, the deploy command is
   `wrangler versions upload` (stages only). Fix by either:
   - promoting the version: dashboard → your Worker → Deployments → promote, or
   - setting the deploy command to **`npx wrangler deploy`** (straight to production).

## Custom domain
Workers custom domains need the domain's DNS **zone on Cloudflare**.
- Zone already on Cloudflare → Worker → Settings → Domains & Routes → **Add Custom Domain**
  → `tantukala.yourdomain.com`. DNS is created automatically; SSL is automatic.
- Zone elsewhere → move it to Cloudflare (changes nameservers), or launch on the free
  `*.workers.dev` URL and attach the domain later.

## Go-live checklist (only-you items)
- [ ] `wrangler.jsonc` `name` matches the Worker.
- [ ] `SITE.url` in `src/config/site.mjs` = the live URL (workers.dev or your domain).
      Drives canonical URLs, OG images, sitemap, robots.txt. **Rebuild after changing.**
- [ ] Real **WhatsApp #**, **UPI VPA + payee name**, Instagram/Facebook/email in `site.mjs`.
- [ ] Apps Script deployed to **production**; paste its `/exec` URL into `orderWebhookUrl`,
      and the live site URL into `SITE_URL` (Code.gs) for tamper verification.
- [ ] Real product photos added + `npm run optimize` run.
- [ ] Custom domain attached (or launch on workers.dev).

## Post-deploy verification
- [ ] `Content-Security-Policy` + security headers present on the live document response.
- [ ] Full order flow on a **real phone** (tap-to-pay opens a UPI app with correct amount +
      payee "Tantu Kala"); desktop QR scans correctly.
- [ ] One real ₹1 payment end-to-end → confirm it lands and reconciles.
- [ ] Paste a product URL + the home URL into **WhatsApp** and Instagram → OG card renders.
- [ ] `/robots.txt` and `/sitemap-index.xml` load with the correct (live) domain.
- [ ] Lighthouse (mobile) ≥ 90 with real photos in.

## Adding server logic later (e.g. Razorpay)
Because this is a Worker (not Pages), you can add a `main` entry script to `wrangler.jsonc`
and handle API routes in the same project — no separate service. Keep any secret keys in
Worker **environment variables / secrets**, never in the client bundle.
