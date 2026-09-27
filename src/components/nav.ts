import { html, type SafeHtml } from "../lib/html.ts";
import { nav, pages, site, socialLinks } from "../content/site.ts";
import { env } from "../lib/env.ts";
import { logoMark, icons } from "./icons.ts";

/** On the home page the logo scrolls to the top; everywhere else it goes home. */
export function Brand(href = "#top"): SafeHtml {
  const label = href === "#top" ? "Pabloch Tech — back to the top" : "Pabloch Tech — home";
  return html`<a class="brand" href="${href}" aria-label="${label}">
    ${logoMark}<span class="brand-name">Pabloch<span class="brand-tech">Tech</span></span>
  </a>`;
}

export function Nav(): SafeHtml {
  return html`<header class="nav" data-island="nav">
    <div class="nav-plate" aria-hidden="true"></div>
    <div class="nav-bar">
      ${Brand()}
      <nav class="nav-links" aria-label="Primary">
        <ul role="list">
          ${nav.map((item) => html`<li><a href="#${item.id}" data-nav-link="${item.id}"><span>${item.label}</span></a></li>`)}
          <li><a href="${env.base}${pages.blog.path}"><span>${pages.blog.label}</span></a></li>
        </ul>
      </nav>
      <a class="btn btn--primary btn--sm nav-cta" href="#contact" data-magnetic><span class="btn-label">Start a project</span></a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="menu" data-menu-toggle>
        <span class="menu-toggle-label">Menu</span>
        <span class="menu-toggle-lines" aria-hidden="true"><i></i><i></i></span>
      </button>
    </div>
  </header>`;
}

export function SocialList(className: string): SafeHtml {
  return html`<ul class="${className}" role="list">
    <li><a href="mailto:${site.email}" data-email-link><span class="social-icon">${icons.mail}</span><span data-email-text>${site.email}</span></a></li>
    ${socialLinks.map(
      (s) => html`<li data-social-item="${s.key}"><a href="${s.base}${site.socials[s.key]}" target="_blank" rel="noopener" data-social="${s.key}">
        <span class="social-icon">${icons[s.key]}</span><span>${s.label}</span><span class="social-handle" data-social-handle>@${site.socials[s.key]}</span><span class="sr-only"> (opens in a new tab)</span>
      </a></li>`,
    )}
  </ul>`;
}

export function MobileMenu(): SafeHtml {
  return html`<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Site menu" hidden data-menu>
    <div class="menu-grid" aria-hidden="true"></div>
    <nav class="menu-links" aria-label="Menu">
      <ol role="list">
        ${nav.map(
          (item, i) => html`<li style="--i:${i}"><a href="#${item.id}" data-menu-link><span class="menu-index mono">0${i + 1}</span><span class="menu-label">${item.label}</span></a></li>`,
        )}
        <li style="--i:${nav.length}"><a href="${env.base}${pages.blog.path}"><span class="menu-index mono">0${nav.length + 1}</span><span class="menu-label">${pages.blog.label}</span></a></li>
      </ol>
    </nav>
    <div class="menu-foot">
      <a class="btn btn--primary btn--md" href="#contact" data-menu-link><span class="btn-label">Start a project</span><span class="btn-icon">${icons.arrowRight}</span></a>
      ${SocialList("menu-social")}
      <p class="menu-clock mono"><span>Studio time</span> <span data-clock="short">${site.studio.timeZoneLabel}</span></p>
    </div>
  </div>`;
}
