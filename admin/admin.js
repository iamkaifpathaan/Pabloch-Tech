// Small conveniences for /admin/. Every page works without this file.
document.addEventListener("submit", (e) => {
  const msg = e.target instanceof HTMLFormElement && e.target.dataset.confirm;
  if (msg && !window.confirm(msg)) e.preventDefault();
});

document.addEventListener("click", async (e) => {
  const el = e.target instanceof Element ? e.target.closest("[data-copy], [data-copy-text]") : null;
  if (!el) return;
  const text = el.getAttribute("data-copy-text") ?? el.textContent ?? "";
  try {
    await navigator.clipboard.writeText(text.trim());
    el.classList.add("is-copied");
    if (el.hasAttribute("data-copy-text")) {
      const label = el.textContent;
      el.textContent = "Copied ✓";
      setTimeout(() => (el.textContent = label), 1500);
    }
  } catch {
    /* clipboard blocked — the text is still selectable */
  }
});
