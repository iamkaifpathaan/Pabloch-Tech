import { html, type SafeHtml } from "../lib/html.ts";
import { rich, plainText } from "../lib/rich.ts";
import { pages } from "../content/site.ts";
import type { Block, LongformDoc } from "../lib/types.ts";
import type { Crumb } from "./document.ts";
import { Brand } from "./nav.ts";
import { icons } from "./icons.ts";

/** "2026-09-27" → "27 September 2026". Fixed locale and zone so builds are reproducible. */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso}T00:00:00Z`),
  );
}

export function wordsIn(blocks: readonly Block[]): number {
  let text = "";
  for (const b of blocks) {
    if ("p" in b) text += ` ${plainText(b.p)}`;
    else if ("note" in b) text += ` ${plainText(b.note)}`;
    else if ("ul" in b) text += ` ${b.ul.map(plainText).join(" ")}`;
    else if ("ol" in b) text += ` ${b.ol.map(plainText).join(" ")}`;
    else if ("h2" in b) text += ` ${b.h2}`;
    else text += ` ${b.h3}`;
  }
  return text.trim().split(/\s+/).length;
}

export const readingMinutes = (doc: LongformDoc): number => Math.max(1, Math.round(wordsIn(doc.blocks) / 220));

/** Slim bar for inner pages: logo home, two links, and the one call to action. */
export function PageBar(): SafeHtml {
  return html`<header class="doc-bar" data-theme="ink">
    <div class="wrap doc-bar-inner">
      ${Brand("/")}
      <nav class="doc-bar-links" aria-label="Primary">
        <ul role="list">
          <li><a href="/#work">Work</a></li>
          <li><a href="/#services">Services</a></li>
          <li><a href="/${pages.blog.path}">${pages.blog.label}</a></li>
        </ul>
      </nav>
      <a class="btn btn--primary btn--sm" href="/#contact"><span class="btn-label">Start a project</span></a>
    </div>
  </header>`;
}

export function Breadcrumbs(crumbs: readonly Crumb[]): SafeHtml {
  return html`<nav class="crumbs mono" aria-label="Breadcrumb">
    <ol role="list">
      ${crumbs.map((c, i) =>
        i === crumbs.length - 1
          ? html`<li><span aria-current="page">${c.name}</span></li>`
          : html`<li><a href="${c.url.replace(/^https:\/\/[^/]+/, "")}">${c.name}</a></li>`,
      )}
    </ol>
  </nav>`;
}

export function Blocks(blocks: readonly Block[]): SafeHtml {
  return html`${blocks.map((b) => {
    if ("h2" in b) return html`<h2 id="${b.id}">${b.h2}</h2>`;
    if ("h3" in b) return html`<h3>${b.h3}</h3>`;
    if ("p" in b) return html`<p>${rich(b.p)}</p>`;
    if ("note" in b) return html`<p class="prose-note">${rich(b.note)}</p>`;
    if ("ul" in b) return html`<ul>${b.ul.map((li) => html`<li>${rich(li)}</li>`)}</ul>`;
    return html`<ol>${b.ol.map((li) => html`<li>${rich(li)}</li>`)}</ol>`;
  })}`;
}

export function Toc(blocks: readonly Block[]): SafeHtml {
  const heads = blocks.filter((b): b is { h2: string; id: string } => "h2" in b);
  if (heads.length < 3) return html``;
  return html`<nav class="doc-toc" aria-label="On this page">
    <p class="mono doc-toc-title">On this page</p>
    <ol role="list">${heads.map((h) => html`<li><a href="#${h.id}">${h.h2}</a></li>`)}</ol>
  </nav>`;
}

interface DocHeadOptions {
  crumbs: readonly Crumb[];
  kicker: string;
  title: string;
  lede: SafeHtml;
  meta: SafeHtml;
}

export function DocHead(o: DocHeadOptions): SafeHtml {
  return html`<header class="wrap doc-head">
    ${Breadcrumbs(o.crumbs)}
    <p class="sec-label mono"><span class="sec-index">(${o.kicker})</span></p>
    <h1 class="display-l doc-title">${o.title}</h1>
    <p class="doc-lede">${o.lede}</p>
    <p class="mono doc-meta">${o.meta}</p>
  </header>`;
}

/** Closing call to action shared by every long-form page. */
export function DocCta(): SafeHtml {
  return html`<aside class="doc-cta" data-theme="ink" aria-label="Start a project">
    <div class="wrap doc-cta-inner">
      <p class="display-l doc-cta-title">See it <em>before</em> you pay for it.</p>
      <p class="doc-cta-copy">Send a few lines about your business. You’ll get a reply within 24 hours — and if it’s a fit, a free working draft.</p>
      <a class="btn btn--primary btn--md" href="/#contact"><span class="btn-label">Start a project</span><span class="btn-icon">${icons.arrowRight}</span></a>
    </div>
  </aside>`;
}

