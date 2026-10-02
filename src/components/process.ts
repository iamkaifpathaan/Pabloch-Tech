import { html, type SafeHtml } from "../lib/html.ts";
import { process, processIntro } from "../content/process.ts";
import { SectionHeading } from "./primitives.ts";

export function Process(index = "01"): SafeHtml {
  const count = String(process.length).padStart(2, "0");
  return html`<section class="process process--page" id="steps" data-theme="paper" aria-labelledby="process-title">
    <div class="wrap">
      <header class="process-head">
        ${SectionHeading(index, "Five steps", "process-title")}
      </header>

      <div class="process-grid">
        <div class="process-aside">
          <p class="sec-lede" data-reveal="fade">${processIntro}</p>
          <p class="process-now mono" aria-hidden="true"><span data-process-now>01</span>/${count}</p>
        </div>

        <div class="process-rail" data-island="process-line">
          <div class="process-line" aria-hidden="true"><span class="process-line-fill"></span></div>
          <ol class="process-steps" role="list">
            ${process.map(
              (step, i) => html`<li class="step" data-step="${i + 1}">
                <span class="step-dot" aria-hidden="true"></span>
                <p class="step-num mono" aria-hidden="true">0${i + 1}</p>
                <div class="step-body">
                  <h3 class="step-name">${step.name}</h3>
                  <p class="step-when mono">${step.when}</p>
                  <p class="step-text">${step.body}</p>
                  <p class="step-outcome"><span class="mono">You get</span><span>${step.outcome}</span></p>
                </div>
              </li>`,
            )}
          </ol>
        </div>
      </div>
    </div>
  </section>`;
}
