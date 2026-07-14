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

  itemsEl.innerHTML = '';
  for (const it of items) {
    const cap = stockOf[it.slug];
    const li = document.createElement('li');
    li.className = 'card p-3 flex items-center gap-3';
    li.innerHTML = `
      <div class="flex-1">
        <p class="font-medium">${it.name}</p>
        <p class="text-sm text-ink/60">${money(it.price)} each</p>
      </div>
      <input type="number" min="1" ${cap ? `max="${cap}"` : ''} value="${it.qty}" data-slug="${it.slug}"
             class="qty w-16 rounded-lg border border-ink/20 px-2 py-1.5 text-center" />
      <button data-slug="${it.slug}" class="remove text-henna text-sm">Remove</button>`;
    itemsEl.appendChild(li);
  }

  const { sub, coupon, ship } = computeTotals();
  $('subtotal').textContent = money(sub);

  // coupon line
  if (coupon) {
    $('coupon-row').classList.remove('hidden');
    $('coupon-label').textContent = coupon.label;
    $('coupon-amount').textContent = '-' + money(coupon.discount);
  } else {
    $('coupon-row').classList.add('hidden');
  }

  // shipping (free by default; distinguish threshold vs default)
  const strike = SITE.shipping.strikethroughFrom;
  if (ship === 0) {
    $('free-ship-badge').classList.remove('hidden');
    const overNote =
      SITE.shipping.freeAbove && sub >= SITE.shipping.freeAbove ? ` over ${money(SITE.shipping.freeAbove)}` : '';
    $('shipping').innerHTML = strike
      ? `<span class="line-through text-ink/40 mr-1">${money(strike)}</span><span class="text-leaf font-semibold">FREE${overNote}</span>`
      : `<span class="text-leaf font-semibold">FREE${overNote}</span>`;
  } else {
    $('free-ship-badge').classList.add('hidden');
    $('shipping').textContent = money(ship);
  }

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
  ['name', 'phone', 'address', 'pincode'].forEach((f) => document.getElementById('err-' + f)?.classList.add('hidden'));
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
  let ok = true;

  if (!/^[A-Za-z][A-Za-z .]{1,39}$/.test(name)) { showErr('name', 'Enter your name (letters only, 2–40 chars).'); ok = false; }
  if (!/^[6-9]\d{9}$/.test(phone)) { showErr('phone', 'Enter a valid 10-digit Indian mobile number.'); ok = false; }
  if (address.length < 10) { showErr('address', 'Please enter your full delivery address.'); ok = false; }
  if (!/^[1-9]\d{5}$/.test(pincode)) { showErr('pincode', 'Enter a valid 6-digit pincode.'); ok = false; }
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
    customer: { name, phone: '+91' + phone, address, pincode, note: get('note') },
  };

  const btn = $('submit-btn') as HTMLButtonElement;
  btn.disabled = true;
  btn.textContent = 'Placing order…';
  try {
    await recordOrder(payload);
  } finally {
    showPayment(payload, payable);
  }
});

function saveLastOrder(o: OrderPayload, total: number) {
  try { localStorage.setItem(LAST_ORDER_KEY, JSON.stringify({ o, total, ts: Date.now() })); } catch {}
}
function loadLastOrder(): { o: OrderPayload; total: number } | null {
  try {
    const raw = localStorage.getItem(LAST_ORDER_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    if (Date.now() - (v.ts || 0) > 24 * 3600_000) return null;
    return { o: v.o, total: v.total };
  } catch { return null; }
}

function showPayment(o: OrderPayload, total: number, restoring = false) {
  paid = true;
  cartSection.classList.add('hidden');
  emptyEl.classList.add('hidden');
  paySection.classList.remove('hidden');
  if (!restoring) window.scrollTo({ top: 0, behavior: 'smooth' });

  $('pay-amount').textContent = money(total);
  $('pay-amount-2').textContent = money(total);
  $('pay-ref').textContent = '#' + o.ref;
  document.querySelectorAll('.pay-ref-inline').forEach((el) => (el.textContent = '#' + o.ref));

  const uri = upiLink(total, o.ref);
  if (isMobile()) {
    const b = $('upi-btn') as HTMLAnchorElement;
    b.href = uri;
    b.classList.remove('hidden');
  } else {
    $('upi-qr-wrap').classList.remove('hidden');
    QRCode.toCanvas($('upi-qr'), uri, { width: 220, margin: 1 }, () => {});
  }

  const wa = $('wa-confirm') as HTMLAnchorElement;
  wa.href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
    orderText(o) + `\nI'm paying / have paid via UPI.`
  )}`;

  if (!restoring) {
    saveLastOrder(o, total);
    clearCart();
  }
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

// ---- Init ----
const last = loadLastOrder();
if (getCart().length === 0 && last) showPayment(last.o, last.total, true);
else renderCart();
