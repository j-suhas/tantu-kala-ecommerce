/**
 * Cutoff-banner countdown. Lives in its own module so Astro bundles it to an
 * external /_astro/*.js file (CSP-safe — no inline script, no `define:vars`).
 * Reads the cutoff date from the banner's data attribute, computed per-visitor
 * so "X days left" is never stale.
 */
const banner = document.getElementById('cutoff-banner');
const daysEl = document.getElementById('cutoff-days');

if (banner) {
  const cutoffISO = banner.dataset.cutoff ?? '';
  const days = Math.ceil((new Date(cutoffISO).getTime() - Date.now()) / 86_400_000);
  if (days > 0) {
    banner.classList.remove('hidden');
    if (days <= 21 && daysEl) {
      daysEl.textContent = ` · just ${days} day${days === 1 ? '' : 's'} left`;
    }
  }
}
