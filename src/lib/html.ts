/**
 * Tiny, dependency-free HTML templating for the static build.
 *
 * Every interpolated value is escaped unless it is already `SafeHtml`
 * (the output of another `html` template, or an explicit `trusted()` call
 * for static, hand-written markup such as SVG icons). Content strings from
 * `src/content/*` therefore can never inject markup into the page.
 */

const ESCAPES: Readonly<Record<string, string>> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => ESCAPES[ch] ?? ch);
}

export class SafeHtml {
  constructor(readonly value: string) {}
  toString(): string {
    return this.value;
  }
}

export type Child = SafeHtml | string | number | boolean | null | undefined | readonly Child[];

function renderChild(child: Child): string {
  if (child === null || child === undefined || child === false || child === true) return "";
  if (child instanceof SafeHtml) return child.value;
  if (Array.isArray(child)) return (child as readonly Child[]).map(renderChild).join("");
  return escapeHtml(String(child));
}

/** Tagged template: `html\`<p>${userText}</p>\`` — interpolations are escaped. */
export function html(strings: TemplateStringsArray, ...values: readonly Child[]): SafeHtml {
  let out = strings[0] ?? "";
  values.forEach((value, i) => {
    out += renderChild(value) + (strings[i + 1] ?? "");
  });
  return new SafeHtml(out);
}

/** Mark a *static, hand-written* string as safe. Never pass content or user data. */
export function trusted(markup: string): SafeHtml {
  return new SafeHtml(markup);
}

type AttrValue = string | number | boolean | null | undefined;

/** Render an attribute list. `true` → bare attribute, `false`/nullish → omitted. */
export function attrs(record: Readonly<Record<string, AttrValue>>): SafeHtml {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(record)) {
    if (value === false || value === null || value === undefined) continue;
    if (!/^[a-zA-Z_:][-a-zA-Z0-9_:.]*$/.test(key)) throw new Error(`Invalid attribute name: ${key}`);
    parts.push(value === true ? key : `${key}="${escapeHtml(String(value))}"`);
  }
  return new SafeHtml(parts.join(" "));
}

export function join(items: readonly Child[], separator: Child = ""): SafeHtml {
  const sep = renderChild(separator);
  return new SafeHtml(items.map(renderChild).join(sep));
}

/** Collapse whitespace between tags so the shipped HTML stays compact. */
export function minifyHtml(markup: string): string {
  return markup
    .replace(/\n\s+/g, "\n")
    .replace(/>\s+</g, (m) => (m.includes("\n") ? ">\n<" : "> <"))
    .trim();
}
