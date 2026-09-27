import { html, type SafeHtml } from "../lib/html.ts";
import { rich } from "../lib/rich.ts";
import { legalPages, site, type LegalSlug } from "../content/site.ts";
import { legalDocs } from "../content/legal.ts";
import { Document } from "../components/document.ts";
import { Footer } from "../components/footer.ts";
import { Blocks, DocCta, DocHead, PageBar, Toc, formatDate } from "../components/longform.ts";

export function renderLegal(slug: LegalSlug): SafeHtml {
  const doc = legalDocs[slug];
  const url = `${site.url}${slug}/`;
  const crumbs = [
    { name: "Home", url: site.url },
    { name: "Legal", url },
    { name: doc.title, url },
  ];
  const others = legalPages.filter((l) => l.slug !== slug);

  const body = html`<a class="skip-link" href="#main">Skip to content</a>
${PageBar()}
<main id="main" tabindex="-1">
  <article class="doc" data-theme="paper" aria-labelledby="doc-title">
    ${DocHead({
      crumbs: crumbs.filter((_, i) => i !== 1),
      kicker: "Legal",
      title: doc.title,
      lede: rich(doc.lede),
      meta: html`Last updated <time datetime="${doc.updated}">${formatDate(doc.updated)}</time>`,
    })}
    <div class="wrap doc-grid">
      ${Toc(doc.blocks)}
      <div class="prose">${Blocks(doc.blocks)}</div>
    </div>
    <nav class="wrap doc-related" aria-label="Other legal pages">
      <p class="mono doc-related-title">Also read</p>
      <ul role="list">${others.map((l) => html`<li><a href="/${l.slug}/">${l.label}</a></li>`)}</ul>
    </nav>
  </article>
  ${DocCta()}
</main>
${Footer()}`;

  return Document({
    title: doc.metaTitle,
    description: doc.description,
    canonical: url,
    body,
    bodyClass: "page-doc",
    modified: doc.updated,
    crumbs: crumbs.filter((_, i) => i !== 1),
  });
}
