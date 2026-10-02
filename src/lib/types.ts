/** Shared content types. Content lives in `src/content/*`; components render it. */

/** Inline rich text: plain strings, serif-italic emphasis, strong, or a link. */
export type RichPart =
  | string
  | { readonly em: string }
  | { readonly strong: string }
  | { readonly a: string; readonly href: string };
export type Rich = string | readonly RichPart[];

export type Theme = "ink" | "paper";

/** A responsive screenshot, pre-encoded to AVIF + WebP at each width in `/assets/work/`. */
export interface Shot {
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly widths: readonly number[];
  readonly alt: string;
}

export interface ExternalLink {
  readonly label: string;
  readonly href: string;
}

/** live = a client's site in production · product = our own product, live · preview = unpaid spec build for a real business · concept = self-initiated */
export type ProjectStatus = "live" | "product" | "preview" | "concept";

export type ProjectLayout = "a" | "b" | "c";

export interface Project {
  readonly id: string;
  readonly index: string;
  readonly name: string;
  readonly sector: string;
  readonly location?: string;
  readonly status: ProjectStatus;
  readonly summary: Rich;
  readonly features: readonly string[];
  readonly link: ExternalLink;
  /** Extra in-page links, e.g. to the case study. */
  readonly more?: readonly ExternalLink[];
  readonly desktop: Shot;
  /** Portrait crop used instead of `desktop` on phones (art direction). */
  readonly portrait?: Shot;
  /** Secondary screenshot that overlaps the main one. */
  readonly mobile?: Shot;
  readonly mobileKind?: "phone" | "tablet";
  readonly layout?: ProjectLayout;
  /** The two words that split apart behind the featured project. */
  readonly words?: readonly [string, string];
}

export interface Service {
  readonly id: string;
  readonly name: string;
  readonly line: string;
  readonly includes: readonly string[];
  readonly price: string;
  /** Lowest published price in USD, for structured data. Omit when quoted per project. */
  readonly fromUSD?: number;
  readonly preview?: Shot;
}

export interface ProcessStep {
  readonly id: string;
  readonly name: string;
  readonly when: string;
  readonly body: string;
  readonly outcome: string;
}

export interface Principle {
  readonly title: Rich;
  readonly body: string;
}

export interface ProofItem {
  readonly claim: string;
  readonly detail: string;
  readonly links?: readonly ExternalLink[];
}

export interface Fact {
  readonly value: string;
  readonly label: string;
}

/**
 * Marker for information we do not have yet. The brief forbids inventing it.
 * Rendered visibly only in development builds (`npm run dev`), omitted in
 * production so the live site never shows a placeholder.
 */
export const PENDING = "[CONTENT TO BE PROVIDED]" as const;
export type Pending = typeof PENDING;

/* ------------------------------------------------------------------ */
/*  Long-form pages (legal, journal)                                   */
/* ------------------------------------------------------------------ */

/** One block of long-form copy. `h2` blocks carry an id and form the table of contents. */
export type Block =
  | { readonly h2: string; readonly id: string }
  | { readonly h3: string }
  | { readonly p: Rich }
  | { readonly ul: readonly Rich[] }
  | { readonly ol: readonly Rich[] }
  | { readonly note: Rich };

export interface LongformDoc {
  /** URL segment: /<section>/<slug>/ */
  readonly slug: string;
  /** Visible H1. */
  readonly title: string;
  /** <title> and social title. Keep under ~60 characters. */
  readonly metaTitle: string;
  /** Meta description. Keep under ~160 characters. */
  readonly description: string;
  readonly lede: Rich;
  /** ISO date (YYYY-MM-DD) the text last changed. */
  readonly updated: string;
  readonly blocks: readonly Block[];
}

export interface Post extends LongformDoc {
  /** ISO date first published. */
  readonly published: string;
  readonly category: string;
  /** Short answers shown above the article — quotable on their own. */
  readonly takeaways: readonly string[];
  /** Questions answered in the article, also emitted as FAQPage data. */
  readonly faq?: readonly { readonly q: string; readonly a: string }[];
}
