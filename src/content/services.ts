import type { Service } from "../lib/types.ts";
import { shots } from "./shots.ts";

/** Services and starting prices. Websites, stores and care as published on the previous site; motion graphics added 2026-10-15. */
export const services: readonly Service[] = [
  {
    id: "websites",
    name: "Websites",
    line: "The site people find after they’ve heard your name — built to turn a search into a phone call, not to win a design award.",
    includes: [
      "Custom design — no templates",
      "Services, areas and hours laid out clearly",
      "Your reviews pulled into one place",
      "Enquiry forms landing straight in your inbox",
      "Fast on a phone, on a bad connection",
      "SEO foundations and analytics",
    ],
    price: "From $400 · growth builds from $700",
    fromUSD: 400,
    preview: shots.deanDesktop,
  },
  {
    id: "online-stores",
    name: "Online stores",
    line: "A storefront you own outright, with cart, checkout and order tracking built in — not rented from a platform taking a cut of every sale.",
    includes: [
      "Product catalogue and collections",
      "Cart, checkout and payment gateway",
      "Order management and confirmations",
      "Customer accounts and order tracking",
      "Search, filters and bundles",
      "Shipping and tax configuration",
    ],
    price: "From $1,200",
    fromUSD: 1200,
    preview: shots.alabuzerDesktop,
  },
  {
    id: "landing-pages",
    name: "Landing pages",
    line: "One page with one job: turn an ad click, a flyer QR code or a Google listing into a name and a number you can call back.",
    includes: [
      "Written to convert, not to look busy",
      "Quote calculator or booking flow",
      "Spam-filtered forms, no submission limits",
      "Live in days, not months",
    ],
    price: "Quoted per project",
    preview: shots.oakDesktop,
  },
  {
    id: "product-features",
    name: "Product features",
    line: "The tools inside the site — built from scratch around how the business actually works, not bolted on from a plugin directory.",
    includes: [
      "Instant estimators and price calculators",
      "Booking and enquiry flows",
      "Photo-upload quote forms",
      "Customer portals and dashboards",
    ],
    price: "Quoted per feature",
    preview: shots.cqEstimator,
  },
  {
    id: "motion-graphics",
    name: "Motion graphics videos",
    line: "Reels and Shorts that stop the scroll — kinetic text, animated diagrams and mock-ups, made in code by the engine behind our own 90-reel channel.",
    includes: [
      "Instagram Reels, YouTube Shorts & TikToks (9:16)",
      "Kinetic text and animated icons & diagrams",
      "Quizzes, explainers, myth-busters & buying guides",
      "Animated phone, browser & app mock-ups",
      "English AI voiceover — or music only",
      "Captions that match the voice",
      "Original music & sound effects, no copyright claims",
      "Cover image, plus a 16:9 version on request",
    ],
    price: "From $21 per reel · monthly pack $199 · custom quotes",
    fromUSD: 21,
    preview: shots.motionReels,
  },
  {
    id: "care",
    name: "Website care",
    line: "The part most people skip. A website nobody maintains is out of date within a year and invisible within two.",
    includes: [
      "Hosting, SSL and domain kept renewed",
      "Forms monitored so no enquiry goes missing",
      "New reviews, prices and photos added as they come",
      "Small edits included — just send an email",
    ],
    price: "Optional · quoted per site",
  },
];
