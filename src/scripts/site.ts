/**
 * Site-wide client behaviour: delegated "Add to cart" + toast.
 * Extracted to a typed module so it compiles as TypeScript unambiguously.
 */
import { addItem } from '../lib/cart';

const toast = document.getElementById('toast');
let t: ReturnType<typeof setTimeout>;

function showToast(msg: string) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove('opacity-0', 'translate-y-3');
  clearTimeout(t);
  t = setTimeout(() => toast.classList.add('opacity-0', 'translate-y-3'), 1600);
}

document.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest('.add-to-cart') as HTMLElement | null;
  if (!btn) return;
  addItem(
    {
      slug: btn.dataset.slug!,
      name: btn.dataset.name!,
      price: Number(btn.dataset.price),
    },
    Number(btn.dataset.qty) || 1
  );
  showToast(`${btn.dataset.name} added ✓`);
});

// Fade product images in as they load (subtle skeleton feel). No-JS-safe: if this
// never runs, images are simply visible. Respects the reduce-motion setting.
if (matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  document.querySelectorAll<HTMLImageElement>('img.img-fade').forEach((img) => {
    if (img.complete) return; // already loaded/cached — leave visible
    img.style.opacity = '0';
    // Fade opacity, but keep the hover `transform` transition matching Tailwind's
    // `transition` class (150ms) so the card zoom stays smooth, not mechanical.
    img.style.transition = 'opacity 0.45s ease, transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)';
    const show = () => (img.style.opacity = '1');
    img.addEventListener('load', show, { once: true });
    img.addEventListener('error', show, { once: true });
  });
}
