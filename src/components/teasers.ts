/**
 * Home-page summaries of the inner pages. Each one shows enough to be useful
 * on its own, and links to the page that has the rest — no copy here that
 * isn't already on the site.
 */
import { html, type SafeHtml } from "../lib/html.ts";
import { href, to } from "../lib/routes.ts";
import { services } from "../content/services.ts";
import { process, processIntro } from "../content/process.ts";
import { proofIntro } from "../content/studio.ts";
import { ArrowLink, Picture, RevealHeading, SectionLabel } from "./primitives.ts";
import { Facts } from "./proof.ts";
import { icons } from "./icons.ts";

/* ------------------------------------------------------------------ */
/*  Services — one row per service, straight to its full entry          */
/* ------------------------------------------------------------------ */

export function ServicesIndex(index = "03"): SafeHtml {
  return html`<section class="sx" id="what-we-build" data-theme="paper" aria-labelledby="sx-title">
    <div class="wrap">
      <header class="sec-head sx-head">
        ${SectionLabel(index, "Services")}
        ${RevealHeading(2, ["What we ", { em: "build." }], { id: "sx-title", className: "display-xl" })}
        <p class="sec-lede" data-reveal="fade">A short list, done properly. If what you need isn’t on it, we’ll tell you — and we won’t pretend otherwise to win the job.</p>
      </header>
      <ol class="sx-list" role="list">
        ${services.map(
          (s, i) => html`<li class="sx-item" data-reveal="fade" style="--delay:${i * 60}ms">
            <a class="sx-row" href="${href(to("services", `svc-${s.id}`))}">
              <span class="sx-num mono">0${i + 1}</span>
              <span class="sx-name">${s.name}</span>
              <span class="sx-line">${s.line}</span>
              <span class="sx-price mono">${s.price}</span>
              <span class="sx-arrow" aria-hidden="true">${icons.arrowRight}</span>
              ${s.preview ? html`<span class="sx-thumb" aria-hidden="true">${Picture(s.preview, { sizes: "260px" })}</span>` : ""}
            </a>
          </li>`,
        )}
      </ol>
      <div class="sx-foot" data-reveal="fade">${ArrowLink("Services, capabilities & pricing", to("services"), { className: "arrow-link--lg" })}</div>
    </div>
  </section>`;
}

/* ------------------------------------------------------------------ */
/*  Process — the five steps at a glance                                */
/* ------------------------------------------------------------------ */

export function ProcessStrip(index = "04"): SafeHtml {
  return html`<section class="pstrip" id="how-it-works" data-theme="ink" aria-labelledby="pstrip-title">
    <div class="wrap">
      <header class="pstrip-head">
        ${SectionLabel(index, "Process")}
        <div class="pstrip-head-row">
          ${RevealHeading(2, ["From idea ", { em: "to impact." }], { id: "pstrip-title", className: "display-l" })}
          <p class="pstrip-lede" data-reveal="fade">${processIntro}</p>
        </div>
      </header>
      <ol class="pstrip-steps" role="list">
        ${process.map(
          (step, i) => html`<li class="pstrip-step${step.id === "design" ? " is-free" : ""}" data-reveal="fade" style="--delay:${i * 90}ms">
            <span class="pstrip-dot" aria-hidden="true"></span>
            <span class="pstrip-num mono">0${i + 1}</span>
            <h3 class="pstrip-name">${step.name}</h3>
            <p class="pstrip-when mono">${step.when}</p>
            <p class="pstrip-out">${step.outcome}</p>
          </li>`,
        )}
      </ol>
      <div class="pstrip-foot" data-reveal="fade">${ArrowLink("How a project runs, step by step", to("process"), { className: "arrow-link--lg" })}</div>
    </div>
  </section>`;
}

/* ------------------------------------------------------------------ */
/*  Proof — the numbers, and where to check them                        */
/* ------------------------------------------------------------------ */

export function FactsBand(index = "05"): SafeHtml {
  return html`<section class="proof proof--home" id="by-the-numbers" data-theme="paper" aria-labelledby="facts-title">
    <div class="wrap">
      <header class="sec-head proof-head">
        ${SectionLabel(index, "Proof")}
        ${RevealHeading(2, ["Don’t take our ", { em: "word for it." }], { id: "facts-title", className: "display-xl" })}
        <p class="sec-lede" data-reveal="fade">${proofIntro}</p>
      </header>
      ${Facts()}
      <div class="facts-foot" data-reveal="fade">${ArrowLink("What you can check for yourself", to("studio", "proof"), { className: "arrow-link--lg" })}</div>
    </div>
  </section>`;
}
