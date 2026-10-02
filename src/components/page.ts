import { html, type SafeHtml } from "../lib/html.ts";
import { revealWords, rich } from "../lib/rich.ts";
import type { Rich } from "../lib/types.ts";
import { absoluteUrl, href, routes, to, type PageId } from "../lib/routes.ts";
import { site } from "../content/site.ts";
import { Document, type Json } from "./document.ts";
import { MobileMenu, Nav } from "./nav.ts";
import { Footer } from "./footer.ts";
import { icons } from "./icons.ts";

/* ------------------------------------------------------------------ */
/*  The shell every page shares                                        */
/* ------------------------------------------------------------------ */

interface PageOptions {
  id: PageId;
  title: string;
  description: string;
  body: SafeHtml;
  /** schema.org type of the page node, e.g. "AboutPage", "ContactPage". */
  pageType?: string;
  /** Extra structured-data nodes for this page. */
  schema?: readonly Json[];
}

/** Breadcrumb trail for a page: Home › (Work ›) Page. */
function trail(id: PageId): { id: PageId; label: string }[] {
  if (id === "home") return [];
  const out: { id: PageId; label: string }[] = [{ id: "home", label: "Pabloch Tech" }];
  if (id === "case-study") out.push({ id: "work", label: routes.work.label });
  out.push({ id, label: routes[id].label });
  return out;
}

export function Page(o: PageOptions): SafeHtml {
  const body = html`<a class="skip-link" href="#main">Skip to content</a>
${Nav(o.id)}
${MobileMenu(o.id)}
<main id="main" tabindex="-1" data-page="${o.id}">
${o.body}
</main>
${Footer()}`;
  const crumbs = trail(o.id).map((c) => ({ name: c.label, url: absoluteUrl(site.url, c.id) }));
  return Document({
    title: o.title,
    description: o.description,
    canonical: absoluteUrl(site.url, o.id),
    body,
    bodyClass: `page-${o.id}`,
    ...(o.pageType ? { pageType: o.pageType } : {}),
    ...(o.schema ? { schema: o.schema } : {}),
    ...(crumbs.length ? { crumbs } : {}),
  });
}

/* ------------------------------------------------------------------ */
/*  Page header — the opening of every inner page                      */
/* ------------------------------------------------------------------ */

interface PageHeaderOptions {
  id: PageId;
  /** Big headline (the page's h1). */
  title: Rich;
  lede: Rich;
  /** Small facts shown beside the lede. */
  meta?: readonly { label: string; value: string }[];
  /** "On this page" jump links. */
  toc?: readonly { id: string; label: string }[];
}

export function PageHeader(o: PageHeaderOptions): SafeHtml {
  const crumbs = trail(o.id);
  return html`<header class="ph" data-theme="ink" aria-labelledby="page-title">
    <div class="ph-grid" aria-hidden="true"></div>
    <div class="wrap ph-inner">
      <nav class="ph-crumbs mono" aria-label="Breadcrumb" data-reveal="fade" data-reveal-now>
        <ol role="list">
          ${crumbs.map((c, i) =>
            i === crumbs.length - 1
              ? html`<li><span aria-current="page">${c.label}</span></li>`
              : html`<li><a href="${href(to(c.id))}">${c.label}</a><span class="ph-sep" aria-hidden="true">/</span></li>`,
          )}
        </ol>
      </nav>
      <h1 class="ph-title" id="page-title" data-reveal="words" data-reveal-now>${revealWords(o.title)}</h1>
      <div class="ph-foot">
        <p class="ph-lede" data-reveal="fade" data-reveal-now style="--delay:260ms">${rich(o.lede)}</p>
        ${o.meta?.length
          ? html`<dl class="ph-meta" data-reveal="fade" data-reveal-now style="--delay:360ms">
              ${o.meta.map((m) => html`<div class="ph-meta-row"><dt class="mono">${m.label}</dt><dd>${m.value}</dd></div>`)}
            </dl>`
          : ""}
      </div>
      ${o.toc?.length
        ? html`<nav class="ph-toc" aria-label="On this page" data-reveal="fade" data-reveal-now style="--delay:440ms">
            <p class="mono ph-toc-label">On this page</p>
            <ol role="list">
              ${o.toc.map(
                (t, i) => html`<li><a href="#${t.id}"><span class="mono">${String(i + 1).padStart(2, "0")}</span><span>${t.label}</span>${icons.arrowDown}</a></li>`,
              )}
            </ol>
          </nav>`
        : ""}
    </div>
  </header>`;
}

/* ------------------------------------------------------------------ */
/*  Next page — a single, large way forward at the end of a page        */
/* ------------------------------------------------------------------ */

interface PageNextOptions {
  to: PageId;
  title: Rich;
  note: string;
  kicker?: string;
}

export function PageNext(o: PageNextOptions): SafeHtml {
  return html`<nav class="pn" data-theme="ink" aria-label="Next page">
    <a class="pn-link" href="${href(to(o.to))}" data-cursor="Next →">
      <span class="wrap pn-inner">
        <span class="pn-kicker mono"><span class="pn-dot" aria-hidden="true"></span>${o.kicker ?? "Next"} — ${routes[o.to].label}</span>
        <span class="pn-title">${rich(o.title)}</span>
        <span class="pn-row">
          <span class="pn-note">${o.note}</span>
          <span class="pn-arrow" aria-hidden="true">${icons.arrowRight}</span>
        </span>
      </span>
      <span class="pn-fill" aria-hidden="true"></span>
    </a>
  </nav>`;
}
