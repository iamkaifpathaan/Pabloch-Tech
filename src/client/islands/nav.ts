import { media, qs, qsa } from "../core/env.ts";
import { addScene } from "../core/scenes.ts";

/**
 * Navigation: floating state after the first scroll, and the full-screen menu
 * (a modal dialog: focus contained, Esc closes, page behind made inert, focus
 * returned to the toggle). Which page you're on is rendered into the markup.
 */
export function mountNav(header: HTMLElement): void {
  // Floating plate
  let floating: boolean | null = null;
  addScene({
    measure() {},
    update(y) {
      const next = y > 24;
      if (next !== floating) {
        floating = next;
        header.classList.toggle("is-floating", next);
      }
    },
  });

  // The current page is marked server-side (aria-current="page"); nothing to track here.

  mountMenu(header);
}

function mountMenu(header: HTMLElement): void {
  const toggle = qs<HTMLButtonElement>("[data-menu-toggle]", header);
  const menu = qs<HTMLElement>("[data-menu]");
  if (!toggle || !menu) return;
  const label = qs<HTMLElement>(".menu-toggle-label", toggle);
  const outside = [qs("#main"), qs(".footer"), qs(".skip-link")].filter((el): el is HTMLElement => !!el);
  let open = false;
  let closeTimer = 0;

  const focusables = (): HTMLElement[] =>
    [toggle, ...qsa<HTMLElement>("a[href], button:not([disabled])", menu)].filter((el) => !el.closest("[hidden]"));

  const setOpen = (next: boolean, restoreFocus = true) => {
    if (next === open) return;
    open = next;
    window.clearTimeout(closeTimer);
    toggle.setAttribute("aria-expanded", String(next));
    toggle.setAttribute("aria-label", next ? "Close menu" : "Open menu");
    if (label) label.textContent = next ? "Close" : "Menu";
    document.documentElement.classList.toggle("menu-open", next);
    outside.forEach((el) => (el.inert = next));

    if (next) {
      menu.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add("is-open")));
      qs<HTMLElement>("[data-menu-link]", menu)?.focus({ preventScroll: true });
    } else {
      menu.classList.remove("is-open");
      closeTimer = window.setTimeout(() => (menu.hidden = true), media.reducedMotion.matches ? 0 : 420);
      if (restoreFocus) toggle.focus({ preventScroll: true });
    }
  };

  toggle.setAttribute("aria-label", "Open menu");
  toggle.addEventListener("click", () => setOpen(!open));

  // Following a link. Another page: just go (the menu doesn't need to animate
  // out first). The page you're already on: close the menu and stay.
  menu.addEventListener("click", (e) => {
    const link = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>("a[data-menu-link]") : null;
    if (!link) return;
    const samePage = link.origin === location.origin && link.pathname === location.pathname;
    if (!samePage) return;
    e.preventDefault();
    setOpen(false, false);
    const target = link.hash ? document.querySelector<HTMLElement>(link.hash) : null;
    requestAnimationFrame(() => {
      if (target) {
        target.scrollIntoView({ behavior: media.reducedMotion.matches ? "auto" : "smooth", block: "start" });
        history.pushState(null, "", link.hash);
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      } else {
        window.scrollTo({ top: 0, behavior: media.reducedMotion.matches ? "auto" : "smooth" });
        toggle.focus({ preventScroll: true });
      }
    });
  });

  // Coming back to this page with the browser's back button can restore it
  // from the back/forward cache with the menu still open.
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) setOpen(false, false);
  });

  document.addEventListener("keydown", (e) => {
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key !== "Tab") return;
    const items = focusables();
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  window.matchMedia("(min-width: 961px)").addEventListener("change", (e) => {
    if (e.matches) setOpen(false, false);
  });
}
