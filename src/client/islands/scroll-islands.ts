/**
 * Scroll-driven islands. Each one reads layout in measure() and writes a few
 * CSS custom properties / transforms in update(). Without the motion layer
 * they do nothing and the static CSS layout applies.
 */
import { clamp, easeInOutCubic, media, motionEnabled, qs, qsa, setVar } from "../core/env.ts";
import { addScene, pageTop, remeasure, scrollVelocity } from "../core/scenes.ts";
import { addTick } from "../core/ticker.ts";

/* ------------------------------------------------------------------ */
/*  Intro statement — words light up as the paragraph is read          */
/* ------------------------------------------------------------------ */
export function mountScrubText(track: HTMLElement): void {
  if (!motionEnabled()) return;
  const statement = qs(".intro-statement", track) ?? track;
  let top = 0;
  let height = 1;
  let last = "";
  addScene({
    measure() {
      top = pageTop(statement);
      height = statement.offsetHeight || 1;
    },
    update(y, vh) {
      // 0 when the paragraph's top reaches 85% of the viewport, 1 when its bottom reaches 55%.
      const p = clamp((y + vh * 0.85 - top) / (height + vh * 0.3));
      const v = p.toFixed(3);
      if (v !== last) {
        track.style.setProperty("--p", v);
        last = v;
      }
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Selected work 01 — the pinned expansion ("the wow moment")         */
/* ------------------------------------------------------------------ */
export function mountWorkFeature(root: HTMLElement): void {
  if (!motionEnabled()) return;
  const track = qs(".wf-track", root);
  const stage = qs(".wf-stage", root);
  const caption = qs(".wf-caption", root);
  if (!track || !stage || !caption) return;

  let top = 0;
  let distance = 1;
  let vw = window.innerWidth;
  const cache = new Map<string, string>();

  addScene({
    measure(w) {
      vw = w;
      top = pageTop(track);
      distance = Math.max(1, track.offsetHeight - window.innerHeight);
    },
    update(y) {
      const p = clamp((y - top) / distance);
      const small = vw < 768;
      const s0 = small ? 0.72 : vw < 1024 ? 0.5 : 0.36;
      const e = easeInOutCubic(clamp(p / 0.62));
      const cp = clamp((p - 0.6) / 0.24);
      setVar(stage, "--fs", (s0 + (1 - s0) * e).toFixed(4), cache);
      setVar(stage, "--is", (1.32 - 0.32 * e).toFixed(4), cache);
      setVar(stage, "--wx", `${(e * vw * (small ? 0.6 : 0.36)).toFixed(1)}px`, cache);
      setVar(stage, "--wo", (1 - clamp(e * 1.5)).toFixed(3), cache);
      setVar(stage, "--cp", cp.toFixed(3), cache);
      setVar(stage, "--ho", (1 - clamp(p * 6)).toFixed(3), cache);
      caption.classList.toggle("is-inert", cp < 0.5);
    },
  });

  // Keyboard users tabbing into the caption: jump to where it's fully visible.
  caption.addEventListener("focusin", () => {
    const target = top + distance * 0.9;
    if (Math.abs(window.scrollY - target) > 4) window.scrollTo({ top: target, behavior: "auto" });
  });
}

/* ------------------------------------------------------------------ */
/*  Process — the line draws, steps light up as they're reached        */
/* ------------------------------------------------------------------ */
export function mountProcessLine(rail: HTMLElement): void {
  const steps = qsa(".step", rail);
  const counter = qs("[data-process-now]");
  if (!motionEnabled()) {
    steps.forEach((s) => s.classList.add("is-active"));
    return;
  }
  let top = 0;
  let height = 1;
  let stepTops: number[] = [];
  let current = -1;
  const cache = new Map<string, string>();

  addScene({
    measure() {
      top = pageTop(rail);
      height = rail.offsetHeight || 1;
      stepTops = steps.map((s) => pageTop(s));
    },
    update(y, vh) {
      const line = y + vh * 0.62;
      setVar(rail, "--lp", clamp((line - top) / height).toFixed(4), cache);
      let active = -1;
      stepTops.forEach((t, i) => {
        const on = line >= t;
        steps[i]?.classList.toggle("is-active", on);
        if (on) active = i;
      });
      if (active !== current) {
        current = active;
        if (counter) counter.textContent = String(Math.max(1, active + 1)).padStart(2, "0");
      }
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Why Pabloch — vertical scroll drives a horizontal rail (≥1024px)   */
/* ------------------------------------------------------------------ */
export function mountHorizontal(track: HTMLElement): void {
  if (!motionEnabled()) return;
  const section = track.closest<HTMLElement>(".why");
  const rail = qs("[data-hs-rail]", track);
  const bar = qs("[data-hs-bar]", track);
  const now = qs("[data-hs-now]", track);
  const panels = rail ? qsa(":scope > li", rail) : [];
  if (!section || !rail || !panels.length) return;

  let enabled = false;
  let top = 0;
  let distance = 0;
  let current = 0;
  let last = "";

  const apply = () => {
    const on = media.desktop.matches;
    if (on === enabled) return;
    enabled = on;
    section.classList.toggle("is-hs", on);
    if (!on) {
      track.style.height = "";
      rail.style.transform = "";
      last = "";
    }
    remeasure();
  };
  media.desktop.addEventListener("change", apply);
  apply();

  addScene({
    measure(vw, vh) {
      if (!enabled) return;
      // The rail is width:max-content with the page margin as padding, so the
      // travel is simply how much wider it is than the viewport.
      distance = Math.max(0, rail.offsetWidth - vw);
      track.style.height = `${Math.round(vh + distance)}px`;
      top = pageTop(track);
    },
    update(y) {
      if (!enabled) return;
      const p = distance ? clamp((y - top) / distance) : 0;
      const v = `translate3d(${(-p * distance).toFixed(1)}px, 0, 0)`;
      if (v !== last) {
        rail.style.transform = v;
        last = v;
        bar?.style.setProperty("--hp", p.toFixed(4));
        const idx = Math.min(panels.length, Math.floor(p * panels.length * 0.999) + 1);
        if (idx !== current && now) {
          current = idx;
          now.textContent = String(idx).padStart(2, "0");
        }
      }
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Marquee — drifts on its own, speeds up and follows scroll direction */
/* ------------------------------------------------------------------ */
export function mountMarquee(root: HTMLElement): void {
  if (!motionEnabled()) return;
  const track = qs(".mq-track", root);
  const run = qs(".mq-run", root);
  if (!track || !run) return;

  let x = 0;
  let speed = 40;
  let dir = 1;
  let width = run.offsetWidth;
  let stop: (() => void) | null = null;

  new ResizeObserver(() => (width = run.offsetWidth)).observe(run);

  const tick = (_t: number, dt: number) => {
    const v = scrollVelocity();
    if (Math.abs(v) > 0.5) dir = v > 0 ? 1 : -1;
    const target = 40 + Math.min(600, Math.abs(v) * 14);
    speed += (target - speed) * 0.08;
    x -= dir * speed * (dt / 1000);
    if (width > 0) {
      if (x <= -width) x += width;
      if (x > 0) x -= width;
    }
    track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
  };

  new IntersectionObserver((entries) => {
    const on = entries.some((e) => e.isIntersecting);
    if (on && !stop) stop = addTick(tick);
    if (!on && stop) {
      stop();
      stop = null;
    }
  }).observe(root);
}
