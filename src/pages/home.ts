import { html, type SafeHtml } from "../lib/html.ts";
import { site } from "../content/site.ts";
import { Document } from "../components/document.ts";
import { MobileMenu, Nav } from "../components/nav.ts";
import { Hero } from "../components/hero.ts";
import { Intro } from "../components/intro.ts";
import { Work } from "../components/work.ts";
import { Services } from "../components/services.ts";
import { Process } from "../components/process.ts";
import { Why } from "../components/why.ts";
import { Capabilities } from "../components/capabilities.ts";
import { CaseStudy } from "../components/case-study.ts";
import { Proof } from "../components/proof.ts";
import { About } from "../components/about.ts";
import { FinalCta } from "../components/cta.ts";
import { Contact } from "../components/contact.ts";
import { Footer } from "../components/footer.ts";

export function renderHome(): SafeHtml {
  const body = html`<a class="skip-link" href="#main">Skip to content</a>
${Nav()}
${MobileMenu()}
<main id="main" tabindex="-1">
${Hero()}
${Intro()}
${Work()}
${Services()}
${Process()}
${Why()}
${Capabilities()}
${CaseStudy()}
${Proof()}
${About()}
${FinalCta()}
${Contact()}
</main>
${Footer()}`;

  return Document({
    title: site.title,
    description: site.description,
    canonical: site.url,
    body,
    structured: true,
  });
}
