import { attrs, html, type Child, type SafeHtml } from "../lib/html.ts";
import { env } from "../lib/env.ts";
import { PENDING, type Rich, type Shot } from "../lib/types.ts";
import { revealWords } from "../lib/rich.ts";
import { icons } from "./icons.ts";

/* ------------------------------------------------------------------ */
/*  Responsive screenshot                                              */
/* ------------------------------------------------------------------ */

interface PictureOptions {
  sizes: string;
  eager?: boolean;
  className?: string;
  imgClass?: string;
}

const srcset = (shot: Shot, ext: "avif" | "webp"): string =>
  shot.widths.map((w) => `${env.base}assets/work/${shot.name}-${w}.${ext} ${w}w`).join(", ");

export function Picture(shot: Shot, opts: PictureOptions): SafeHtml {
  const fallbackWidth = shot.widths[Math.min(1, shot.widths.length - 1)] ?? shot.widths[0];
  return html`<picture ${attrs({ class: opts.className })}>
    <source type="image/avif" srcset="${srcset(shot, "avif")}" sizes="${opts.sizes}">
    <source type="image/webp" srcset="${srcset(shot, "webp")}" sizes="${opts.sizes}">
    <img ${attrs({
      src: `${env.base}assets/work/${shot.name}-${fallbackWidth}.webp`,
      alt: shot.alt,
      width: shot.width,
      height: shot.height,
      loading: opts.eager ? "eager" : "lazy",
      decoding: "async",
      fetchpriority: opts.eager ? "high" : undefined,
      class: opts.imgClass,
    })}>
  </picture>`;
}

/* ------------------------------------------------------------------ */
/*  Section scaffolding                                                */
/* ------------------------------------------------------------------ */

export function SectionLabel(index: string, label: string): SafeHtml {
  return html`<p class="sec-label mono" data-reveal="fade"><span class="sec-index">(${index})</span><span>${label}</span></p>`;
}

export function RevealHeading(
  level: 2 | 3,
  rich: Rich,
  opts: { id?: string; className: string },
): SafeHtml {
  const inner = revealWords(rich);
  const a = attrs({ id: opts.id, class: opts.className, "data-reveal": "words" });
  return level === 2 ? html`<h2 ${a}>${inner}</h2>` : html`<h3 ${a}>${inner}</h3>`;
}

/* ------------------------------------------------------------------ */
/*  Buttons & links                                                    */
/* ------------------------------------------------------------------ */

export function PrimaryButton(label: string, href: string, opts: { size?: "sm" | "md" | "lg"; cursor?: string } = {}): SafeHtml {
  return html`<a ${attrs({
    class: `btn btn--primary btn--${opts.size ?? "md"}`,
    href,
    "data-magnetic": true,
    "data-cursor": opts.cursor,
  })}><span class="btn-label">${label}</span><span class="btn-icon">${icons.arrowRight}</span></a>`;
}

export function ArrowLink(label: Child, href: string, opts: { external?: boolean; className?: string; icon?: SafeHtml } = {}): SafeHtml {
  const external = opts.external ?? /^https?:/.test(href);
  return html`<a ${attrs({
    class: `arrow-link ${opts.className ?? ""}`.trim(),
    href,
    target: external ? "_blank" : undefined,
    rel: external ? "noopener" : undefined,
  })}><span class="arrow-link-label">${label}</span>${opts.icon ?? (external ? icons.arrowUpRight : icons.arrowRight)}${
    external ? html`<span class="sr-only"> (opens in a new tab)</span>` : ""
  }</a>`;
}

/* ------------------------------------------------------------------ */
/*  Missing content marker                                             */
/* ------------------------------------------------------------------ */

/**
 * The brief: never invent missing facts — mark them. While a value is still
 * PENDING, development builds show a visible marker so it gets noticed and
 * production omits the slot entirely. Once real content is supplied in
 * src/content, `render` takes over.
 */
export function ContentSlot(label: string, value: string, render: (value: string) => SafeHtml): SafeHtml {
  if (value !== PENDING) return render(value);
  if (!env.dev) return html``;
  return html`<p class="pending mono"><strong>${label}:</strong> ${PENDING}</p>`;
}
