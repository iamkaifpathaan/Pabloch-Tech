import { html, type SafeHtml } from "../lib/html.ts";
import { services } from "../content/services.ts";
import { Picture, SectionHeading } from "./primitives.ts";
import { icons } from "./icons.ts";

/** The full services list (the Services page). The page header carries the big title. */
export function Services(index = "01"): SafeHtml {
  return html`<section class="services services--page" id="services" data-theme="paper" aria-labelledby="services-title">
    <div class="wrap">
      <header class="sec-head sec-head--compact">
        ${SectionHeading(index, "Services", "services-title")}
      </header>

      <ul class="svc-list" role="list" data-island="services" data-open="all">
        ${services.map(
          (s, i) => html`<li class="svc" id="svc-${s.id}" data-svc="${s.id}" data-reveal="fade" style="--delay:${i * 60}ms">
            <h3 class="svc-heading">
              <button class="svc-toggle" type="button" id="svc-${s.id}-btn" aria-expanded="true" aria-controls="svc-${s.id}-panel" data-svc-toggle>
                <span class="svc-num mono">0${i + 1}</span>
                <span class="svc-name">${s.name}</span>
                <span class="svc-price mono">${s.price}</span>
                <span class="svc-icon" aria-hidden="true">${icons.plus}</span>
              </button>
            </h3>
            <div class="svc-panel" id="svc-${s.id}-panel" role="region" aria-labelledby="svc-${s.id}-btn">
              <div class="svc-panel-inner">
                <p class="svc-line">${s.line}</p>
                <ul class="svc-includes" role="list">${s.includes.map((item) => html`<li>${item}</li>`)}</ul>
              </div>
            </div>
          </li>`,
        )}
      </ul>
    </div>
    <div class="svc-float" aria-hidden="true" data-svc-float>
      ${services.map((s) =>
        s.preview
          ? html`<div class="svc-float-item" data-svc-preview="${s.id}">${Picture(s.preview, { sizes: "340px" })}</div>`
          : "",
      )}
    </div>
  </section>`;
}
