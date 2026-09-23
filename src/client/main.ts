/**
 * Client entry. The page is complete without this file; everything here is
 * enhancement. Islands are mounted by their data-island attribute, so markup
 * decides what runs — there is no framework and no hydration.
 */
import { applyConfig, readConfig } from "./config.ts";
import { initReveal } from "./behaviors/reveal.ts";
import { initParallax, initRise } from "./behaviors/parallax.ts";
import { initCursor, initMagnetic } from "./behaviors/pointer.ts";
import { initClock, initGridOverlay, initYear } from "./behaviors/details.ts";
import { mountNav } from "./islands/nav.ts";
import { mountGridField } from "./islands/grid-field.ts";
import { mountServices } from "./islands/services.ts";
import { mountBriefForm } from "./islands/brief-form.ts";
import { mountHorizontal, mountMarquee, mountProcessLine, mountScrubText, mountWorkFeature } from "./islands/scroll-islands.ts";

type Island = (el: HTMLElement) => void;

const islands: Record<string, Island> = {
  nav: mountNav,
  "grid-field": mountGridField,
  "scrub-text": mountScrubText,
  "work-feature": mountWorkFeature,
  services: mountServices,
  "process-line": mountProcessLine,
  "h-scroll": mountHorizontal,
  marquee: mountMarquee,
  "brief-form": mountBriefForm,
};

function safely(label: string, fn: () => void): void {
  try {
    fn();
  } catch (err) {
    // One broken enhancement must never take the rest of the page with it.
    console.error(`[pabloch] ${label} failed`, err);
  }
}

function boot(): void {
  safely("config", () => applyConfig(readConfig()));

  document.querySelectorAll<HTMLElement>("[data-island]").forEach((el) => {
    const name = el.dataset.island ?? "";
    const mount = islands[name];
    if (mount) safely(`island:${name}`, () => mount(el));
  });

  safely("reveal", initReveal);
  safely("parallax", initParallax);
  safely("rise", initRise);
  safely("cursor", initCursor);
  safely("magnetic", initMagnetic);
  safely("clock", initClock);
  safely("year", initYear);
  safely("grid-overlay", initGridOverlay);

  window.__ptReady = true;
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
else boot();
