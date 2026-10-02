import { html, trusted, type SafeHtml } from "../lib/html.ts";
import { env } from "../lib/env.ts";
import { site, socialLinks } from "../content/site.ts";
import { services } from "../content/services.ts";

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

export type Json = Record<string, unknown>;

/** The studio as an entity — the node every other node points back to. */
function studioNode(): Json {
  return {
    "@type": ["ProfessionalService", "Organization"],
    "@id": `${site.url}#studio`,
    name: site.name,
    alternateName: site.shortName,
    description: site.oneLine,
    slogan: "Your first working draft, before you pay.",
    url: site.url,
    email: site.email,
    image: `${site.url}${site.ogImage}`,
    logo: { "@type": "ImageObject", url: `${site.url}apple-touch-icon.png`, width: 180, height: 180 },
    address: { "@type": "PostalAddress", addressCountry: "IN" },
    areaServed: site.areaServed.map((name) => ({ "@type": "Country", name })),
    priceRange: "$400+",
    currenciesAccepted: site.payments.currencies.join(", "),
    paymentAccepted: "PayPal, credit card, debit card",
    knowsLanguage: "en",
    knowsAbout: [
      "Custom web design",
      "Web development",
      "E-commerce development",
      "Online stores",
      "Landing pages",
      "UI and UX design",
      "Search engine optimisation",
      "Website performance",
      "Website maintenance",
    ],
    sameAs: socialLinks.map((s) => `${s.base}${site.socials[s.key]}`),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: site.email,
      availableLanguage: ["English"],
      areaServed: ["US", "GB"],
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Web design and development services",
      itemListElement: services.map((svc) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: svc.name, description: svc.line, serviceType: svc.name },
        ...(svc.fromUSD
          ? { priceSpecification: { "@type": "PriceSpecification", minPrice: svc.fromUSD, priceCurrency: "USD" } }
          : {}),
      })),
    },
  };
}

function websiteNode(): Json {
  return {
    "@type": "WebSite",
    "@id": `${site.url}#website`,
    url: site.url,
    name: site.name,
    description: site.description,
    publisher: { "@id": `${site.url}#studio` },
    inLanguage: site.locale,
  };
}

export interface Crumb {
  name: string;
  url: string;
}

export interface DocumentOptions {
  title: string;
  description: string;
  canonical: string;
  body: SafeHtml;
  bodyClass?: string;
  noindex?: boolean;
  /** schema.org type of the page node, e.g. "AboutPage", "CollectionPage". */
  pageType?: string;
  /** ISO date the page content last changed (defaults to the build date). */
  modified?: string;
  crumbs?: readonly Crumb[];
  /** Extra @graph nodes (articles, FAQ, item lists). */
  schema?: readonly Json[];
  /** Adds og:type=article and its dates. */
  article?: { published: string; modified: string; section: string };
}

function structuredData(o: DocumentOptions): SafeHtml {
  const pageNode: Json = {
    "@type": o.pageType ?? "WebPage",
    "@id": `${o.canonical}#webpage`,
    url: o.canonical,
    name: o.title,
    description: o.description,
    isPartOf: { "@id": `${site.url}#website` },
    about: { "@id": `${site.url}#studio` },
    inLanguage: site.locale,
    dateModified: o.modified ?? env.buildDate,
    primaryImageOfPage: { "@type": "ImageObject", url: `${site.url}${site.ogImage}` },
  };
  const graph: Json[] = [studioNode(), websiteNode(), pageNode];
  if (o.crumbs?.length) {
    pageNode.breadcrumb = { "@id": `${o.canonical}#breadcrumb` };
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${o.canonical}#breadcrumb`,
      itemListElement: o.crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.url })),
    });
  }
  graph.push(...(o.schema ?? []));
  // JSON inside <script>: escape "<" so no string can ever close the tag.
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return trusted(`<script type="application/ld+json">${json}</script>`);
}

export function Document(o: DocumentOptions): SafeHtml {
  // Search results cut titles at ~60 characters and descriptions at ~160.
  if (!o.noindex && o.title.length > 65) console.warn(`⚠ long <title> (${o.title.length}): ${o.canonical}`);
  if (!o.noindex && o.description.length > 160) console.warn(`⚠ long meta description (${o.description.length}): ${o.canonical}`);
  const ogImage = `${site.url}${site.ogImage}`;
  return html`<!doctype html>
<html lang="${site.locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${csp()}">
<title>${o.title}</title>
<meta name="description" content="${o.description}">
${o.noindex
  ? html`<meta name="robots" content="noindex">`
  : html`<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<link rel="canonical" href="${o.canonical}">`}
<meta name="author" content="${site.name}">
<meta name="theme-color" content="${site.themeColor}">
<meta name="color-scheme" content="dark light">
<meta property="og:type" content="${o.article ? "article" : "website"}">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="en_GB">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${o.title}">
<meta property="og:description" content="${o.description}">
<meta property="og:url" content="${o.canonical}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${site.ogImageAlt}">
${o.article
  ? html`<meta property="article:published_time" content="${o.article.published}">
<meta property="article:modified_time" content="${o.article.modified}">
<meta property="article:section" content="${o.article.section}">
<meta property="article:author" content="${site.url}">`
  : ""}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${o.title}">
<meta name="twitter:description" content="${o.description}">
<meta name="twitter:image" content="${ogImage}">
<link rel="icon" href="${env.base}favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${env.base}apple-touch-icon.png">
<link rel="alternate" type="application/rss+xml" title="${site.name} — Journal" href="${site.url}blog/feed.xml">
<link rel="preload" href="${env.base}static/fonts/instrument-sans-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${env.base}static/fonts/instrument-serif-italic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${env.base}static/${env.css}">
<script>${trusted(HEAD_SCRIPT)}</script>
<script src="${env.base}config.js?v=${env.configVersion}" defer></script>
<script type="module" src="${env.base}static/${env.js}"></script>
${o.noindex ? "" : structuredData(o)}
</head>
<body${o.bodyClass ? html` class="${o.bodyClass}"` : ""}>
${o.body}
</body>
</html>`;
}
