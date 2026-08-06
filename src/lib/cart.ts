/**
 * Client-side cart. Lives in localStorage; no backend, no accounts.
 * Every mutation dispatches `cart:changed` on window so UI can re-render.
 */
export interface CartItem {
  slug: string;
  name: string;
  price: number;
  qty: number;
}

/**
 * Why this mutation happened, carried on the event itself (not a side-channel
 * flag in a listener) so any current or future listener can decide how much
 * work it needs to do — e.g. a qty tweak only needs totals recomputed, not a
 * full list rebuild that would blow away focus on the field being edited.
 */
export type CartChangeCause = "add" | "remove" | "qty" | "clear";

export interface CartChangeDetail {
  items: CartItem[];
  cause: CartChangeCause;
}

const KEY = "tk_cart_v1";
const EVENT = "cart:changed";

function read(): CartItem[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[], cause: CartChangeCause): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Storage can throw in private mode / when full — don't let add-to-cart break.
    // The event below still fires so the current page reflects the change in-memory.
  }
  window.dispatchEvent(
    new CustomEvent<CartChangeDetail>(EVENT, { detail: { items, cause } }),
  );
}

export function getCart(): CartItem[] {
  return read();
}

export function addItem(item: Omit<CartItem, "qty">, qty = 1): void {
  const items = read();
  const found = items.find((i) => i.slug === item.slug);
  if (found) found.qty += qty;
  else items.push({ ...item, qty });
  write(items, "add");
}

export function setQty(slug: string, qty: number): void {
  let items = read();
  if (qty <= 0) items = items.filter((i) => i.slug !== slug);
  else items = items.map((i) => (i.slug === slug ? { ...i, qty } : i));
  write(items, "qty");
}

export function removeItem(slug: string): void {
  write(
    read().filter((i) => i.slug !== slug),
    "remove",
  );
}

export function clearCart(): void {
  write([], "clear");
}

export function itemCount(items: CartItem[] = read()): number {
  return items.reduce((n, i) => n + i.qty, 0);
}

export function subtotal(items: CartItem[] = read()): number {
  return items.reduce((s, i) => s + i.price * i.qty, 0);
}

export const CART_EVENT = EVENT;
