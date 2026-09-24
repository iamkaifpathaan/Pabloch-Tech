import { PENDING, type Fact, type Principle, type ProofItem, type Rich } from "../lib/types.ts";
import { alAbuzer, featured, previews } from "./work.ts";

/* ------------------------------------------------------------------ */
/*  Intro statement                                                    */
/* ------------------------------------------------------------------ */

export const introStatement: Rich = [
  "Pabloch Tech is a small, independent studio. We design in the browser, write ",
  { em: "every line by hand" },
  ", and put a working draft in your hands before any money changes hands. No templates, no page builders, no account managers — just the person building your product, answering your email.",
];

export const introNotes = [
  {
    label: "What we make",
    body: "Websites, online stores, landing pages — and the tools inside them: estimators, booking flows, photo-upload quote forms.",
  },
  {
    label: "Who it’s for",
    body: "Businesses that would rather judge the work than the pitch.",
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Why Pabloch — real differentiators only                            */
/* ------------------------------------------------------------------ */

export const principles: readonly Principle[] = [
  {
    title: ["The draft ", { em: "comes first." }],
    body: "Most studios want a deposit before you’ve seen a pixel. We build a working first draft for free and let the work make the argument. Don’t like it? You owe nothing.",
  },
  {
    title: ["You talk to the person ", { em: "writing the code." }],
    body: "No account manager passing your message down a chain, no ticket number, no portal to log into. You email or message one person, and that person makes the change.",
  },
  {
    title: ["Written by hand, ", { em: "not assembled." }],
    body: "No Wix, no Squarespace, no WordPress theme carrying forty plugins. Pages load fast, and there’s nothing to break itself during an update at 3am.",
  },
  {
    title: ["You own ", { em: "all of it." }],
    body: "The site, the code and the domain are yours — the domain registered in your name from day one. Leave whenever you like and we hand over the files.",
  },
];

/* ------------------------------------------------------------------ */
/*  Capability manifesto                                               */
/* ------------------------------------------------------------------ */

export const manifestoLines: readonly Rich[] = [
  "No templates.",
  "No page builders.",
  "No forty plugins.",
];

export const manifestoCoda: Rich = [
  "Just hand-written HTML, CSS and JavaScript — and ",
  { em: "a real back end" },
  " when a store needs one.",
];

export const capabilities = [
  {
    group: "Design",
    items: ["Custom UI & UX design", "Mobile-first, responsive layouts", "Copy & content structure", "Working drafts in the browser"],
  },
  {
    group: "Build",
    items: ["Hand-written HTML, CSS & JavaScript", "Back ends for online stores", "Cart, checkout & payment gateways", "Customer accounts & order tracking"],
  },
  {
    group: "Product",
    items: ["Instant estimators", "Booking & enquiry flows", "Photo-upload quote forms", "Search, filters & catalogues"],
  },
  {
    group: "Launch & care",
    items: ["Performance optimisation", "SEO foundations & analytics", "Hosting, domain & SSL", "Ongoing care & small edits"],
  },
] as const;

export const marqueeWords = [
  "Checkout",
  "Order tracking",
  "Estimators",
  "Booking flows",
  "Catalogues",
  "Landing pages",
  "SEO",
  "Performance",
  "Care",
] as const;

/* ------------------------------------------------------------------ */
/*  Case study — Al-Abuzer Perfumes                                    */
/* ------------------------------------------------------------------ */

export const caseStudy = {
  project: alAbuzer,
  headline: ["Selling ", { em: "atmosphere" }, ", online."] as Rich,
  meta: [
    { label: "Client", value: "Al-Abuzer Perfumes" },
    { label: "Sector", value: "Fragrance retail" },
    { label: "Scope", value: "Design, full-stack build, launch" },
    { label: "Status", value: "Live in production" },
  ],
  chapters: [
    {
      label: "The brief",
      body: "A perfume house with a catalogue that runs from attar roll-ons and oudh to bakhoor, body mists and travel sets — and a brand that sells on atmosphere before it sells on price.",
    },
    {
      label: "The problem",
      body: "Eight distinct collections, each with its own customer. A store that had to feel luxurious without feeling slow. And the question every small store gets by email: where is my order?",
    },
  ],
  moves: [
    {
      title: "Open on atmosphere",
      body: "The homepage opens on a full-bleed product video. Price comes second; the feeling comes first.",
    },
    {
      title: "Make a big catalogue easy",
      body: "Eight collections, each with its own catalogue page, product search, and a catalogue customers can download.",
    },
    {
      title: "Answer the question before it’s asked",
      body: "Customers follow their order on a tracking page instead of emailing to ask where it is.",
    },
    {
      title: "Give customers a reason to return",
      body: "Customer accounts, sale pricing and combo packs, all running on the store’s own checkout.",
    },
  ],
  collections: [
    "Attar Roll On",
    "Oudh Collection",
    "Perfume 75ml",
    "Body Mist",
    "Bakhoor",
    "Air Freshener",
    "Travelling Collection",
    "Combo Packs",
  ],
  built: ["Cart & checkout", "Customer accounts", "Order tracking", "Product search", "Downloadable catalogue", "Full-bleed video hero"],
  /** Not supplied yet — shown in dev builds only. */
  results: PENDING,
  clientWords: PENDING,
} as const;

/* ------------------------------------------------------------------ */
/*  Proof (in place of testimonials — there are none to show yet)      */
/* ------------------------------------------------------------------ */

export const proofIntro =
  "We don’t have a wall of quotes to show you yet, and we won’t write one. Here’s what you can check for yourself instead.";

export const proof: readonly ProofItem[] = [
  {
    claim: "A live store you can open right now.",
    detail: "Browse it, search it, add something to the cart. It’s in production.",
    links: [{ label: "alabuzerperfumes.com", href: alAbuzer.link.href }],
  },
  {
    claim: "Four more builds you can open on your phone.",
    detail: "One self-initiated concept and three previews built on spec before anybody asked — each labelled for exactly what it is.",
    links: [featured, ...previews].map((p) => ({ label: p.name, href: p.link.href })),
  },
  {
    claim: "A fixed price, in writing, before work starts.",
    detail: "Starting prices from $400. The number you agree is the number you pay.",
  },
  {
    claim: "Pay in two halves — after you’ve seen it.",
    detail: "50% once you approve the draft, 50% on launch day. Bank transfer, Wise, Payoneer or PayPal, invoiced in USD, GBP, AED or INR.",
  },
  {
    claim: "Two full revision rounds, included.",
    detail: "Small tweaks after that don’t get invoiced. A third redesign in a new direction is a new job, and quoted as one.",
  },
];

export const facts: readonly Fact[] = [
  { value: "6", label: "Builds designed & built" },
  { value: "100%", label: "Hand-written code" },
  { value: "24h", label: "Reply time, every time" },
  { value: "$0", label: "Until you’ve seen the draft" },
];

/* ------------------------------------------------------------------ */
/*  About                                                              */
/* ------------------------------------------------------------------ */

export const about = {
  title: ["Small ", { em: "on purpose." }] as Rich,
  paragraphs: [
    "Pabloch Tech is an independent studio based in India, working US and UK business hours. There’s no account manager passing your message down a chain and no offshore team you never meet — you’ll be talking to the person designing and writing your product.",
    "We keep the list of clients short so each one gets properly looked after. Your morning is our evening: messages sent overnight are answered before you’re back at your desk.",
  ],
  details: [
    { label: "Based in", value: "India" },
    { label: "Hours", value: "US & UK business hours" },
    { label: "Talk to us", value: "Email, Telegram, Instagram, Facebook — or Zoom / Google Meet" },
    { label: "Reply time", value: "Within 24 hours" },
    { label: "You own", value: "The site, the code, the domain" },
  ],
  /** Founder name & portrait have not been supplied — dev builds only. */
  founder: PENDING,
} as const;
