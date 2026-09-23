/**
 * Scroll scenes. Each scene measures its geometry on resize/layout change
 * (the only place layout is read) and updates from cached numbers on scroll,
 * so scrolling never forces a reflow. All scenes update in one rAF.
 */
export interface Scene {
  /** Read layout (getBoundingClientRect etc). Called on load, resize and layout change. */
  measure(vw: number, vh: number): void;
  /** Write styles from cached geometry. Called at most once per frame while scrolling. */
  update(scrollY: number, vh: number, velocity: number): void;
}

const scenes = new Set<Scene>();
let scheduled = false;
let needsMeasure = true;
let vw = window.innerWidth;
let vh = window.innerHeight;
let lastY = window.scrollY;
let velocity = 0;
let lastScrollAt = 0;

function run(): void {
  scheduled = false;
  if (needsMeasure) {
    needsMeasure = false;
    vw = window.innerWidth;
    vh = window.innerHeight;
    scenes.forEach((s) => s.measure(vw, vh));
  }
  const y = window.scrollY;
  velocity = y - lastY;
  lastY = y;
  lastScrollAt = performance.now();
  scenes.forEach((s) => s.update(y, vh, velocity));
}

function schedule(): void {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(run);
}

export function remeasure(): void {
  needsMeasure = true;
  schedule();
}

export function addScene(scene: Scene): () => void {
  scenes.add(scene);
  remeasure();
  return () => {
    scenes.delete(scene);
  };
}

/** Latest scroll velocity in px/frame (signed). Used by the marquee. */
export const scrollVelocity = (): number => (performance.now() - lastScrollAt > 120 ? 0 : velocity);

window.addEventListener("scroll", schedule, { passive: true });
window.addEventListener("resize", remeasure, { passive: true });
window.addEventListener("load", remeasure);
if ("fonts" in document) void document.fonts.ready.then(remeasure);

// Any change in page height (fonts, images, accordions) shifts every scene below it.
let lastHeight = 0;
new ResizeObserver(() => {
  const h = document.body.scrollHeight;
  if (Math.abs(h - lastHeight) > 1) {
    lastHeight = h;
    remeasure();
  }
}).observe(document.body);

/** Page-space top of an element, independent of current transforms on it. */
export function pageTop(el: Element): number {
  return el.getBoundingClientRect().top + window.scrollY;
}
