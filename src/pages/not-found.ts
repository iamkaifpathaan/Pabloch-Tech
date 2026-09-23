import { html, type SafeHtml } from "../lib/html.ts";
import { site } from "../content/site.ts";
import { Document } from "../components/document.ts";
import { Brand } from "../components/nav.ts";
import { PrimaryButton, ArrowLink } from "../components/primitives.ts";

export function renderNotFound(): SafeHtml {
  const body = html`<main class="nf" id="main">
    <div class="nf-grid" aria-hidden="true"></div>
    <div class="wrap nf-inner">
      <div class="nf-brand">${Brand()}</div>
      <p class="mono nf-code">Error 404 — x 404 · y 404</p>
      <h1 class="display-xxl nf-title">Off the <em>grid.</em></h1>
      <p class="nf-copy">This page doesn’t exist — or it moved when the studio did. Everything worth seeing is one click away.</p>
      <div class="nf-actions">
        ${PrimaryButton("Back to the studio", "/")}
        ${ArrowLink("Start a project", "/#contact")}
      </div>
    </div>
  </main>`;
  return Document({
    title: `Page not found — ${site.name}`,
    description: site.description,
    canonical: `${site.url}404.html`,
    body,
    bodyClass: "page-404",
    noindex: true,
  });
}
