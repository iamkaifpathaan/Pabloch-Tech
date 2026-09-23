import { html, type SafeHtml } from "../lib/html.ts";
import { env } from "../lib/env.ts";
import { nav, site, socialLinks } from "../content/site.ts";
import { icons } from "./icons.ts";

export function Footer(): SafeHtml {
  return html`<footer class="footer" data-theme="ink">
    <div class="wrap footer-top">
      <div class="footer-lead">
        <p class="mono footer-kicker">Start a project</p>
        <a class="footer-email" href="mailto:${site.email}" data-email-link data-cursor="Email ↗"><span data-email-text>${site.email}</span></a>
      </div>
      <nav class="footer-cols" aria-label="Footer">
        <div class="footer-col">
          <p class="mono footer-col-title">Site</p>
          <ul role="list">${nav.map((n) => html`<li><a href="#${n.id}">${n.label}</a></li>`)}</ul>
        </div>
        <div class="footer-col">
          <p class="mono footer-col-title">Elsewhere</p>
          <ul role="list">
            ${socialLinks.map(
              (s) => html`<li data-social-item="${s.key}"><a href="${s.base}${site.socials[s.key]}" target="_blank" rel="noopener" data-social="${s.key}">${s.label}<span class="sr-only"> (opens in a new tab)</span></a></li>`,
            )}
          </ul>
        </div>
        <div class="footer-col footer-colophon">
          <p class="mono footer-col-title">Colophon</p>
          <p>Hand-written HTML, CSS and TypeScript. Set in Instrument Sans, Instrument Serif and Geist Mono. No cookies, no trackers.</p>
          <button class="grid-toggle mono" type="button" aria-pressed="false" data-grid-toggle><span class="grid-toggle-key" aria-hidden="true">G</span> Show the grid</button>
        </div>
      </nav>
    </div>
    <p class="footer-word" aria-hidden="true"><span data-rise>Pabloch</span></p>
    <div class="wrap footer-base mono">
      <p>© <span data-year>${env.year}</span> ${site.name}. All rights reserved.</p>
      <p class="footer-place">Based in ${site.studio.base} · ${site.studio.hours}</p>
      <a class="footer-top-link" href="#top">Back to top ${icons.arrowUp}</a>
    </div>
  </footer>`;
}
