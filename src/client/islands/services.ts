import { damp, media, qs, qsa } from "../core/env.ts";
import { addTick } from "../core/ticker.ts";

/**
 * Services index: rows are disclosure buttons (server-rendered open, so the
 * content is there without JS). On fine pointers a screenshot of related real
 * work trails the cursor while you move down the list.
 */
export function mountServices(list: HTMLElement): void {
  const rows = qsa("[data-svc]", list);

  rows.forEach((row, i) => {
    const button = qs<HTMLButtonElement>("[data-svc-toggle]", row);
    const panel = button ? document.getElementById(button.getAttribute("aria-controls") ?? "") : null;
    if (!button || !panel) return;
    const set = (open: boolean) => {
      button.setAttribute("aria-expanded", String(open));
      row.classList.toggle("is-collapsed", !open);
      panel.inert = !open;
    };
    set(i === 0);
    button.addEventListener("click", () => set(button.getAttribute("aria-expanded") !== "true"));
  });

  if (!media.finePointer.matches || media.reducedMotion.matches) return;
  const float = qs("[data-svc-float]");
  if (!float) return;
  const previews = new Map(qsa("[data-svc-preview]", float).map((el) => [el.dataset.svcPreview ?? "", el]));

  const target = { x: 0, y: 0 };
  const pos = { x: 0, y: 0, r: 0 };
  let shown: HTMLElement | null = null;
  let stop: (() => void) | null = null;

  const tick = (_t: number, dt: number) => {
    const k = damp(9, dt);
    const px = pos.x;
    pos.x += (target.x - pos.x) * k;
    pos.y += (target.y - pos.y) * k;
    pos.r += (Math.max(-8, Math.min(8, (pos.x - px) * 0.4)) - pos.r) * k;
    float.style.setProperty("--fx", `${pos.x.toFixed(1)}px`);
    float.style.setProperty("--fy", `${pos.y.toFixed(1)}px`);
    float.style.setProperty("--fr", `${pos.r.toFixed(2)}deg`);
    if (!shown && Math.abs(target.x - pos.x) < 0.3 && Math.abs(pos.r) < 0.05 && stop) {
      stop();
      stop = null;
    }
  };

  const show = (id: string | null) => {
    const next = id ? previews.get(id) ?? null : null;
    if (next === shown) return;
    shown?.classList.remove("is-shown");
    next?.classList.add("is-shown");
    shown = next;
  };

  list.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const row = e.target instanceof Element ? e.target.closest<HTMLElement>("[data-svc]") : null;
    const w = float.offsetWidth;
    // keep the preview to the right of the pointer, flipping near the edge
    const x = e.clientX + 36 + w > window.innerWidth ? e.clientX - w - 36 : e.clientX + 36;
    target.x = x;
    target.y = e.clientY - w * 0.35;
    if (!shown) {
      pos.x = target.x;
      pos.y = target.y;
    }
    show(row?.dataset.svc ?? null);
    if (!stop) stop = addTick(tick);
  });
  list.addEventListener("pointerleave", () => show(null));
  window.addEventListener("scroll", () => show(null), { passive: true });
}
