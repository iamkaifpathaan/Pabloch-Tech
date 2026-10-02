import { html, type SafeHtml } from "../lib/html.ts";
import { href, navRoutes, to, type PageId } from "../lib/routes.ts";
import { site, socialLinks } from "../content/site.ts";
import { logoMark, icons } from "./icons.ts";

/** Which nav item a page belongs to (the case study lives under Work). */
const section = (page: PageId): PageId => (page === "case-study" ? "work" : page);

export function Brand(): SafeHtml {
  return html`<a class="brand" href="${href("/")}" aria-label="Pabloch Tech — home">
    ${logoMark}<span class="brand-name">Pabloch<span class="brand-tech">Tech</span></span>
  </a>`;
}

export function Nav(page: PageId): SafeHtml {
  const current = section(page);
  return html`<header class="nav" id="top" data-island="nav">
    <div class="nav-plate" aria-hidden="true"></div>
    <div class="nav-bar">
      ${Brand()}
      <nav class="nav-links" aria-label="Primary">
        <ul role="list">
          ${navRoutes.map(
            (r) => html`<li><a href="${href(to(r.id))}"${r.id === current ? html` aria-current="page"` : ""}><span>${r.label}</span></a></li>`,
          )}
        </ul>
      </nav>
      ${page === "contact"
        ? ""
        : html`<a class="btn btn--primary btn--sm nav-cta" href="${href(to("contact"))}" data-magnetic><span class="btn-label">Start a project</span></a>`}
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

export function MobileMenu(page: PageId): SafeHtml {
  const current = section(page);
  const items = [{ id: "home" as PageId, label: "Home" }, ...navRoutes];
  return html`<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Site menu" hidden data-menu>
    <div class="menu-grid" aria-hidden="true"></div>
    <nav class="menu-links" aria-label="Menu">
      <ol role="list">
        ${items.map(
          (r, i) => html`<li style="--i:${i}"><a href="${href(to(r.id))}" data-menu-link${r.id === current ? html` aria-current="page"` : ""}><span class="menu-index mono">0${i}</span><span class="menu-label">${r.label}</span></a></li>`,
        )}
      </ol>
    </nav>
    <div class="menu-foot">
      <a class="btn btn--primary btn--md" href="${href(to("contact"))}" data-menu-link><span class="btn-label">Start a project</span><span class="btn-icon">${icons.arrowRight}</span></a>
      ${SocialList("menu-social")}
      <p class="menu-clock mono"><span>Studio time</span> <span data-clock="short">${site.studio.timeZoneLabel}</span></p>
    </div>
  </div>`;
}
