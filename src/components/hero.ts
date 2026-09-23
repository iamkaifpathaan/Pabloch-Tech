import { html, type SafeHtml } from "../lib/html.ts";
import { revealWords, wordCount } from "../lib/rich.ts";
import type { Rich } from "../lib/types.ts";
import { site } from "../content/site.ts";
import { ArrowLink, PrimaryButton } from "./primitives.ts";

const titleLines: readonly Rich[] = [
  "Digital products,",
  ["crafted ", { em: "line" }],
  [{ em: "by line." }],
];

export function Hero(): SafeHtml {
  let wordIndex = 0;
  const lines = titleLines.map((line) => {
    const out = html`<span class="hero-line">${revealWords(line, wordIndex)}</span> `;
    wordIndex += wordCount(line);
    return out;
  });

  return html`<section class="hero" id="top" data-theme="ink" aria-labelledby="hero-title" data-island="grid-field">
    <canvas class="hero-canvas" aria-hidden="true"></canvas>
    <div class="hero-draft-slot" aria-hidden="true" data-draft-slot></div>
    <div class="wrap hero-inner">
      <div class="hero-meta mono hero-in" style="--delay:700ms">
        <span>${site.positioning}</span>
        <span class="hero-meta-mid">Based in ${site.studio.base} · US &amp; UK hours</span>
        <span class="hero-meta-clock"><span class="live-dot" aria-hidden="true"></span><span data-clock="long">${site.studio.timeZoneLabel}</span></span>
      </div>
      <div class="hero-main">
      <h1 class="hero-title" id="hero-title">${lines}</h1>
      <div class="hero-foot">
        <p class="hero-lede hero-in" style="--delay:560ms">
          An independent studio designing and hand-building websites, online stores and the product features behind them.
          <span class="hero-lede-em">You see a working draft before you pay a thing.</span>
        </p>
        <div class="hero-ctas hero-in" style="--delay:680ms">
          ${PrimaryButton("Start a project", "#contact", { size: "lg", cursor: "Let’s talk" })}
          ${ArrowLink("View our work", "#work", { className: "arrow-link--lg" })}
        </div>
      </div>
      </div>
      <div class="hero-base mono hero-in" style="--delay:820ms">
        <p class="hero-status"><span class="live-dot" aria-hidden="true"></span>Currently taking on new projects</p>
        <p class="hero-fig" aria-hidden="true"><span>Fig. 01</span> The Pabloch Grid — every draft starts here. <span class="hero-fig-hint">Move your cursor.</span></p>
      </div>
    </div>
  </section>`;
}
