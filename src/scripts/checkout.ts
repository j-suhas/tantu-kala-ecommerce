/**
 * Cart + checkout controller for /cart. Extracted to a typed module so it is
 * unambiguously compiled as TypeScript (rather than an inline <script>).
 */
import {
  getCart,
  setQty,
  removeItem,
  subtotal as calcSubtotal,
  itemCount,
  clearCart,
  CART_EVENT,
} from "../lib/cart";
import {
  makeOrderRef,
  orderText,
  recordOrder,
  claimPaid,
  type OrderPayload,
} from "../lib/order";
import { autoCoupon } from "../lib/coupon";
import { upiLink, isMobile } from "../lib/upi";
import { products } from "../data/products";
import { SITE } from "../config/site.mjs";

const sym = SITE.currencySymbol;
const money = (n: number) => sym + n.toLocaleString("en-IN");
const $ = (id: string) => document.getElementById(id)!;
const LAST_ORDER_KEY = "tk_last_order_v1";

// Pay-screen state used by the "I've completed the payment" confirmation step.
let currentRef = ""; // the order ref currently shown on the pay screen
let placedSummary = ""; // one-line summary shown on the "order placed" screen
let claimed = false; // guards the claim POST against double taps

// Validation patterns — mirrored server-side in apps-script/Code.gs (validateOrder).
// Keep the two in sync. Name = any letter (Unicode, so Indian names in any script)
// plus space/dot/apostrophe/hyphen (D'Souza, Rai-Kumar); blocks digits/@/<> junk.
const NAME_RE = /^[\p{L}][\p{L}\s.'-]{1,49}$/u;
const PHONE_RE = /^[6-9]\d{9}$/;
const PINCODE_RE = /^[1-9]\d{5}$/;

const emptyEl = $("empty");
const cartSection = $("cart-section");
const paySection = $("pay-section");
const itemsEl = $("cart-items");

const stockOf: Record<string, number> = {};
for (const p of products)
  if (p.status === "available" && typeof p.stock === "number")
    stockOf[p.slug] = p.stock;

const imageOf: Record<string, string> = {};
for (const p of products) imageOf[p.slug] = p.image;

let paid = false;

function shippingFor(sub: number): number {
  const { flat, freeAbove } = SITE.shipping;
  if (freeAbove && sub >= freeAbove) return 0;
  return flat || 0;
}

interface Totals {
  sub: number;
  coupon: ReturnType<typeof autoCoupon>;
  ship: number;
  payable: number;
}
function computeTotals(): Totals {
  const sub = calcSubtotal(getCart());
  const coupon = autoCoupon(sub);
  const ship = shippingFor(sub);
  const payable = sub - (coupon ? coupon.discount : 0) + ship;
  return { sub, coupon, ship, payable };
}

/** Build one cart row with the DOM API (no innerHTML). */
function cartRow(it: {
  slug: string;
  name: string;
  price: number;
  qty: number;
}): HTMLLIElement {
  const cap = stockOf[it.slug];
  const li = document.createElement("li");
  li.className = "card p-3 flex items-center gap-3";

  const info = document.createElement("div");
  info.className = "flex-1";
  const nameP = document.createElement("p");
  nameP.className = "font-medium";
  nameP.textContent = it.name;
  const priceP = document.createElement("p");
  priceP.className = "text-sm text-ink/60";
  priceP.textContent = `${money(it.price)} each`;
  info.append(nameP, priceP);

  const qty = document.createElement("input");
  qty.type = "number";
  qty.min = "1";
  if (cap) qty.max = String(cap);
  qty.value = String(it.qty);
  qty.dataset.slug = it.slug;
  qty.className =
    "qty w-16 rounded-lg border border-ink/20 px-2 py-1.5 text-center";

  const remove = document.createElement("button");
  remove.dataset.slug = it.slug;
  remove.className = "remove text-henna text-sm";
  remove.textContent = "Remove";

  const thumb = document.createElement("img");
  thumb.src = `/images/products/${imageOf[it.slug] || it.slug + ".jpg"}`;
  thumb.alt = it.name;
  thumb.width = 48;
  thumb.height = 48;
  thumb.loading = "lazy";
  thumb.className = "w-12 h-12 rounded-lg object-cover bg-sand shrink-0";

  li.append(thumb, info, qty, remove);
  return li;
}

function renderShipping(sub: number, ship: number) {
  const el = $("shipping");
  el.replaceChildren();
  const strike = SITE.shipping.strikethroughFrom;
  if (ship === 0) {
    $("free-ship-badge").classList.remove("hidden");
    const overNote =
      SITE.shipping.freeAbove && sub >= SITE.shipping.freeAbove
        ? ` over ${money(SITE.shipping.freeAbove)}`
        : "";
    if (strike) {
      const was = document.createElement("span");
      was.className = "line-through text-ink/40 mr-1";
      was.textContent = money(strike);
      el.appendChild(was);
    }
    const free = document.createElement("span");
    free.className = "text-leaf font-semibold";
    free.textContent = `FREE${overNote}`;
    el.appendChild(free);
  } else {
    $("free-ship-badge").classList.add("hidden");
    el.textContent = money(ship);
  }
}

function renderCart() {
  if (paid) return;
  const items = getCart();
  if (items.length === 0) {
    emptyEl.classList.remove("hidden");
    cartSection.classList.add("hidden");
    return;
  }
  emptyEl.classList.add("hidden");
  cartSection.classList.remove("hidden");

  itemsEl.replaceChildren(...items.map(cartRow));

  const { sub, coupon, ship } = computeTotals();
  $("subtotal").textContent = money(sub);

  if (coupon) {
    $("coupon-row").classList.remove("hidden");
    $("coupon-label").textContent = coupon.label;
    $("coupon-amount").textContent = "-" + money(coupon.discount);
  } else {
    $("coupon-row").classList.add("hidden");
  }

  renderShipping(sub, ship);
  const totalStr = money(sub - (coupon ? coupon.discount : 0) + ship);
  $("total").textContent = totalStr;
  const stickyTotal = document.getElementById("sticky-total");
  if (stickyTotal) stickyTotal.textContent = totalStr;

  // "Add ₹X more to unlock the coupon" nudge (only when below the lowest tier).
  const tiers = SITE.coupons?.autoOrderValue ?? [];
  const tier = tiers.length ? [...tiers].sort((a, b) => a.minSubtotal - b.minSubtotal)[0] : null;
  const nudge = $("coupon-nudge");
  if (tier && !coupon && sub < tier.minSubtotal) {
    nudge.textContent = `Add ${money(tier.minSubtotal - sub)} more to unlock Extra ${tier.percentOff}% off 🎁`;
    nudge.classList.remove("hidden");
  } else {
    nudge.classList.add("hidden");
  }
}

itemsEl.addEventListener("input", (e) => {
  const el = e.target as HTMLInputElement;
  if (!el.classList.contains("qty")) return;
  const cap = Number(el.max) || Infinity;
  const q = Math.min(cap, Math.max(1, Number(el.value) || 1));
  el.value = String(q);
  setQty(el.dataset.slug!, q);
});
itemsEl.addEventListener("click", (e) => {
  const el = (e.target as HTMLElement).closest(".remove") as HTMLElement | null;
  if (el) removeItem(el.dataset.slug!);
});
window.addEventListener(CART_EVENT, renderCart);

// ---- Validation ----
function fieldEl(field: string): HTMLInputElement | null {
  const sel = field === "pincode" ? "#pincode" : field === "city" ? "#city" : `[name=${field}]`;
  return document.querySelector(sel);
}
function fieldVal(field: string): string {
  return (fieldEl(field)?.value ?? "").trim();
}
function showErr(field: string, msg: string) {
  const el = document.getElementById("err-" + field);
  if (el) {
    el.textContent = msg;
    el.classList.remove("hidden");
  }
}
function clearErr(field: string) {
  document.getElementById("err-" + field)?.classList.add("hidden");
}
function normPhone(raw: string): string {
  let d = (raw || "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d;
}

/** Validate one field, showing/clearing its inline error. Returns true if valid. */
function validateField(field: string): boolean {
  const v = fieldVal(field);
  let msg = "";
  if (field === "name") { if (!NAME_RE.test(v)) msg = "Enter your name (2–50 letters)."; }
  else if (field === "phone") { if (!PHONE_RE.test(normPhone(v))) msg = "Enter a valid 10-digit Indian mobile number."; }
  else if (field === "address") { if (v.length < 10) msg = "Please enter your full delivery address."; }
  else if (field === "pincode") { if (!PINCODE_RE.test(v)) msg = "Enter a valid 6-digit pincode."; }
  else if (field === "city") { if (v.length < 2) msg = "Enter your city / district."; }
  if (msg) { showErr(field, msg); return false; }
  clearErr(field);
  return true;
}

const FIELDS = ["name", "phone", "address", "pincode", "city"];
// Validate each field the moment the user leaves it.
FIELDS.forEach((f) => fieldEl(f)?.addEventListener("blur", () => validateField(f)));

$("checkout-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  // honeypot — a filled hidden "company" means a bot; stop silently.
  if ((document.querySelector("[name=company]") as HTMLInputElement | null)?.value.trim()) return;

  const ok = FIELDS.map(validateField).every(Boolean);
  if (!ok) return;

  const name = fieldVal("name");
  const phone = normPhone(fieldVal("phone"));
  const address = fieldVal("address");
  const pincode = fieldVal("pincode");
  const city = fieldVal("city");
  const state = (document.getElementById("state") as HTMLInputElement | null)?.value.trim() ?? "";
  const note = (document.querySelector("[name=note]") as HTMLInputElement | null)?.value.trim() ?? "";

  const items = getCart();
  if (items.length === 0) return;
  const { sub, coupon, ship, payable } = computeTotals();
  const ref = makeOrderRef();

  const payload: OrderPayload = {
    ref,
    createdAt: new Date().toISOString(),
    items,
    itemCount: itemCount(items),
    subtotal: sub,
    coupon: coupon
      ? {
          percentOff: coupon.percentOff,
          label: coupon.label,
          discount: coupon.discount,
        }
      : null,
    shipping: ship,
    payable,
    customer: {
      name,
      phone: "+91" + phone,
      address,
      pincode,
      city,
      state,
      note,
    },
  };

  const btn = $("submit-btn") as HTMLButtonElement;
  btn.disabled = true;
  btn.textContent = "Placing order…";
  // Record in the background (best-effort) and show the pay screen IMMEDIATELY —
  // never make the customer wait on a slow/cold Apps Script webhook.
  void recordOrder(payload);
  completeOrder(payload, payable);
});

// ---- Payment screen ----
// Persist only the minimum needed to re-open the pay screen — NO customer PII.
interface StoredOrder {
  ref: string;
  payable: number;
  ts: number;
}
function saveLastOrder(ref: string, payable: number) {
  try {
    localStorage.setItem(
      LAST_ORDER_KEY,
      JSON.stringify({ ref, payable, ts: Date.now() } as StoredOrder),
    );
  } catch {}
}
function loadLastOrder(): StoredOrder | null {
  try {
    const raw = localStorage.getItem(LAST_ORDER_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as StoredOrder;
    if (!v.ref || Date.now() - (v.ts || 0) > 24 * 3600_000) return null;
    return v;
  } catch {
    return null;
  }
}

function renderPayScreen(ref: string, total: number, waText: string) {
  paid = true;
  currentRef = ref;
  claimed = false;
  cartSection.classList.add("hidden");
  emptyEl.classList.add("hidden");
  paySection.classList.remove("hidden");
  // Ensure we start on the "pay now" view, not a stale "placed" view.
  document.getElementById("pay-active")?.classList.remove("hidden");
  document.getElementById("placed")?.classList.add("hidden");
  document.getElementById("sticky-pay")?.classList.add("translate-y-full");

  $("pay-amount").textContent = money(total);
  $("pay-amount-2").textContent = money(total);
  $("pay-ref").textContent = "#" + ref;
  document
    .querySelectorAll(".pay-ref-inline")
    .forEach((el) => (el.textContent = "#" + ref));

  const uri = upiLink(total, ref);
  if (isMobile()) {
    const b = $("upi-btn") as HTMLAnchorElement;
    b.href = uri;
    b.classList.remove("hidden");
  } else {
    $("upi-qr-wrap").classList.remove("hidden");
    // Load the ~30 kB QR library only when a QR is actually shown (desktop pay
    // screen) — keeps the cart page's initial JS small.
    void import("qrcode")
      .then(({ default: QRCode }) =>
        QRCode.toCanvas($("upi-qr"), uri, { width: 220, margin: 1 }, () => {}),
      )
      .catch(() => {
        // If the QR lib fails to load, fall back to the UPI ID shown just below —
        // the pay flow stays usable, no blank box.
        const wrap = $("upi-qr-wrap");
        wrap.textContent =
          "Couldn't load the QR — please pay to the UPI ID shown below.";
        wrap.classList.add("text-sm", "text-ink/70");
      });
  }

  const wa = $("wa-confirm") as HTMLAnchorElement;
  wa.href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(waText)}`;
}

/** Fresh order: full WhatsApp message, then persist (ref+amount only) and clear cart. */
function completeOrder(o: OrderPayload, total: number) {
  window.scrollTo({ top: 0, behavior: "smooth" });
  placedSummary = `Order #${o.ref} · ${o.itemCount} item${o.itemCount > 1 ? "s" : ""} · ${money(total)}`;
  renderPayScreen(
    o.ref,
    total,
    orderText(o) + `\nI'm paying / have paid via UPI.`,
  );
  saveLastOrder(o.ref, total);
  clearCart();
}

/** Restored order (page refresh): only ref + amount survive, so use a generic message. */
function restoreOrder(s: StoredOrder) {
  placedSummary = `Order #${s.ref} · ${money(s.payable)}`;
  renderPayScreen(
    s.ref,
    s.payable,
    `Hi, I'd like to confirm my Tantu Kala order #${s.ref} (${money(s.payable)}). I'm paying via UPI.`,
  );
}

$("copy-vpa").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(SITE.upi.vpa);
    $("copied").classList.remove("hidden");
    setTimeout(() => $("copied").classList.add("hidden"), 1500);
  } catch {}
});

function goNewOrder() {
  try {
    localStorage.removeItem(LAST_ORDER_KEY);
  } catch {}
  window.location.href = "/";
}
$("new-order").addEventListener("click", goNewOrder);
document.getElementById("new-order-2")?.addEventListener("click", goNewOrder);

// "I've completed the payment" → tell the sheet, show the thank-you screen.
// Payment is still verified manually by the owner before dispatch; this only
// flips the sheet row to CLAIMED PAID so they know to look.
document.getElementById("ive-paid")?.addEventListener("click", () => {
  if (claimed) return;
  claimed = true;
  void claimPaid(currentRef);

  const summaryEl = document.getElementById("placed-summary");
  if (summaryEl) summaryEl.textContent = placedSummary;
  const waPlaced = document.getElementById("wa-placed") as HTMLAnchorElement | null;
  const waConfirm = document.getElementById("wa-confirm") as HTMLAnchorElement | null;
  if (waPlaced && waConfirm) waPlaced.href = waConfirm.href;

  document.getElementById("pay-active")?.classList.add("hidden");
  document.getElementById("placed")?.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
  celebrate();
});

// Word-of-mouth: share the shop. Web Share API where available, WhatsApp fallback.
document.getElementById("share-tk")?.addEventListener("click", async () => {
  const shareData = {
    title: SITE.name,
    text: "Handmade crochet rakhis & gifts from Tantu Kala 🧶",
    url: SITE.url,
  };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
  } catch {
    return; // user cancelled the share sheet — do nothing
  }
  window.open(
    `https://wa.me/?text=${encodeURIComponent(`${shareData.text} ${shareData.url}`)}`,
    "_blank",
    "noopener",
  );
});

/** A short, festive confetti burst using the Web Animations API (CSP-safe: no
 *  inline <script>). Skipped entirely when the user prefers reduced motion. */
function celebrate() {
  if (!matchMedia("(prefers-reduced-motion: no-preference)").matches) return;
  const colors = ["#E8873A", "#7A1F2B", "#B84A2E", "#5E7A4F", "#C9A227"];
  for (let i = 0; i < 70; i++) {
    const bit = document.createElement("div");
    const size = 6 + Math.random() * 6;
    bit.style.cssText =
      `position:fixed;top:-12px;left:${Math.random() * 100}vw;` +
      `width:${size}px;height:${size * 0.6}px;background:${colors[i % colors.length]};` +
      `z-index:60;pointer-events:none;border-radius:2px;`;
    document.body.appendChild(bit);
    const dur = 1900 + Math.random() * 1500;
    bit
      .animate(
        [
          { transform: "translateY(0) rotate(0deg)", opacity: 1 },
          {
            transform: `translateY(${window.innerHeight + 40}px) rotate(${540 + Math.random() * 360}deg)`,
            opacity: 1,
          },
        ],
        { duration: dur, easing: "cubic-bezier(.25,.6,.5,1)" },
      )
      .finished.finally(() => bit.remove());
  }
}

// ---- Pincode -> city/state (progressive enhancement; never blocks checkout) ----
const pinInput = document.getElementById("pincode") as HTMLInputElement | null;
const cityInput = document.getElementById("city") as HTMLInputElement | null;
const stateInput = document.getElementById("state") as HTMLInputElement | null;
const pinHint = document.getElementById("pin-hint");

let pinDebounce: ReturnType<typeof setTimeout> | undefined;
let pinCtrl: AbortController | null = null;
let pinSeq = 0; // guards against out-of-order responses
let lastGoodPin = ""; // only cache SUCCESSFUL lookups, so failures can retry
let cityAuto = false; // did WE fill city (vs the user)?
let stateAuto = false;

/** Lock City/State until a pincode lookup has settled (per requirement). Once a
    lookup completes — success OR failure — they unlock and stay editable. */
function setLocLocked(locked: boolean) {
  [cityInput, stateInput].forEach((el) => {
    if (!el) return;
    el.disabled = locked;
    el.classList.toggle("bg-ink/5", locked);
    el.classList.toggle("cursor-not-allowed", locked);
  });
}
setLocLocked(true);

function setHint(text: string, tone: "info" | "ok" | "warn") {
  if (!pinHint) return;
  pinHint.textContent = text;
  pinHint.classList.remove("hidden", "text-leaf", "text-ink/50", "text-henna");
  pinHint.classList.add(
    tone === "ok"
      ? "text-leaf"
      : tone === "warn"
        ? "text-henna"
        : "text-ink/50",
  );
}

// If the user edits city/state themselves, stop auto-overwriting it.
cityInput?.addEventListener("input", (e) => {
  if (e.isTrusted) cityAuto = false;
});
stateInput?.addEventListener("input", (e) => {
  if (e.isTrusted) stateAuto = false;
});

function pinDigits(): string {
  return (pinInput?.value || "").replace(/\D/g, "").slice(0, 6);
}

pinInput?.addEventListener("input", () => {
  clearTimeout(pinDebounce);
  if (pinDigits().length !== 6) {
    pinHint?.classList.add("hidden");
    return;
  }
  pinDebounce = setTimeout(runPinLookup, 350); // wait for typing to settle
});
pinInput?.addEventListener("blur", () => runPinLookup());

async function runPinLookup() {
  const pin = pinDigits();
  if (pin.length !== 6 || pin === lastGoodPin) return;

  pinCtrl?.abort(); // cancel any in-flight request
  const ctrl = new AbortController();
  pinCtrl = ctrl;
  const seq = ++pinSeq;
  setHint("Looking up pincode…", "info");

  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (seq !== pinSeq) return; // a newer lookup superseded this one
    const data = await res.json();
    const rec = Array.isArray(data) ? data[0] : null;
    const po =
      rec && rec.Status === "Success" && rec.PostOffice && rec.PostOffice[0];
    if (!po) {
      setHint(
        "Couldn't find that pincode — please type your city & state.",
        "warn",
      );
      setLocLocked(false);
      return;
    }

    lastGoodPin = pin;
    if (cityInput && (cityAuto || !cityInput.value.trim())) {
      cityInput.value = po.District || "";
      cityAuto = true;
    }
    if (stateInput && (stateAuto || !stateInput.value.trim())) {
      stateInput.value = po.State || "";
      stateAuto = true;
    }
    setHint(`📍 ${po.District}, ${po.State}`, "ok");
    setLocLocked(false);
  } catch {
    clearTimeout(timer);
    if (seq !== pinSeq) return; // superseded/aborted by a newer lookup
    setHint(
      "Couldn't reach the lookup — please type your city & state.",
      "warn",
    );
    setLocLocked(false);
  }
}

// Sticky "To pay" bar — show while filling the form (summary total scrolled out of
// view), hidden on the pay screen. Mobile only.
const stickyPay = document.getElementById("sticky-pay");
const totalObserved = document.getElementById("total");
if (stickyPay && totalObserved && "IntersectionObserver" in window) {
  new IntersectionObserver(
    ([entry]) => {
      const show = !entry.isIntersecting && !paid && !cartSection.classList.contains("hidden");
      stickyPay.classList.toggle("translate-y-full", !show);
    },
    { threshold: 0 },
  ).observe(totalObserved);
}

// ---- Init ----
const last = loadLastOrder();
if (getCart().length === 0 && last) restoreOrder(last);
else renderCart();
