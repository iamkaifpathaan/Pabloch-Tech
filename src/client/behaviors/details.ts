import { site } from "../../content/site.ts";
import { qsa } from "../core/env.ts";

/** Live studio clock (India Standard Time) in the hero, menu and About. */
export function initClock(): void {
  const els = qsa("[data-clock]");
  if (!els.length) return;
  let hm: Intl.DateTimeFormat;
  let spoken: Intl.DateTimeFormat;
  try {
    hm = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: site.studio.timeZone });
    spoken = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: site.studio.timeZone });
  } catch {
    return; // very old engine without time-zone support: keep the static label
  }
  const render = () => {
    const now = new Date();
    for (const el of els) {
      const mode = el.dataset.clock;
      if (mode === "big") el.textContent = spoken.format(now).replace(/\s?(AM|PM)$/i, (m) => ` ${m.trim().toLowerCase()}`);
      else el.textContent = `${site.studio.timeZoneLabel} ${hm.format(now)}`;
    }
  };
  render();
  const schedule = () => window.setTimeout(() => {
    render();
    schedule();
  }, 60_000 - (Date.now() % 60_000) + 50);
  schedule();
}

export function initYear(): void {
  const year = String(new Date().getFullYear());
  qsa("[data-year]").forEach((el) => (el.textContent = year));
}

/**
 * Press G (or use the footer button) to lay the 12-column grid over the page —
 * the Pabloch Grid made literal. Ignored while typing.
 */
export function initGridOverlay(): void {
  let overlay: HTMLElement | null = null;
  const buttons = qsa<HTMLButtonElement>("[data-grid-toggle]");

  const build = (): HTMLElement => {
    const root = document.createElement("div");
    root.className = "grid-overlay";
    root.setAttribute("aria-hidden", "true");
    const wrap = document.createElement("div");
    wrap.className = "wrap";
    for (let i = 0; i < 12; i++) {
      const col = document.createElement("div");
      col.className = "col";
      wrap.append(col);
    }
    const legend = document.createElement("p");
    legend.className = "grid-legend mono";
    legend.textContent = "12 columns · press G to hide";
    root.append(wrap, legend);
    document.body.append(root);
    return root;
  };

  const toggle = () => {
    overlay ??= build();
    const on = document.documentElement.classList.toggle("show-grid");
    for (const b of buttons) {
      b.setAttribute("aria-pressed", String(on));
      const text = b.lastChild;
      if (text && text.nodeType === Node.TEXT_NODE) text.textContent = on ? " Hide the grid" : " Show the grid";
    }
  };

  buttons.forEach((b) => b.addEventListener("click", toggle));
  document.addEventListener("keydown", (e) => {
    if (e.key !== "g" && e.key !== "G") return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    toggle();
  });
}
