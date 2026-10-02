/**
 * Site-wide facts. Everything here is taken from the previous live site
 * (rev 5) or confirmed by the owner — nothing is invented.
 *
 * Runtime settings (Web3Forms key, handles) still come from /config.js,
 * which the build never reads or writes. The handles below are only the
 * server-rendered defaults so the page works with JavaScript switched off.
 */
export const site = {
  name: "Pabloch Tech",
  shortName: "Pabloch",
  url: "https://projects.pablochtech.com/",
  /** Home <title>: brand + what people actually search for, under ~60 characters. */
  title: "Pabloch Tech — Custom Websites & Online Stores, Hand-Built",
  description:
    "Hand-built custom websites, online stores and landing pages for US & UK businesses. Fixed prices from $400 — and a free working draft before you pay.",
  /** One-sentence definition, used wherever the studio is described in a single line (schema, llms.txt, FAQ). */
  oneLine:
    "Pabloch Tech is an independent digital product studio that designs and hand-builds high-performance websites, e-commerce stores and custom digital tools for businesses, with a “working draft before you pay” approach.",
  ogImage: "og-studio.jpg",
  ogImageAlt: "Pabloch Tech — digital products, crafted line by line.",
  themeColor: "#0B0B0C",
  locale: "en",
  positioning: "Independent digital product & experience studio",

  email: "hello@pablochtech.com",
  socials: {
    telegram: "pablochtech",
    instagram: "pablochtech",
    facebook: "pablochtech",
  },

  studio: {
    base: "India",
    timeZone: "Asia/Kolkata",
    timeZoneLabel: "IST",
    hours: "Working US & UK business hours",
    replyTime: "Within 24 hours",
  },

  /**
   * How clients pay. One source of truth for the Proof section, FAQ, Terms
   * and llms.txt. Every invoice is paid through PayPal.
   */
  payments: {
    method: "PayPal",
    summary:
      "Invoices are paid securely through PayPal — by credit card, debit card or PayPal balance, with no PayPal account needed to pay by card.",
    currencies: ["USD", "GBP"],
    currencyLabel: "US dollars or pounds sterling",
  },

  /** Markets the studio sells into. Used for structured data only. */
  areaServed: ["United States", "United Kingdom", "United Arab Emirates", "India"],
} as const;

export type SocialKey = keyof typeof site.socials;

export const socialLinks: ReadonlyArray<{ key: SocialKey; label: string; base: string }> = [
  { key: "telegram", label: "Telegram", base: "https://t.me/" },
  { key: "instagram", label: "Instagram", base: "https://instagram.com/" },
  { key: "facebook", label: "Facebook", base: "https://facebook.com/" },
];

/** Pages outside the main navigation. `path` is relative to the site root. */
export const pages = {
  blog: { path: "blog/", label: "Journal" },
  faq: { path: "#faq", label: "FAQ" }, // a section of the home page
} as const;

export const legalPages = [
  { slug: "privacy", label: "Privacy policy" },
  { slug: "terms", label: "Terms of service" },
  { slug: "cookies", label: "Cookie policy" },
  { slug: "disclaimer", label: "Portfolio disclaimer" },
] as const;

export type LegalSlug = (typeof legalPages)[number]["slug"];
