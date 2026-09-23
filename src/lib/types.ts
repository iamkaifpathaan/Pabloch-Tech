/** Shared content types. Content lives in `src/content/*`; components render it. */

/** Inline rich text: plain strings, serif-italic emphasis, or strong. */
export type RichPart = string | { readonly em: string } | { readonly strong: string };
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

export type ProjectStatus = "live" | "preview";

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
  readonly desktop: Shot;
  readonly mobile?: Shot;
}

export interface Service {
  readonly id: string;
  readonly name: string;
  readonly line: string;
  readonly includes: readonly string[];
  readonly price: string;
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
