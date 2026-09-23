/** Runtime preferences and tiny math helpers shared by every island. */

const mq = (query: string): MediaQueryList => window.matchMedia(query);

export const media = {
  reducedMotion: mq("(prefers-reduced-motion: reduce)"),
  finePointer: mq("(hover: hover) and (pointer: fine)"),
  desktop: mq("(min-width: 1024px)"),
};

/** True when the head script enabled the motion layer (JS on, no reduced-motion). */
export const motionEnabled = (): boolean => document.documentElement.classList.contains("js-motion");

export const clamp = (v: number, min = 0, max = 1): number => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const easeInOutCubic = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
export const easeOutBack = (t: number): number => {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/** Frame-rate independent smoothing factor for a lerp. */
export const damp = (lambda: number, dtMs: number): number => 1 - Math.exp((-lambda * dtMs) / 1000);

export function qs<T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T | null {
  return root.querySelector<T>(sel);
}
export function qsa<T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T[] {
  return Array.from(root.querySelectorAll<T>(sel));
}

/** Set a CSS custom property only when its value actually changes. */
export function setVar(el: HTMLElement, name: string, value: string, cache: Map<string, string>): void {
  if (cache.get(name) === value) return;
  cache.set(name, value);
  el.style.setProperty(name, value);
}
