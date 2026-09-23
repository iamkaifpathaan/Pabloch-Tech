import { html, type SafeHtml } from "../lib/html.ts";
import { revealWords, rich } from "../lib/rich.ts";
import { capabilities, manifestoCoda, manifestoLines, marqueeWords } from "../content/studio.ts";
import { SectionLabel } from "./primitives.ts";

export function Capabilities(): SafeHtml {
  const marqueeRun = html`${marqueeWords.map((w) => html`<span class="mq-word">${w}</span><span class="mq-sep" aria-hidden="true">/</span>`)}`;
  return html`<section class="caps" id="capabilities" data-theme="paper" aria-labelledby="caps-title">
    <div class="wrap">
      ${SectionLabel("06", "Capabilities")}
      <h2 class="caps-manifesto" id="caps-title" data-reveal="words">
        ${manifestoLines.map((line, i) => html`<span class="caps-line">${revealWords(line, i * 3)}</span> `)}
      </h2>
      <p class="caps-coda" data-reveal="fade">${rich(manifestoCoda)}</p>
    </div>

    <div class="marquee" data-island="marquee" aria-hidden="true">
      <div class="mq-track"><div class="mq-run">${marqueeRun}</div><div class="mq-run">${marqueeRun}</div></div>
    </div>

    <div class="wrap caps-grid">
      ${capabilities.map(
        (c, i) => html`<div class="caps-col" data-reveal="fade" style="--delay:${i * 90}ms">
          <h3 class="caps-group mono"><span>0${i + 1}</span> ${c.group}</h3>
          <ul role="list">${c.items.map((item) => html`<li>${item}</li>`)}</ul>
        </div>`,
      )}
    </div>
  </section>`;
}
