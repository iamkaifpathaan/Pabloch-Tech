import { damp, media, qsa } from "../core/env.ts";
import { addTick } from "../core/ticker.ts";

/**
 * Custom cursor: a ring that trails the system pointer (which stays visible)
 * and turns into a label over [data-cursor] targets. Fine pointers only;
 * never created for touch or reduced motion.
 */
export function initCursor(): void {
  if (!media.finePointer.matches || media.reducedMotion.matches) return;

  const el = document.createElement("div");
  el.className = "cursor";
  el.setAttribute("aria-hidden", "true");
  const ring = document.createElement("span");
  ring.className = "cursor-ring";
  const label = document.createElement("span");
  label.className = "cursor-label";
  el.append(ring, label);
  document.body.append(el);

  const target = { x: -100, y: -100 };
  const pos = { x: -100, y: -100 };
  let stop: (() => void) | null = null;

  const tick = (_t: number, dt: number) => {
    const k = damp(18, dt);
    pos.x += (target.x - pos.x) * k;
    pos.y += (target.y - pos.y) * k;
    el.style.setProperty("--cx", `${pos.x.toFixed(1)}px`);
    el.style.setProperty("--cy", `${pos.y.toFixed(1)}px`);
    if (Math.abs(target.x - pos.x) < 0.1 && Math.abs(target.y - pos.y) < 0.1 && stop) {
      stop();
      stop = null;
    }
  };

  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      target.x = e.clientX;
      target.y = e.clientY;
      if (!el.classList.contains("is-visible")) {
        pos.x = target.x;
        pos.y = target.y;
        el.classList.add("is-visible");
      }
      if (!stop) stop = addTick(tick);
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", () => el.classList.remove("is-visible"));

  document.addEventListener("pointerover", (e) => {
    const t = e.target instanceof Element ? e.target : null;
    if (!t) return;
    const labelled = t.closest<HTMLElement>("[data-cursor]");
    const field = t.closest("input, textarea, select");
    const link = t.closest("a, button, label, [role='button']");
    el.classList.toggle("is-hidden", !!field);
    el.classList.toggle("is-label", !!labelled && !field);
    el.classList.toggle("is-link", !labelled && !!link && !field);
    if (labelled) label.textContent = labelled.dataset.cursor ?? "";
  });
}

/**
 * Magnetic elements lean toward the pointer. Implemented with CSS variables
 * (--mx/--my, and --lx/--ly for the label) so other transforms can compose.
 */
export function initMagnetic(): void {
  if (!media.finePointer.matches || media.reducedMotion.matches) return;
  for (const el of qsa("[data-magnetic]")) {
    const strength = el.classList.contains("cta-orb") ? 0.32 : 0.24;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.setProperty("--mx", `${(dx * strength).toFixed(1)}px`);
      el.style.setProperty("--my", `${(dy * strength).toFixed(1)}px`);
      el.style.setProperty("--lx", `${(dx * 0.1).toFixed(1)}px`);
      el.style.setProperty("--ly", `${(dy * 0.1).toFixed(1)}px`);
    });
    el.addEventListener("pointerleave", () => {
      for (const v of ["--mx", "--my", "--lx", "--ly"]) el.style.setProperty(v, "0px");
    });
  }
}
