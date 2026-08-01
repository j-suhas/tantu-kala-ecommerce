/**
 * Product-page interactions (CSP-safe module): quantity sync, share, and the
 * mobile sticky "Add to cart" bar. Loaded once from products/[slug].astro.
 */

const qty = document.getElementById('qty') as HTMLInputElement | null;
const addBtn = document.getElementById('add-btn') as HTMLElement | null;
const stickyBtn = document.getElementById('sticky-add') as HTMLElement | null;

// Keep both Add buttons' qty in sync with the number input.
qty?.addEventListener('input', () => {
  const max = Number(qty.max) || Infinity;
  const val = Math.min(max, Math.max(1, Number(qty.value) || 1));
  qty.value = String(val);
  if (addBtn) addBtn.dataset.qty = String(val);
  if (stickyBtn) stickyBtn.dataset.qty = String(val);
});

// Share: native Web Share where available, else WhatsApp.
const shareBtn = document.getElementById('share-btn') as HTMLButtonElement | null;
shareBtn?.addEventListener('click', async () => {
  const url = location.href;
  const title = shareBtn.dataset.shareTitle || document.title;
  const text = `${title} — Tantu Kala`;
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
    } catch {
      /* user cancelled — do nothing */
    }
    return;
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank', 'noopener');
});

// Sticky mobile bar: reveal when the main Add button scrolls out of view.
const stickyBar = document.getElementById('sticky-bar');
if (stickyBar && addBtn && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    ([entry]) => stickyBar.classList.toggle('translate-y-full', entry.isIntersecting),
    { threshold: 0 },
  );
  io.observe(addBtn);
}
