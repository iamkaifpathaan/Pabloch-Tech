import { html, type SafeHtml } from "../lib/html.ts";
import { site } from "../content/site.ts";
import { RevealHeading, SectionLabel } from "./primitives.ts";
import { icons } from "./icons.ts";

export function FinalCta(): SafeHtml {
  return html`<section class="cta" data-theme="ink" aria-labelledby="cta-title">
    <div class="cta-grid" aria-hidden="true"></div>
    <div class="wrap cta-inner">
      ${SectionLabel("10", "Next")}
      ${RevealHeading(2, ["Have something ", { em: "in mind?" }], { id: "cta-title", className: "display-xxl cta-title" })}
      <div class="cta-row">
        <p class="cta-copy" data-reveal="fade">Send a few lines. You’ll get a real answer within 24 hours — and if it’s a fit, a working draft before you pay a thing.</p>
        <a class="cta-orb" href="#contact" data-magnetic data-cursor="Let’s go">
          <span class="cta-orb-label">Start a<br>project</span>
          <span class="cta-orb-icon">${icons.arrowRight}</span>
        </a>
      </div>
      <p class="cta-alt mono" data-reveal="fade">Or email <a href="mailto:${site.email}" data-email-link><span data-email-text>${site.email}</span></a></p>
    </div>
  </section>`;
}
