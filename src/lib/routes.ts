import { env } from "./env.ts";

/**
 * Every page on the site. `path` is relative to the site root and always ends
 * in "/" (or is "" for the home page), so each page is written to
 * `<path>index.html` and served at a clean URL like /work/.
 */
export type PageId = "home" | "work" | "case-study" | "services" | "process" | "studio" | "contact";

export interface Route {
  id: PageId;
  path: string;
  /** Label used in the navigation and breadcrumbs. */
  label: string;
}

export const routes: Readonly<Record<PageId, Route>> = {
  home: { id: "home", path: "", label: "Home" },
  work: { id: "work", path: "work/", label: "Work" },
  "case-study": { id: "case-study", path: "work/renewal-tracker/", label: "Renewal Tracker" },
  services: { id: "services", path: "services/", label: "Services" },
  process: { id: "process", path: "process/", label: "Process" },
  studio: { id: "studio", path: "studio/", label: "Studio" },
  contact: { id: "contact", path: "contact/", label: "Contact" },
};

/** Primary navigation, in order. */
export const navRoutes: readonly Route[] = [routes.work, routes.services, routes.process, routes.studio, routes.contact];

/**
 * Resolve a site-root path ("/work/", "/contact/#brief", "/") to a URL that
 * works from the page being rendered. Pages use relative URLs (so the site
 * also works from a sub-folder or a local preview); the 404 page, which can be
 * served at any URL, keeps root-absolute ones. Anything that isn't a
 * root path (https://…, mailto:, #hash) is returned untouched.
 */
export function href(target: string): string {
  if (!target.startsWith("/") || target.startsWith("//")) return target;
  if (env.base === "/") return target;
  const [pathPart = "", hash = ""] = target.slice(1).split("#");
  const depth = env.page === "" ? 0 : env.page.split("/").filter(Boolean).length;
  const up = "../".repeat(depth);
  let rel = up + pathPart;
  if (rel === "") rel = "./";
  return hash ? `${rel}#${hash}` : rel;
}

/** Root path of a route, for href(). */
export const to = (id: PageId, hash?: string): string => `/${routes[id].path}${hash ? `#${hash}` : ""}`;

/** Absolute public URL of a route (canonical links, sitemap, structured data). */
export const absoluteUrl = (siteUrl: string, id: PageId): string => `${siteUrl}${routes[id].path}`;
