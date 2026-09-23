import { html, type SafeHtml } from "../lib/html.ts";
import { rich } from "../lib/rich.ts";
import { principles } from "../content/studio.ts";
import { RevealHeading, SectionLabel } from "./primitives.ts";

export function Why(): SafeHtml {
  const count = String(principles.length).padStart(2, "0");
  return html`<section class="why" id="why" data-theme="ink" aria-labelledby="why-title">
    <div class="why-track" data-island="h-scroll">
      <div class="why-stage">
        <div class="wrap why-head">
          ${SectionLabel("05", "Why Pabloch")}
          <div class="why-head-row">
            ${RevealHeading(2, ["Four things we ", { em: "do differently." }], { id: "why-title", className: "display-l why-title" })}
            <p class="why-count mono" aria-hidden="true"><span data-hs-now>01</span> / ${count}</p>
          </div>
        </div>
        <ol class="why-rail" role="list" data-hs-rail>
          ${principles.map(
            (p, i) => html`<li class="why-panel" data-reveal="fade" style="--delay:${i * 80}ms">
              <p class="why-num" aria-hidden="true">0${i + 1}</p>
              <h3 class="why-panel-title">${rich(p.title)}</h3>
              <p class="why-panel-body">${p.body}</p>
            </li>`,
          )}
        </ol>
        <div class="why-progress" aria-hidden="true"><span data-hs-bar></span></div>
      </div>
    </div>
  </section>`;
}
