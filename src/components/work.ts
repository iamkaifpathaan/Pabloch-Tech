import { html, type SafeHtml } from "../lib/html.ts";
import { rich } from "../lib/rich.ts";
import type { Project } from "../lib/types.ts";
import { allWork, featured, moreWork, statusLabel, workIntro } from "../content/work.ts";
import { ArrowLink, Picture, RevealHeading, SectionLabel } from "./primitives.ts";
import { icons } from "./icons.ts";

const total = String(allWork.length).padStart(2, "0");

function Features(features: readonly string[]): SafeHtml {
  return html`<ul class="features mono" role="list">${features.map((f) => html`<li>${f}</li>`)}</ul>`;
}

function StatusTag(p: Project): SafeHtml {
  return html`<span class="tag tag--${p.status}">${p.status === "live" ? html`<span class="live-dot" aria-hidden="true"></span>` : ""}${statusLabel[p.status]}</span>`;
}

function Links(p: Project): SafeHtml {
  return html`${ArrowLink(html`${p.link.label}<span class="sr-only">: ${p.name}</span>`, p.link.href)}${(p.more ?? []).map((l) =>
    ArrowLink(l.label, l.href, l.href.startsWith("#") ? { icon: icons.arrowDown } : {}),
  )}`;
}

/* ------------------------------------------------------------------ */
/*  01 — the pinned "wow" moment: the headline project grows from a    */
/*  small frame to fill the stage while its name splits apart behind.  */
/* ------------------------------------------------------------------ */

function Feature(p: Project): SafeHtml {
  const [wordA, wordB] = p.words ?? [p.name, ""];
  const m = p.portrait ?? p.desktop;
  return html`<div class="wf" data-island="work-feature" style="--arw:${p.desktop.width};--arh:${p.desktop.height};--arw-m:${m.width};--arh-m:${m.height}">
    <div class="wf-track">
      <div class="wf-stage">
        <p class="wf-word wf-word--a" aria-hidden="true">${wordA}</p>
        <p class="wf-word wf-word--b" aria-hidden="true">${wordB}</p>
        <a class="wf-frame" href="${p.link.href}" target="_blank" rel="noopener" tabindex="-1" data-cursor="Explore ↗">
          <span class="wf-img">${Picture(p.desktop, {
            sizes: "(min-width: 768px) 92vw, 100vw",
            imgClass: "wf-pic",
            ...(p.portrait ? { portrait: p.portrait, portraitSizes: "92vw" } : {}),
          })}</span>
        </a>
        <div class="wf-caption">
          <div class="wf-cap-main">
            <p class="wf-kicker mono"><span>${p.index} / ${total}</span>${StatusTag(p)}</p>
            <h3 class="wf-title" id="work-${p.id}">${p.name}</h3>
            <p class="wf-sector mono">${p.sector}</p>
          </div>
          <div class="wf-cap-side">
            <p class="wf-summary">${rich(p.summary)}</p>
            ${Features(p.features)}
            <div class="wf-links">${Links(p)}</div>
          </div>
        </div>
        <p class="wf-hint mono" aria-hidden="true">Keep scrolling</p>
      </div>
    </div>
  </div>`;
}

/* ------------------------------------------------------------------ */
/*  02–05 — each in its own editorial layout                           */
/* ------------------------------------------------------------------ */

function WorkItem(p: Project): SafeHtml {
  const layout = p.layout ?? "a";
  const titleId = `work-${p.id}`;
  const cursor = p.status === "live" ? "Visit ↗" : "Open ↗";
  return html`<article class="pv pv--${layout}${p.status === "live" ? " pv--live" : ""}" aria-labelledby="${titleId}">
    <a class="pv-media" href="${p.link.href}" target="_blank" rel="noopener" tabindex="-1" data-cursor="${cursor}">
      <span class="pv-desk" data-reveal="image">${Picture(p.desktop, {
        sizes: layout === "c" ? "(min-width: 1200px) 80vw, 100vw" : "(min-width: 1200px) 62vw, 100vw",
      })}</span>
      ${p.mobile
        ? html`<span class="pv-phone${p.mobileKind === "tablet" ? " pv-phone--tablet" : ""}" data-reveal="image" data-parallax="${layout === "b" ? "0.10" : "-0.12"}">${Picture(p.mobile, {
            sizes: p.mobileKind === "tablet" ? "(min-width: 1200px) 24vw, 40vw" : "(min-width: 1200px) 18vw, 38vw",
          })}</span>`
        : ""}
    </a>
    <div class="pv-text">
      <p class="pv-index mono" aria-hidden="true">${p.index}</p>
      <p class="mono">${StatusTag(p)}</p>
      <h3 class="pv-title" id="${titleId}" data-reveal="fade">${p.name}</h3>
      <p class="pv-meta mono">${p.sector}${p.location ? html` · ${p.location}` : ""}</p>
      <p class="pv-summary" data-reveal="fade">${rich(p.summary)}</p>
      ${Features(p.features)}
      <div class="pv-links">${Links(p)}</div>
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
      ${moreWork.map((p) => WorkItem(p))}
    </div>
  </section>`;
}
