import { html, type SafeHtml } from "../lib/html.ts";
import { facts, proof, proofIntro } from "../content/studio.ts";
import type { ProofItem } from "../lib/types.ts";
import { ArrowLink, RevealHeading, SectionHeading, SectionLabel } from "./primitives.ts";

function ProofList(items: readonly ProofItem[], start = 0): SafeHtml {
  return html`<ol class="proof-list" role="list">
    ${items.map(
      (item, i) => html`<li class="proof-item" data-reveal="fade">
        <span class="proof-num mono" aria-hidden="true">0${start + i + 1}</span>
        <h3 class="proof-claim">${item.claim}</h3>
        <div class="proof-detail">
          <p>${item.detail}</p>
          ${item.links ? html`<ul class="proof-links" role="list">${item.links.map((l) => html`<li>${ArrowLink(l.label, l.href)}</li>`)}</ul>` : ""}
        </div>
      </li>`,
    )}
  </ol>`;
}

export function Facts(): SafeHtml {
  return html`<dl class="facts">
    ${facts.map(
      (f, i) => html`<div class="fact" data-reveal="fade" style="--delay:${i * 80}ms">
        <dt class="mono">${f.label}</dt>
        <dd class="fact-value">${f.value}</dd>
      </div>`,
    )}
  </dl>`;
}

/** Studio page: the facts and the work you can check for yourself. */
export function Proof(index = "02"): SafeHtml {
  return html`<section class="proof" id="proof" data-theme="paper" aria-labelledby="proof-title">
    <div class="wrap">
      <header class="sec-head proof-head">
        ${SectionLabel(index, "Proof")}
        ${RevealHeading(2, ["Don’t take our ", { em: "word for it." }], { id: "proof-title", className: "display-xl" })}
        <p class="sec-lede" data-reveal="fade">${proofIntro}</p>
      </header>
      ${Facts()}
      ${ProofList(proof.slice(0, 2))}
    </div>
  </section>`;
}

/** Services page: how pricing and payment work, in the site's own words. */
export function Terms(index = "03"): SafeHtml {
  const items = proof.slice(2);
  return html`<section class="terms" id="pricing" data-theme="ink" aria-labelledby="pricing-title">
    <div class="wrap">
      <header class="sec-head sec-head--compact">
        ${SectionHeading(index, "Pricing & terms", "pricing-title")}
      </header>
      <ol class="terms-grid" role="list">
        ${items.map(
          (item, i) => html`<li class="term" data-reveal="fade" style="--delay:${i * 90}ms">
            <span class="term-num mono" aria-hidden="true">0${i + 1}</span>
            <h3 class="term-claim">${item.claim}</h3>
            <p class="term-detail">${item.detail}</p>
          </li>`,
        )}
      </ol>
    </div>
  </section>`;
}
