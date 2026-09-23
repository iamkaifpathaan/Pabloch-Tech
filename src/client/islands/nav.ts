import { media, qs, qsa } from "../core/env.ts";
import { addScene } from "../core/scenes.ts";

/**
 * Navigation: floating state after the first scroll, current-section marker,
 * and the full-screen menu (a modal dialog: focus contained, Esc closes,
 * page behind made inert, focus returned to the toggle).
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

  // Current section
  const links = qsa<HTMLAnchorElement>("[data-nav-link]", header);
  const bySection = new Map<Element, HTMLAnchorElement>();
  for (const a of links) {
    const section = document.getElementById(a.dataset.navLink ?? "");
    if (section) bySection.set(section, a);
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const link = bySection.get(entry.target);
        if (!link) continue;
        if (entry.isIntersecting) {
          links.forEach((l) => l.removeAttribute("aria-current"));
          link.setAttribute("aria-current", "true");
        } else if (link.hasAttribute("aria-current")) {
          link.removeAttribute("aria-current");
        }
      }
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  bySection.forEach((_, section) => io.observe(section));

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

  // Following a link: close first (restores scrolling), then let the anchor jump happen.
  menu.addEventListener("click", (e) => {
    const link = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>("a[data-menu-link]") : null;
    if (!link) return;
    const hash = link.hash;
    e.preventDefault();
    setOpen(false, false);
    const target = hash ? document.querySelector<HTMLElement>(hash) : null;
    requestAnimationFrame(() => {
      target?.scrollIntoView({ behavior: media.reducedMotion.matches ? "auto" : "smooth", block: "start" });
      if (hash) history.pushState(null, "", hash);
      if (target) {
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    });
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
