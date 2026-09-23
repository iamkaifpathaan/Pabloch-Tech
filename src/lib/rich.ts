import { html, join, type SafeHtml } from "./html.ts";
import type { Rich, RichPart } from "./types.ts";

function parts(rich: Rich): readonly RichPart[] {
  return typeof rich === "string" ? [rich] : rich;
}

export function plainText(rich: Rich): string {
  return parts(rich)
    .map((p) => (typeof p === "string" ? p : "em" in p ? p.em : p.strong))
    .join("");
}

export function wordCount(rich: Rich): number {
  const text = plainText(rich).trim();
  return text === "" ? 0 : text.split(/\s+/).length;
}

/** Render rich text as inline HTML (escaped). */
export function rich(value: Rich): SafeHtml {
  return join(
    parts(value).map((p) => {
      if (typeof p === "string") return p;
      if ("em" in p) return html`<em>${p.em}</em>`;
      return html`<strong>${p.strong}</strong>`;
    }),
  );
}

/**
 * Pre-split a heading into masked words for the line-rise reveal.
 * The readable text is kept once, visually hidden, for assistive tech;
 * the animated copy is aria-hidden. Works with no JavaScript at all.
 */
export function revealWords(value: Rich, startIndex = 0): SafeHtml {
  let i = startIndex;
  const words: SafeHtml[] = [];
  for (const p of parts(value)) {
    const text = typeof p === "string" ? p : "em" in p ? p.em : p.strong;
    const tag = typeof p === "string" ? null : "em" in p ? "em" : "strong";
    for (const token of text.split(/(\s+)/)) {
      if (token === "") continue;
      if (/^\s+$/.test(token)) {
        words.push(html` `);
        continue;
      }
      const index = i++;
      const inner =
        tag === "em"
          ? html`<em class="rw-i" style="--i:${index}">${token}</em>`
          : tag === "strong"
            ? html`<strong class="rw-i" style="--i:${index}">${token}</strong>`
            : html`<span class="rw-i" style="--i:${index}">${token}</span>`;
      words.push(html`<span class="rw-w">${inner}</span>`);
    }
  }
  return html`<span class="sr-only">${plainText(value)}</span><span class="rw" aria-hidden="true">${words}</span>`;
}

/** Split a statement into words that light up as the reader scrolls (see `scrub-text`). */
export function scrubWords(value: Rich): SafeHtml {
  let i = 0;
  const words: SafeHtml[] = [];
  for (const p of parts(value)) {
    const text = typeof p === "string" ? p : "em" in p ? p.em : p.strong;
    const isEm = typeof p !== "string" && "em" in p;
    for (const token of text.split(/(\s+)/)) {
      if (token === "") continue;
      if (/^\s+$/.test(token)) {
        words.push(html` `);
        continue;
      }
      const index = i++;
      words.push(
        isEm
          ? html`<em class="sw" style="--i:${index}">${token}</em>`
          : html`<span class="sw" style="--i:${index}">${token}</span>`,
      );
    }
  }
  return html`<span class="sr-only">${plainText(value)}</span><span class="sw-wrap" aria-hidden="true" style="--n:${i}">${words}</span>`;
}
