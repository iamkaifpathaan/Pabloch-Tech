import { html, type SafeHtml } from "../lib/html.ts";
import { rich } from "../lib/rich.ts";
import { caseStudy } from "../content/studio.ts";
import { ArrowLink, ContentSlot, Picture, PrimaryButton, RevealHeading, SectionLabel } from "./primitives.ts";

export function CaseStudy(): SafeHtml {
  const cs = caseStudy;
  const p = cs.project;
  return html`<section class="case" id="case-study" data-theme="ink" aria-labelledby="case-title">
    <div class="wrap">
      <header class="case-head">
        ${SectionLabel("07", "Case study")}
        ${RevealHeading(2, p.name, { id: "case-title", className: "display-xl case-title" })}
        <p class="case-sub" data-reveal="fade">${rich(cs.headline)}</p>
      </header>
    </div>

    <figure class="case-hero" data-reveal="image">
      <span class="case-hero-img" data-parallax="0.08">${Picture(p.desktop, { sizes: "100vw" })}</span>
      <figcaption class="wrap mono">The desktop app, as it runs today.</figcaption>
    </figure>

    <div class="wrap case-grid">
      <aside class="case-meta" aria-label="Project details">
        <dl>
          ${cs.meta.map((m) => html`<div class="case-meta-row"><dt class="mono">${m.label}</dt><dd>${m.value}</dd></div>`)}
        </dl>
        ${ArrowLink(p.link.label, p.link.href)}
        ${p.more?.filter((m) => /^https?:/.test(m.href)).map((m) => ArrowLink(m.label, m.href))}
      </aside>

      <div class="case-body">
        ${cs.chapters.map(
          (c) => html`<div class="case-chapter" data-reveal="fade">
            <h3 class="case-chapter-label mono">${c.label}</h3>
            <p class="case-lead">${c.body}</p>
          </div>`,
        )}

        <div class="case-chapter">
          <h3 class="case-chapter-label mono" data-reveal="fade">The approach</h3>
          <ol class="case-moves" role="list">
            ${cs.moves.map(
              (m, i) => html`<li class="case-move" data-reveal="fade" style="--delay:${i * 80}ms">
                <span class="case-move-num mono" aria-hidden="true">0${i + 1}</span>
                <div><h4 class="case-move-title">${m.title}</h4><p>${m.body}</p></div>
              </li>`,
            )}
          </ol>
        </div>

        ${p.mobile
          ? html`<figure class="case-inline" data-reveal="image">
              ${Picture(p.mobile, { sizes: "(min-width: 1024px) 60vw, 100vw" })}
              <figcaption class="mono">The same app at tablet width.</figcaption>
            </figure>`
          : ""}

        <div class="case-chapter">
          <h3 class="case-chapter-label mono" data-reveal="fade">What we built</h3>
          <ul class="case-built" role="list">${cs.built.map((b) => html`<li data-reveal="fade">${b}</li>`)}</ul>
        </div>

        <div class="case-chapter case-status" data-reveal="fade">
          <h3 class="case-chapter-label mono">What it means for you</h3>
          <p class="case-lead">${rich(cs.forYou)}</p>
          ${PrimaryButton("Talk about your product", "#contact")}
          ${ContentSlot("Measured results", cs.results, (v) => html`<p class="case-lead">${v}</p>`)}
          ${ContentSlot("Client quote", cs.clientWords, (v) => html`<blockquote class="case-quote"><p>${v}</p></blockquote>`)}
        </div>
      </div>
    </div>
  </section>`;
}
