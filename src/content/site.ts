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
  title: "Pabloch Tech — Independent digital product & experience studio",
  description:
    "Pabloch Tech designs and hand-builds websites, online stores and the product features behind them. Every line written by hand — and your first working draft is built before you pay.",
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

  /** Markets the studio sells into. Used for structured data only. */
  areaServed: ["United States", "United Kingdom", "United Arab Emirates", "India"],
} as const;

export type SocialKey = keyof typeof site.socials;

export const socialLinks: ReadonlyArray<{ key: SocialKey; label: string; base: string }> = [
  { key: "telegram", label: "Telegram", base: "https://t.me/" },
  { key: "instagram", label: "Instagram", base: "https://instagram.com/" },
  { key: "facebook", label: "Facebook", base: "https://facebook.com/" },
];

export const nav = [
  { id: "work", label: "Work" },
  { id: "services", label: "Services" },
  { id: "process", label: "Process" },
  { id: "studio", label: "Studio" },
  { id: "contact", label: "Contact" },
] as const;
