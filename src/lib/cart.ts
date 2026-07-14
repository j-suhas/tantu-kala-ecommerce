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

const KEY = 'tk_cart_v1';
const EVENT = 'cart:changed';

function read(): CartItem[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]): void {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: items }));
}

export function getCart(): CartItem[] {
  return read();
}

export function addItem(item: Omit<CartItem, 'qty'>, qty = 1): void {
  const items = read();
  const found = items.find((i) => i.slug === item.slug);
  if (found) found.qty += qty;
  else items.push({ ...item, qty });
  write(items);
}

export function setQty(slug: string, qty: number): void {
  let items = read();
  if (qty <= 0) items = items.filter((i) => i.slug !== slug);
  else items = items.map((i) => (i.slug === slug ? { ...i, qty } : i));
  write(items);
}

export function removeItem(slug: string): void {
  write(read().filter((i) => i.slug !== slug));
}

export function clearCart(): void {
  write([]);
}

export function itemCount(items: CartItem[] = read()): number {
  return items.reduce((n, i) => n + i.qty, 0);
}

export function subtotal(items: CartItem[] = read()): number {
  return items.reduce((s, i) => s + i.price * i.qty, 0);
}

export const CART_EVENT = EVENT;
