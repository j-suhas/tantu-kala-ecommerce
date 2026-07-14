/**
 * Cart + checkout controller for /cart. Extracted to a typed module so it is
 * unambiguously compiled as TypeScript (rather than an inline <script>).
 */
import {
  getCart, setQty, removeItem, subtotal as calcSubtotal,
  itemCount, clearCart, CART_EVENT,
} from '../lib/cart';
import { makeOrderRef, orderText, recordOrder, type OrderPayload } from '../lib/order';
import { autoCoupon } from '../lib/coupon';
import { upiLink, isMobile } from '../lib/upi';
import { products } from '../data/products';
import { SITE } from '../config/site.mjs';
import QRCode from 'qrcode';

const sym = SITE.currencySymbol;
const money = (n: number) => sym + n.toLocaleString('en-IN');
const $ = (id: string) => document.getElementById(id)!;
const LAST_ORDER_KEY = 'tk_last_order_v1';

// Names: any letter (Unicode, so Indian names in any script), plus space, dot,
// apostrophe and hyphen (D'Souza, Rai-Kumar). Blocks digits/@/<> and junk.
const NAME_RE = /^[\p{L}][\p{L}\s.'-]{1,49}$/u;

const emptyEl = $('empty');
const cartSection = $('cart-section');
const paySection = $('pay-section');
const itemsEl = $('cart-items');

const stockOf: Record<string, number> = {};
for (const p of products) if (p.status === 'available' && typeof p.stock === 'number') stockOf[p.slug] = p.stock;

let paid = false;

function shippingFor(sub: number): number {
  const { flat, freeAbove } = SITE.shipping;
  if (freeAbove && sub >= freeAbove) return 0;
  return flat || 0;
}

interface Totals { sub: number; coupon: ReturnType<typeof autoCoupon>; ship: number; payable: number; }
function computeTotals(): Totals {
  const sub = calcSubtotal(getCart());
  const coupon = autoCoupon(sub);
  const ship = shippingFor(sub);
  const payable = sub - (coupon ? coupon.discount : 0) + ship;
  return { sub, coupon, ship, payable };
}

/** Build one cart row with the DOM API (no innerHTML). */
function cartRow(it: { slug: string; name: string; price: number; qty: number }): HTMLLIElement {
  const cap = stockOf[it.slug];
  const li = document.createElement('li');
  li.className = 'card p-3 flex items-center gap-3';

  const info = document.createElement('div');
  info.className = 'flex-1';
  const nameP = document.createElement('p');
  nameP.className = 'font-medium';
  nameP.textContent = it.name;
  const priceP = document.createElement('p');
  priceP.className = 'text-sm text-ink/60';
  priceP.textContent = `${money(it.price)} each`;
  info.append(nameP, priceP);

  const qty = document.createElement('input');
  qty.type = 'number';
  qty.min = '1';
  if (cap) qty.max = String(cap);
  qty.value = String(it.qty);
  qty.dataset.slug = it.slug;
  qty.className = 'qty w-16 rounded-lg border border-ink/20 px-2 py-1.5 text-center';

  const remove = document.createElement('button');
  remove.dataset.slug = it.slug;
  remove.className = 'remove text-henna text-sm';
  remove.textContent = 'Remove';

  li.append(info, qty, remove);
  return li;
}

function renderShipping(sub: number, ship: number) {
  const el = $('shipping');
  el.replaceChildren();
  const strike = SITE.shipping.strikethroughFrom;
  if (ship === 0) {
    $('free-ship-badge').classList.remove('hidden');
    const overNote =
      SITE.shipping.freeAbove && sub >= SITE.shipping.freeAbove ? ` over ${money(SITE.shipping.freeAbove)}` : '';
    if (strike) {
      const was = document.createElement('span');
      was.className = 'line-through text-ink/40 mr-1';
      was.textContent = money(strike);
      el.appendChild(was);
    }
    const free = document.createElement('span');
    free.className = 'text-leaf font-semibold';
    free.textContent = `FREE${overNote}`;
    el.appendChild(free);
  } else {
    $('free-ship-badge').classList.add('hidden');
    el.textContent = money(ship);
  }
}

function renderCart() {
  if (paid) return;
  const items = getCart();
  if (items.length === 0) {
    emptyEl.classList.remove('hidden');
    cartSection.classList.add('hidden');
    return;
  }
  emptyEl.classList.add('hidden');
  cartSection.classList.remove('hidden');

  itemsEl.replaceChildren(...items.map(cartRow));

  const { sub, coupon, ship } = computeTotals();
  $('subtotal').textContent = money(sub);

  if (coupon) {
    $('coupon-row').classList.remove('hidden');
    $('coupon-label').textContent = coupon.label;
    $('coupon-amount').textContent = '-' + money(coupon.discount);
  } else {
    $('coupon-row').classList.add('hidden');
  }

  renderShipping(sub, ship);
  $('total').textContent = money(sub - (coupon ? coupon.discount : 0) + ship);
}

itemsEl.addEventListener('input', (e) => {
  const el = e.target as HTMLInputElement;
  if (!el.classList.contains('qty')) return;
  const cap = Number(el.max) || Infinity;
  const q = Math.min(cap, Math.max(1, Number(el.value) || 1));
  el.value = String(q);
  setQty(el.dataset.slug!, q);
});
itemsEl.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest('.remove') as HTMLElement | null;
  if (el) removeItem(el.dataset.slug!);
});
window.addEventListener(CART_EVENT, renderCart);

// ---- Validation ----
function showErr(field: string, msg: string) {
  const el = document.getElementById('err-' + field);
  if (el) { el.textContent = msg; el.classList.remove('hidden'); }
}
function clearErrs() {
  ['name', 'phone', 'address', 'pincode', 'city'].forEach((f) => document.getElementById('err-' + f)?.classList.add('hidden'));
}
function normPhone(raw: string): string {
  let d = (raw || '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return d;
}

$('checkout-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const data = new FormData(form);
  const get = (k: string) => String(data.get(k) || '').trim();

  if (get('company')) return; // honeypot

  clearErrs();
  const name = get('name');
  const phone = normPhone(get('phone'));
  const address = get('address');
  const pincode = get('pincode');
  const city = get('city');
  let ok = true;

  if (!NAME_RE.test(name)) { showErr('name', 'Enter your name (2–50 letters).'); ok = false; }
  if (!/^[6-9]\d{9}$/.test(phone)) { showErr('phone', 'Enter a valid 10-digit Indian mobile number.'); ok = false; }
  if (address.length < 10) { showErr('address', 'Please enter your full delivery address.'); ok = false; }
  if (!/^[1-9]\d{5}$/.test(pincode)) { showErr('pincode', 'Enter a valid 6-digit pincode.'); ok = false; }
  if (city.length < 2) { showErr('city', 'Enter your city / district.'); ok = false; }
  if (!ok) return;

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
    coupon: coupon ? { percentOff: coupon.percentOff, label: coupon.label, discount: coupon.discount } : null,
    shipping: ship,
    payable,
    customer: { name, phone: '+91' + phone, address, pincode, city, state: get('state'), note: get('note') },
  };

  const btn = $('submit-btn') as HTMLButtonElement;
  btn.disabled = true;
  btn.textContent = 'Placing order…';
  try {
    await recordOrder(payload);
  } finally {
    completeOrder(payload, payable);
  }
});

// ---- Payment screen ----
// Persist only the minimum needed to re-open the pay screen — NO customer PII.
interface StoredOrder { ref: string; payable: number; ts: number; }
function saveLastOrder(ref: string, payable: number) {
  try { localStorage.setItem(LAST_ORDER_KEY, JSON.stringify({ ref, payable, ts: Date.now() } as StoredOrder)); } catch {}
}
function loadLastOrder(): StoredOrder | null {
  try {
    const raw = localStorage.getItem(LAST_ORDER_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as StoredOrder;
    if (!v.ref || Date.now() - (v.ts || 0) > 24 * 3600_000) return null;
    return v;
  } catch { return null; }
}

function renderPayScreen(ref: string, total: number, waText: string) {
  paid = true;
  cartSection.classList.add('hidden');
  emptyEl.classList.add('hidden');
  paySection.classList.remove('hidden');

  $('pay-amount').textContent = money(total);
  $('pay-amount-2').textContent = money(total);
  $('pay-ref').textContent = '#' + ref;
  document.querySelectorAll('.pay-ref-inline').forEach((el) => (el.textContent = '#' + ref));

  const uri = upiLink(total, ref);
  if (isMobile()) {
    const b = $('upi-btn') as HTMLAnchorElement;
    b.href = uri;
    b.classList.remove('hidden');
  } else {
    $('upi-qr-wrap').classList.remove('hidden');
    QRCode.toCanvas($('upi-qr'), uri, { width: 220, margin: 1 }, () => {});
  }

  const wa = $('wa-confirm') as HTMLAnchorElement;
  wa.href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(waText)}`;
}

/** Fresh order: full WhatsApp message, then persist (ref+amount only) and clear cart. */
function completeOrder(o: OrderPayload, total: number) {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderPayScreen(o.ref, total, orderText(o) + `\nI'm paying / have paid via UPI.`);
  saveLastOrder(o.ref, total);
  clearCart();
}

/** Restored order (page refresh): only ref + amount survive, so use a generic message. */
function restoreOrder(s: StoredOrder) {
  renderPayScreen(
    s.ref,
    s.payable,
    `Hi, I'd like to confirm my Tantu Kala order #${s.ref} (${money(s.payable)}). I'm paying via UPI.`
  );
}

$('copy-vpa').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(SITE.upi.vpa);
    $('copied').classList.remove('hidden');
    setTimeout(() => $('copied').classList.add('hidden'), 1500);
  } catch {}
});

$('new-order').addEventListener('click', () => {
  try { localStorage.removeItem(LAST_ORDER_KEY); } catch {}
  window.location.href = '/';
});

// ---- Pincode -> city/state (progressive enhancement; never blocks checkout) ----
const pinInput = document.getElementById('pincode') as HTMLInputElement | null;
const cityInput = document.getElementById('city') as HTMLInputElement | null;
const stateInput = document.getElementById('state') as HTMLInputElement | null;
const pinHint = document.getElementById('pin-hint');
let lastPin = '';

pinInput?.addEventListener('input', () => {
  const pin = (pinInput.value || '').replace(/\D/g, '').slice(0, 6);
  if (pin.length !== 6 || pin === lastPin) return;
  lastPin = pin;
  void fetchPinLocation(pin);
});

async function fetchPinLocation(pin: string) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, { signal: ctrl.signal });
    clearTimeout(timer);
    const data = await res.json();
    const rec = Array.isArray(data) ? data[0] : null;
    const po = rec && rec.Status === 'Success' && rec.PostOffice && rec.PostOffice[0];
    if (!po) { pinHint?.classList.add('hidden'); return; }
    // don't clobber a city the user already typed; always sync the read-only state
    if (cityInput && !cityInput.value.trim()) cityInput.value = po.District || '';
    if (stateInput) stateInput.value = po.State || '';
    if (pinHint) {
      pinHint.textContent = `📍 ${po.District}, ${po.State}`;
      pinHint.classList.remove('hidden');
    }
  } catch {
    // API slow / unavailable / offline — user just fills City manually. Never block.
    pinHint?.classList.add('hidden');
  }
}

// ---- Init ----
const last = loadLastOrder();
if (getCart().length === 0 && last) restoreOrder(last);
else renderCart();
