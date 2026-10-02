import { html, type SafeHtml } from "../lib/html.ts";
import { rich } from "../lib/rich.ts";
import { faq, faqIntro } from "../content/faq.ts";
import { RevealHeading, SectionLabel } from "./primitives.ts";
import { icons } from "./icons.ts";

/**
 * Native <details> rows: open and close with no JavaScript, and every answer
 * is in the HTML for search engines and assistive tech even while closed.
 * The first question starts open so the section never reads as a wall of rows.
 */
export function Faq(index = "10"): SafeHtml {
  return html`<section class="faq" id="faq" data-theme="paper" aria-labelledby="faq-title">
    <div class="wrap">
      <header class="sec-head faq-head">
        ${SectionLabel(index, "FAQ")}
        ${RevealHeading(2, ["Questions, ", { em: "answered." }], { id: "faq-title", className: "display-xl" })}
        <p class="sec-lede" data-reveal="fade">${faqIntro}</p>
      </header>
      <div class="faq-list">
        ${faq.map(
          (item, i) => html`<details class="faq-item" id="faq-${item.id}" data-reveal="fade" style="--delay:${Math.min(i, 6) * 50}ms"${i === 0 ? html` open` : ""}>
            <summary class="faq-q">
              <span class="faq-num mono">${String(i + 1).padStart(2, "0")}</span>
              <span class="faq-q-text">${item.q}</span>
              <span class="faq-icon" aria-hidden="true">${icons.plus}</span>
            </summary>
            <div class="faq-a"><p>${rich(item.a)}</p></div>
          </details>`,
        )}
      </div>
    </div>
  </section>`;
}
