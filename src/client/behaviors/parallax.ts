import { motionEnabled, qsa } from "../core/env.ts";
import { addScene, pageTop } from "../core/scenes.ts";

/**
 * [data-parallax="0.1"] — drift an element against the scroll by a fraction of
 * its distance from the viewport centre. Geometry is read from the parent
 * (never transformed by us), so measurements don't feed back on themselves.
 */
export function initParallax(): void {
  if (!motionEnabled()) return;
  for (const el of qsa("[data-parallax]")) {
    const speed = Number(el.dataset.parallax ?? "0");
    const anchor = el.parentElement;
    if (!speed || !anchor) continue;
    let top = 0;
    let height = 0;
    let last = "";
    addScene({
      measure() {
        top = pageTop(anchor);
        height = anchor.offsetHeight;
      },
      update(y, vh) {
        if (y + vh < top - 200 || y > top + height + 200) return;
        const offset = top + height / 2 - (y + vh / 2);
        const value = `translate3d(0, ${(offset * speed).toFixed(1)}px, 0)`;
        if (value !== last) {
          el.style.transform = value;
          last = value;
        }
      },
    });
  }
}

/** [data-rise] — the footer wordmark rises into place as the footer arrives. */
export function initRise(): void {
  if (!motionEnabled()) return;
  for (const el of qsa("[data-rise]")) {
    const anchor = el.parentElement ?? el;
    let top = 0;
    let travel = 1;
    let last = "";
    addScene({
      measure() {
        top = pageTop(anchor);
        // from "word enters the viewport" to "page fully scrolled"
        travel = Math.max(1, document.documentElement.scrollHeight - top);
      },
      update(y, vh) {
        const p = Math.min(1, Math.max(0, (y + vh - top) / travel));
        const value = `${((1 - p) * 55).toFixed(1)}%`;
        if (value !== last) {
          el.style.setProperty("--rise", value);
          last = value;
        }
      },
    });
  }
}
