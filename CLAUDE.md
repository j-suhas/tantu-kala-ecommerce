# Tantu Kala — project constitution (read before changing anything)

This is a **static, mobile-first crochet catalog** with on-site order booking and
**Direct UPI** payment. It supplements Instagram/WhatsApp sales; it is not a full store.

## Hard rules
1. **Stay in MVP scope.** Anything not listed in `MVP-SCOPE.md` §1 "In scope" goes to the
   v2 parking lot — do **not** build it into v1.
2. **Keep every recurring cost ₹0.** No paid services, no paid APIs, no gateway fees in v1.
   The only sanctioned future cost is a domain and (later) a Razorpay per-txn fee — both
   are explicit decisions, not defaults.
3. **No backend server.** Client-side only + at most one free serverless function / Apps
   Script. Never introduce a database or a host that must be patched (no EC2/VMs).
4. **Mobile-first, fast.** Zero-JS by default (Astro). Any JS ships as a small island.
   Don't add heavy client libraries.
5. **Phase gates.** Don't deploy or make irreversible changes without the owner's OK.

## Architecture
- **Astro + Tailwind + TypeScript**, static output (`astro build` → `dist/`).
- Products live in **`src/data/products.json`** (the only content file).
- Site-wide settings (WhatsApp #, UPI VPA, cutoff, analytics) live in **`src/config/site.mjs`**.
- Cart is `localStorage` (`src/lib/cart.ts`); checkout + UPI logic in `src/pages/cart.astro`.
- Order recording = Google Apps Script (`apps-script/Code.gs`) → Sheet + email.
- Images: `public/images/products/`, optimized by `npm run optimize`.

## The "add a product" contract (must stay this simple)
Adding a product = **one JSON entry + one image file**. Nothing else. If a change would
break that contract, reconsider it.

## Order/payment flow (don't alter without owner sign-off)
browse → add to cart → checkout form → order recorded (sheet+email) → UPI pay
(button on mobile / QR on desktop) → owner verifies payment vs order ref → ships.
Payment is **manual reconciliation** in v1; Razorpay automation is a v1.x fast-follow.
