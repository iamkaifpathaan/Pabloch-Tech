import type { Project } from "../lib/types.ts";
import { shots } from "./shots.ts";

/**
 * Selected work. Facts carried over from the previous live site.
 * Preview builds are labelled as previews everywhere they appear:
 * unpaid, unpublished, built on spec.
 */
export const featured: Project = {
  id: "al-abuzer",
  index: "01",
  name: "Al-Abuzer Perfumes",
  sector: "Online store · Fragrance retail",
  status: "live",
  summary: [
    "A complete storefront for a perfume house — eight collections, cart and checkout, customer accounts and order tracking — opening on a ",
    { em: "full-bleed product video" },
    ", because a fragrance brand sells on atmosphere before it sells on price.",
  ],
  features: ["Cart & checkout", "8 collections", "Order tracking", "Customer accounts", "Product search", "Downloadable catalogue"],
  link: { label: "alabuzerperfumes.com", href: "https://alabuzerperfumes.com" },
  desktop: shots.alabuzerHero,
};

export const previews: readonly Project[] = [
  {
    id: "cleaning-queens",
    index: "02",
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
  },
  {
    id: "oak-tree",
    index: "03",
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
  },
  {
    id: "dean-the-decorator",
    index: "04",
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
  },
];

export const workIntro = {
  title: "Selected work",
  lede: "One storefront live in production. Three preview builds made on spec — our own time, no brief, no deposit — to show local businesses what their site could be.",
  previewNote:
    "Preview builds are unpaid and unpublished. None sits on the business’s own domain, and each still carries a banner saying it’s a design preview.",
} as const;
