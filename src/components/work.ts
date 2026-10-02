import { html, type SafeHtml } from "../lib/html.ts";
import { rich } from "../lib/rich.ts";
import type { Project } from "../lib/types.ts";
import { alAbuzer, allWork, featured, moreWork, previews, renewalTracker, statusLabel, workIntro } from "../content/work.ts";
import { caseStudy } from "../content/studio.ts";
import { shots } from "../content/shots.ts";
import { href, to } from "../lib/routes.ts";
import { ArrowLink, Picture, RevealHeading, SectionHeading, SectionLabel } from "./primitives.ts";
import { icons } from "./icons.ts";

const total = String(allWork.length).padStart(2, "0");

function Features(features: readonly string[]): SafeHtml {
  return html`<ul class="features mono" role="list">${features.map((f) => html`<li>${f}</li>`)}</ul>`;
}

function StatusTag(p: Project): SafeHtml {
  return html`<span class="tag tag--${p.status}">${p.status === "live" || p.status === "product" ? html`<span class="live-dot" aria-hidden="true"></span>` : ""}${statusLabel[p.status]}</span>`;
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
/*  02–06 — each in its own editorial layout                           */
/* ------------------------------------------------------------------ */

function WorkItem(p: Project, layoutOverride?: Project["layout"]): SafeHtml {
  const layout = layoutOverride ?? p.layout ?? "a";
  const titleId = `work-${p.id}`;
  const cursor = p.status === "live" ? "Visit ↗" : "Open ↗";
  return html`<article class="pv pv--${layout}${p.status === "live" ? " pv--live" : ""}" id="p-${p.id}" aria-labelledby="${titleId}">
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

/* ------------------------------------------------------------------ */
/*  Home — the pinned headline project, three more, and a way in       */
/* ------------------------------------------------------------------ */

function WorkCard(p: Project, i: number): SafeHtml {
  return html`<li class="wcard" data-reveal="fade" style="--delay:${i * 90}ms">
    <a class="wcard-link" href="${href(to("work", `p-${p.id}`))}" data-cursor="View">
      <span class="wcard-media" data-reveal="image" style="--delay:${i * 90}ms">${Picture(p.desktop, { sizes: "(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw" })}</span>
      <span class="wcard-top mono"><span>${p.index} / ${total}</span>${StatusTag(p)}</span>
      <h3 class="wcard-title">${p.name}</h3>
      <span class="wcard-sector mono">${p.sector}</span>
      <span class="wcard-arrow" aria-hidden="true">${icons.arrowRight}</span>
    </a>
  </li>`;
}

export function HomeWork(index = "02"): SafeHtml {
  const cards = [renewalTracker, alAbuzer, previews[0]].filter((p): p is Project => !!p);
  return html`<section class="work work--home" id="selected-work" data-theme="ink" aria-labelledby="work-title">
    <header class="wrap work-head">
      ${SectionLabel(index, "Selected work")}
      <div class="work-head-row">
        ${RevealHeading(2, ["Selected ", { em: "work" }], { id: "work-title", className: "display-xl work-title" })}
        <p class="work-count mono" aria-hidden="true">(${total})</p>
      </div>
      <p class="work-lede" data-reveal="fade">${workIntro.lede}</p>
    </header>
    ${Feature(featured)}
    <div class="wrap wcards-wrap">
      <ul class="wcards" role="list">${cards.map((p, i) => WorkCard(p, i))}</ul>
      <div class="wcards-foot" data-reveal="fade">
        <p class="mono wcards-note">+ ${String(allWork.length - 1 - cards.length).padStart(2, "0")} more builds, with the full write-ups</p>
        ${ArrowLink(`See all ${allWork.length === 6 ? "six" : allWork.length} builds`, to("work"), { className: "arrow-link--lg" })}
      </div>
    </div>
  </section>`;
}

/* ------------------------------------------------------------------ */
/*  Work page                                                          */
/* ------------------------------------------------------------------ */

/** A compact index of every build; rows jump to the full entry below. */
export function WorkIndex(index = "01"): SafeHtml {
  return html`<section class="windex-sec" id="index" data-theme="ink" aria-labelledby="index-title">
    <div class="wrap">
      <header class="sec-head sec-head--compact">${SectionHeading(index, "Index", "index-title")}</header>
      <ol class="windex" role="list">
        ${allWork.map(
          (p, i) => html`<li data-reveal="fade" style="--delay:${i * 60}ms">
            <a class="windex-row" href="#p-${p.id}">
              <span class="windex-num mono">${p.index}</span>
              <span class="windex-name">${p.name}</span>
              <span class="windex-sector mono">${p.sector}</span>
              <span class="windex-status mono">${StatusTag(p)}</span>
              <span class="windex-arrow" aria-hidden="true">${icons.arrowDown}</span>
              <span class="windex-thumb" aria-hidden="true">${Picture(p.desktop, { sizes: "280px" })}</span>
            </a>
          </li>`,
        )}
      </ol>
    </div>
  </section>`;
}

/** Every build, each in its own editorial layout. */
export function WorkList(index = "02"): SafeHtml {
  return html`<section class="work work--page" id="builds" data-theme="ink" aria-labelledby="builds-title">
    <div class="wrap">
      <header class="sec-head sec-head--compact">${SectionHeading(index, "The builds", "builds-title")}</header>
    </div>
    <div class="wrap pv-list">
      ${WorkItem(featured, "c")}
      <p class="pv-note mono" data-reveal="fade">${workIntro.previewNote}</p>
      ${moreWork.map((p) => WorkItem(p))}
    </div>
  </section>`;
}

/** The case study, as a door. */
export function CaseTeaser(index = "03"): SafeHtml {
  const p = caseStudy.project;
  return html`<section class="cteaser" id="case" data-theme="ink" aria-labelledby="case-teaser-title">
    <div class="wrap">
      <header class="sec-head sec-head--compact">${SectionHeading(index, "Case study", "case-teaser-label")}</header>
      <a class="cteaser-link" href="${href(to("case-study"))}" data-cursor="Read">
        <span class="cteaser-media" data-reveal="image">${Picture(p.desktop, { sizes: "(min-width: 1024px) 58vw, 100vw" })}</span>
        <span class="cteaser-text">
          <span class="cteaser-kicker mono">${p.name} · ${statusLabel[p.status]}</span>
          <h3 class="cteaser-title" id="case-teaser-title">${rich(caseStudy.headline)}</h3>
          <span class="cteaser-copy">${caseStudy.chapters[0]?.body ?? ""}</span>
          <span class="cteaser-cta"><span class="arrow-link-label">Read the case study</span>${icons.arrowRight}</span>
        </span>
      </a>
    </div>
  </section>`;
}
