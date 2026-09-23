import { trusted, type SafeHtml } from "../lib/html.ts";

/** Static, hand-written SVG. Decorative icons are aria-hidden by default. */
const svg = (body: string, viewBox = "0 0 24 24", cls = "icon"): SafeHtml =>
  trusted(
    `<svg class="${cls}" viewBox="${viewBox}" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`,
  );

export const icons = {
  arrowRight: svg('<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>'),
  arrowUpRight: svg('<path d="M7 17 17 7"/><path d="M8 7h9v9"/>'),
  arrowDown: svg('<path d="M12 4v15"/><path d="m6 13 6 6 6-6"/>'),
  arrowUp: svg('<path d="M12 20V5"/><path d="m6 11 6-6 6 6"/>'),
  plus: svg('<path d="M12 5v14"/><path d="M5 12h14"/>'),
  mail: svg('<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m4 7 8 6 8-6"/>'),
  telegram: svg('<path d="M21 4 3 11l6 2 2 6 3-4 5 4 2-15Z"/><path d="m9 13 8-6"/>'),
  instagram: svg('<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17.2" cy="6.8" r=".6" fill="currentColor" stroke="none"/>'),
  facebook: svg('<path d="M14 21v-7.5h2.6l.4-3H14V8.7c0-.9.3-1.5 1.6-1.5H17V4.6c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.4-3.8 3.9v2.1H8.5v3H11V21"/>'),
};

/** The Pabloch mark: a P drawn on a 3×3 construction grid. */
export const logoMark = trusted(
  `<svg class="logo-mark" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true" focusable="false">
    <rect x=".75" y=".75" width="30.5" height="30.5" rx="7" fill="#0B0B0C" stroke="currentColor" stroke-opacity=".28" stroke-width="1.5"/>
    <g fill="currentColor" opacity=".35"><circle cx="9" cy="9" r=".9"/><circle cx="16" cy="9" r=".9"/><circle cx="23" cy="9" r=".9"/><circle cx="9" cy="16" r=".9"/><circle cx="16" cy="16" r=".9"/><circle cx="23" cy="16" r=".9"/><circle cx="9" cy="23" r=".9"/><circle cx="16" cy="23" r=".9"/><circle cx="23" cy="23" r=".9"/></g>
    <path d="M11 24.5V7.5h6.4c3.4 0 5.6 2.1 5.6 5.2s-2.2 5.2-5.6 5.2H11" fill="none" stroke="#E9B44C" stroke-width="2.6" stroke-linecap="square"/>
  </svg>`,
);

export const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0B0B0C"/><path d="M22 49V15h12.8c6.8 0 11.2 4.2 11.2 10.4S41.6 35.8 34.8 35.8H22" fill="none" stroke="#E9B44C" stroke-width="5.2" stroke-linecap="square"/></svg>`;
