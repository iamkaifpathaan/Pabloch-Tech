import { html, type SafeHtml } from "../lib/html.ts";
import { rich } from "../lib/rich.ts";
import type { Project } from "../lib/types.ts";
import { featured, previews, workIntro } from "../content/work.ts";
import { ArrowLink, Picture, RevealHeading, SectionLabel } from "./primitives.ts";
import { icons } from "./icons.ts";

const total = String(previews.length + 1).padStart(2, "0");

function Features(features: readonly string[]): SafeHtml {
  return html`<ul class="features mono" role="list">${features.map((f) => html`<li>${f}</li>`)}</ul>`;
}

/* ------------------------------------------------------------------ */
/*  01 — the pinned "wow" moment: the live store expands to fill the   */
/*  screen as you scroll, while its name splits apart behind it.       */
/* ------------------------------------------------------------------ */

function Feature(p: Project): SafeHtml {
  return html`<div class="wf" data-island="work-feature">
    <div class="wf-track">
      <div class="wf-stage">
        <p class="wf-word wf-word--a" aria-hidden="true">Al-Abuzer</p>
        <p class="wf-word wf-word--b" aria-hidden="true">Perfumes</p>
        <a class="wf-frame" href="${p.link.href}" target="_blank" rel="noopener" tabindex="-1" data-cursor="Visit ↗">
          <span class="wf-img">${Picture(p.desktop, { sizes: "100vw", imgClass: "wf-pic" })}</span>
          <span class="wf-scrim" aria-hidden="true"></span>
        </a>
        <div class="wf-caption">
          <div class="wf-cap-main">
            <p class="wf-kicker mono"><span>${p.index} / ${total}</span><span class="tag tag--live"><span class="live-dot" aria-hidden="true"></span>Live in production</span></p>
            <h3 class="wf-title" id="work-${p.id}">${p.name}</h3>
            <p class="wf-sector mono">${p.sector}</p>
          </div>
          <div class="wf-cap-side">
            <p class="wf-summary">${rich(p.summary)}</p>
            ${Features(p.features)}
            <div class="wf-links">
              ${ArrowLink(html`Visit ${p.link.label}`, p.link.href)}
              ${ArrowLink("Read the case study", "#case-study", { icon: icons.arrowDown })}
            </div>
          </div>
        </div>
        <p class="wf-hint mono" aria-hidden="true">Keep scrolling</p>
      </div>
    </div>
  </div>`;
}

/* ------------------------------------------------------------------ */
/*  02–04 — preview builds, each in its own editorial layout           */
/* ------------------------------------------------------------------ */

const layouts = ["a", "b", "c"] as const;

function PreviewItem(p: Project, i: number): SafeHtml {
  const layout = layouts[i % layouts.length] ?? "a";
  const titleId = `work-${p.id}`;
  return html`<article class="pv pv--${layout}" aria-labelledby="${titleId}">
    <a class="pv-media" href="${p.link.href}" target="_blank" rel="noopener" tabindex="-1" data-cursor="Open ↗">
      <span class="pv-desk" data-reveal="image">${Picture(p.desktop, {
        sizes: layout === "c" ? "(min-width: 1024px) 80vw, 100vw" : "(min-width: 1024px) 62vw, 100vw",
      })}</span>
      ${p.mobile
        ? html`<span class="pv-phone" data-reveal="image" data-parallax="${layout === "b" ? "0.10" : "-0.12"}">${Picture(p.mobile, {
            sizes: "(min-width: 1024px) 18vw, 38vw",
          })}</span>`
        : ""}
    </a>
    <div class="pv-text">
      <p class="pv-index mono" aria-hidden="true">${p.index}</p>
      <p class="tag mono">Preview · not published</p>
      <h3 class="pv-title" id="${titleId}" data-reveal="fade">${p.name}</h3>
      <p class="pv-meta mono">${p.sector}${p.location ? html` · ${p.location}` : ""}</p>
      <p class="pv-summary" data-reveal="fade">${rich(p.summary)}</p>
      ${Features(p.features)}
      ${ArrowLink(html`${p.link.label}<span class="sr-only">: ${p.name}</span>`, p.link.href)}
    </div>
  </article>`;
}

export function Work(): SafeHtml {
  return html`<section class="work" id="work" data-theme="ink" aria-labelledby="work-title">
    <header class="wrap work-head">
      ${SectionLabel("02", "Selected work")}
      <div class="work-head-row">
        ${RevealHeading(2, ["Selected ", { em: "work" }], { id: "work-title", className: "display-xl work-title" })}
        <p class="work-count mono" aria-hidden="true">(${total})</p>
      </div>
      <p class="work-lede" data-reveal="fade">${workIntro.lede}</p>
    </header>
    ${Feature(featured)}
    <div class="wrap pv-list">
      <p class="pv-note mono" data-reveal="fade">${workIntro.previewNote}</p>
      ${previews.map((p, i) => PreviewItem(p, i))}
    </div>
  </section>`;
}

