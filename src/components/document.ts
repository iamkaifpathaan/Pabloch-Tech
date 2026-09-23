import { html, trusted, type SafeHtml } from "../lib/html.ts";
import { env } from "../lib/env.ts";
import { site, socialLinks } from "../content/site.ts";

/**
 * Runs before first paint: marks the document as scripted so reveal states
 * can hide content *only* when JS will bring it back. If the app bundle fails
 * to load, the failsafe removes the motion class after 4s so nothing stays
 * hidden. Its SHA-256 is written into the CSP by the build.
 */
export const HEAD_SCRIPT =
  "(function(d,w){var c=d.documentElement.classList;c.add('js');" +
  "if(!w.matchMedia('(prefers-reduced-motion: reduce)').matches)c.add('js-motion');" +
  "w.setTimeout(function(){if(!w.__ptReady)c.remove('js-motion')},4000)})(document,window);";

function csp(): string {
  return [
    "default-src 'self'",
    `script-src 'self' '${env.headScriptHash}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self' https://api.web3forms.com",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "frame-src 'none'",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

function structuredData(): SafeHtml {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${site.url}#studio`,
        name: site.name,
        description: site.description,
        url: site.url,
        email: site.email,
        image: `${site.url}${site.ogImage}`,
        logo: `${site.url}favicon.svg`,
        areaServed: site.areaServed,
        knowsAbout: ["Web design", "Web development", "E-commerce development", "Landing pages", "Website maintenance"],
        sameAs: socialLinks.map((s) => `${s.base}${site.socials[s.key]}`),
        contactPoint: { "@type": "ContactPoint", contactType: "sales", email: site.email, availableLanguage: ["English"] },
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}#website`,
        url: site.url,
        name: site.name,
        publisher: { "@id": `${site.url}#studio` },
        inLanguage: site.locale,
      },
    ],
  };
  // JSON inside <script>: escape "<" so no string can ever close the tag.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return trusted(`<script type="application/ld+json">${json}</script>`);
}

interface DocumentOptions {
  title: string;
  description: string;
  canonical: string;
  body: SafeHtml;
  bodyClass?: string;
  noindex?: boolean;
  structured?: boolean;
}

export function Document(o: DocumentOptions): SafeHtml {
  const ogImage = `${site.url}${site.ogImage}`;
  return html`<!doctype html>
<html lang="${site.locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${csp()}">
<title>${o.title}</title>
<meta name="description" content="${o.description}">
${o.noindex ? html`<meta name="robots" content="noindex">` : html`<link rel="canonical" href="${o.canonical}">`}
<meta name="theme-color" content="${site.themeColor}">
<meta name="color-scheme" content="dark light">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${o.title}">
<meta property="og:description" content="${o.description}">
<meta property="og:url" content="${o.canonical}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${site.ogImageAlt}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${o.title}">
<meta name="twitter:description" content="${o.description}">
<meta name="twitter:image" content="${ogImage}">
<link rel="icon" href="${env.base}favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${env.base}apple-touch-icon.png">
<link rel="preload" href="${env.base}static/fonts/instrument-sans-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${env.base}static/fonts/instrument-serif-italic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${env.base}static/${env.css}">
<script>${trusted(HEAD_SCRIPT)}</script>
<script src="${env.base}config.js" defer></script>
<script type="module" src="${env.base}static/${env.js}"></script>
${o.structured ? structuredData() : ""}
</head>
<body${o.bodyClass ? html` class="${o.bodyClass}"` : ""}>
${o.body}
</body>
</html>`;
}
