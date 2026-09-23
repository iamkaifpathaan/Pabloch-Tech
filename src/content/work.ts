import type { Project } from "../lib/types.ts";
import { shots } from "./shots.ts";

/**
 * Selected work. Every project is labelled for exactly what it is:
 *   live    — a client's site, in production
 *   concept — self-initiated, designed and built on our own time
 *   preview — unpaid, unpublished spec builds for real local businesses
 */

/** 01 — the headline: gets the pinned, full-screen scroll moment. */
export const featured: Project = {
  id: "royal-compass",
  index: "01",
  name: "Royal Compass Travels",
  sector: "Luxury travel planning",
  status: "concept",
  summary: [
    "A concept site for a luxury travel planner, built around one line — ",
    { em: "every journey begins with a direction" },
    ". A compass reads out heading and coordinates for every destination, and a six-step trip planner takes the place of a contact form.",
  ],
  features: ["Live compass & coordinates", "Six-step trip planner", "Destination selector", "Planning tiers", "Destination gallery"],
  link: { label: "royalcompasstravels.netlify.app", href: "https://royalcompasstravels.netlify.app" },
  desktop: shots.rctHero,
  portrait: shots.rctPortrait,
  words: ["Royal", "Compass"],
};

/** The live store — also the subject of the case study. */
export const alAbuzer: Project = {
  id: "al-abuzer",
  index: "02",
  name: "Al-Abuzer Perfumes",
  sector: "Online store · Fragrance retail",
  status: "live",
  summary: [
    "A complete storefront for a perfume house — eight collections, cart and checkout, customer accounts and order tracking — opening on a ",
    { em: "full-bleed product video" },
    ", because a fragrance brand sells on atmosphere before it sells on price.",
  ],
  features: ["Cart & checkout", "8 collections", "Order tracking", "Customer accounts", "Product search", "Downloadable catalogue"],
  link: { label: "Visit alabuzerperfumes.com", href: "https://alabuzerperfumes.com" },
  more: [{ label: "Read the case study", href: "#case-study" }],
  desktop: shots.alabuzerDesktop,
  mobile: shots.alabuzerTablet,
  mobileKind: "tablet",
  layout: "a",
};

export const previews: readonly Project[] = [
  {
    id: "cleaning-queens",
    index: "03",
    name: "The Cleaning Queens",
    sector: "Cleaning",
    location: "Sylvania & Toledo, Ohio",
    status: "preview",
    summary: [
      "Nineteen years, six staff, 5.0 stars across 69 reviews — and a Google listing whose Website button pointed at a parked domain. An ",
      { em: "instant estimator" },
      " answers “how much for a 3-bed deep clean?” on screen, so every enquiry arrives with a price already attached.",
    ],
    features: ["Instant estimator", "Booking form", "Reviews from two platforms"],
    link: { label: "Open the preview", href: "https://cleaningqueens-preview.netlify.app" },
    desktop: shots.cqDesktop,
    mobile: shots.cqMobile,
    layout: "b",
  },
  {
    id: "oak-tree",
    index: "04",
    name: "Oak Tree Garden Maintenance",
    sector: "Landscaping",
    location: "Heanor, Derbyshire",
    status: "preview",
    summary: [
      "Thirty-two reviews, every one five stars, on the county council’s Trusted Trader register — and a website link pointing at a domain with no DNS record at all. The quote form ",
      { em: "takes photos" },
      ", so an enquiry arrives with pictures of the actual garden.",
    ],
    features: ["Photo-upload quote form", "The crew, by name", "Recent work"],
    link: { label: "Open the preview", href: "https://oaktree-preview.netlify.app" },
    desktop: shots.oakDesktop,
    mobile: shots.oakMobile,
    layout: "c",
  },
  {
    id: "dean-the-decorator",
    index: "05",
    name: "Dean the Decorator",
    sector: "Painting & decorating",
    location: "Ilkeston, Derbyshire",
    status: "preview",
    summary: [
      "Fifty five-star reviews across thirteen years — and one line among nine near-identical decorators on the council’s directory. Nothing was broken; the problem was ",
      { em: "being indistinguishable" },
      ". So the page is built around the four words his reviewers keep repeating.",
    ],
    features: ["Written quote request", "Reviews quoted verbatim", "Built to stand out"],
    link: { label: "Open the preview", href: "https://dean-preview.netlify.app" },
    desktop: shots.deanDesktop,
    mobile: shots.deanMobile,
    layout: "a",
  },
];

/** Everything after the headline, in order. */
export const moreWork: readonly Project[] = [alAbuzer, ...previews];

export const allWork: readonly Project[] = [featured, ...moreWork];

export const statusLabel: Readonly<Record<Project["status"], string>> = {
  live: "Live in production",
  concept: "Concept · self-initiated",
  preview: "Preview · not published",
};

export const workIntro = {
  title: "Selected work",
  lede: "A self-initiated concept, a storefront live in production, and three preview builds made on spec — our own time, no brief, no deposit — to show local businesses what their site could be.",
  previewNote:
    "Royal Compass Travels is our own concept, not a client commission. The three previews are unpaid and unpublished: none sits on the business’s own domain, and each still carries a banner saying it’s a design preview.",
} as const;
