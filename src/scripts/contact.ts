/** Contact page: copy the email to the clipboard with brief feedback.
    The address is also `select-all`, so manual copy still works if clipboard is blocked. */
const btn = document.getElementById('copy-email') as HTMLButtonElement | null;
const done = document.getElementById('copy-email-done');

btn?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(btn.dataset.email ?? '');
    done?.classList.remove('opacity-0');
    setTimeout(() => done?.classList.add('opacity-0'), 1500);
  } catch {
    /* clipboard unavailable — the email text is selectable as a fallback */
  }
});
