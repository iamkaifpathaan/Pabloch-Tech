import { motionEnabled, qsa } from "../core/env.ts";

/** Adds .is-in to [data-reveal] elements as they enter the viewport. */
export function initReveal(): void {
  const items = qsa("[data-reveal]");
  if (!motionEnabled() || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );

  for (const el of items) {
    if (el.hasAttribute("data-reveal-now")) {
      // Above the fold: start on the next frame so the transition actually runs.
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("is-in")));
    } else {
      io.observe(el);
    }
  }

  // Deep links (e.g. /#contact) land mid-page: reveal whatever is on screen now.
  window.addEventListener(
    "load",
    () => {
      const vh = window.innerHeight;
      for (const el of items) {
        const r = el.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) el.classList.add("is-in");
      }
    },
    { once: true },
  );

  // If motion is switched off mid-visit, show everything immediately.
  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (e) => {
    if (e.matches) {
      document.documentElement.classList.remove("js-motion");
      items.forEach((el) => el.classList.add("is-in"));
    }
  });
}
