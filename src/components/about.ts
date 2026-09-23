import { html, type SafeHtml } from "../lib/html.ts";
import { about } from "../content/studio.ts";
import { site } from "../content/site.ts";
import { ContentSlot, RevealHeading, SectionLabel } from "./primitives.ts";

export function About(): SafeHtml {
  return html`<section class="about" id="studio" data-theme="paper" aria-labelledby="about-title">
    <div class="wrap about-grid">
      <div class="about-main">
        ${SectionLabel("09", "Studio")}
        ${RevealHeading(2, about.title, { id: "about-title", className: "display-xl" })}
        ${about.paragraphs.map((p, i) => html`<p class="about-p" data-reveal="fade" style="--delay:${i * 100}ms">${p}</p>`)}
        ${ContentSlot("Founder name & portrait", about.founder, (v) => html`<p class="about-p">${v}</p>`)}
      </div>
      <aside class="about-side" aria-label="Studio details">
        <div class="about-clock" data-reveal="fade">
          <p class="mono">Right now at the studio</p>
          <p class="about-time"><span data-clock="big">${site.studio.timeZoneLabel}</span></p>
          <p class="mono about-zone">${site.studio.base} · ${site.studio.timeZoneLabel} (UTC+5:30)</p>
        </div>
        <dl class="about-details">
          ${about.details.map(
            (d, i) => html`<div class="about-row" data-reveal="fade" style="--delay:${i * 60}ms"><dt class="mono">${d.label}</dt><dd>${d.value}</dd></div>`,
          )}
        </dl>
      </aside>
    </div>
  </section>`;
}
