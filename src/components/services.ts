import { html, type SafeHtml } from "../lib/html.ts";
import { services } from "../content/services.ts";
import { Picture, RevealHeading, SectionLabel } from "./primitives.ts";
import { icons } from "./icons.ts";

export function Services(): SafeHtml {
  return html`<section class="services" id="services" data-theme="paper" aria-labelledby="services-title">
    <div class="wrap">
      <header class="sec-head">
        ${SectionLabel("03", "Services")}
        ${RevealHeading(2, ["What we ", { em: "build." }], { id: "services-title", className: "display-xl" })}
        <p class="sec-lede" data-reveal="fade">A short list, done properly. If what you need isn’t on it, we’ll tell you — and we won’t pretend otherwise to win the job.</p>
      </header>

      <ul class="svc-list" role="list" data-island="services">
        ${services.map(
          (s, i) => html`<li class="svc" data-svc="${s.id}" data-reveal="fade" style="--delay:${i * 60}ms">
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
