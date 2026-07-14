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
