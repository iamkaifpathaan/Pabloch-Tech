import { html, type SafeHtml } from "../lib/html.ts";
import { facts, proof, proofIntro } from "../content/studio.ts";
import { ArrowLink, RevealHeading, SectionLabel } from "./primitives.ts";

export function Proof(): SafeHtml {
  return html`<section class="proof" id="proof" data-theme="paper" aria-labelledby="proof-title">
    <div class="wrap">
      <header class="sec-head proof-head">
        ${SectionLabel("08", "Proof")}
        ${RevealHeading(2, ["Don’t take our ", { em: "word for it." }], { id: "proof-title", className: "display-xl" })}
        <p class="sec-lede" data-reveal="fade">${proofIntro}</p>
      </header>

      <dl class="facts">
        ${facts.map(
          (f, i) => html`<div class="fact" data-reveal="fade" style="--delay:${i * 80}ms">
            <dt class="mono">${f.label}</dt>
            <dd class="fact-value">${f.value}</dd>
          </div>`,
        )}
      </dl>

      <ol class="proof-list" role="list">
        ${proof.map(
          (item, i) => html`<li class="proof-item" data-reveal="fade">
            <span class="proof-num mono" aria-hidden="true">0${i + 1}</span>
            <h3 class="proof-claim">${item.claim}</h3>
            <div class="proof-detail">
              <p>${item.detail}</p>
              ${item.links
                ? html`<ul class="proof-links" role="list">${item.links.map((l) => html`<li>${ArrowLink(l.label, l.href)}</li>`)}</ul>`
                : ""}
            </div>
          </li>`,
        )}
      </ol>
    </div>
  </section>`;
}
