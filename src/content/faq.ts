import type { Rich } from "../lib/types.ts";
import { site } from "./site.ts";

/**
 * Frequently asked questions. Rendered as a visible section on the home page
 * and as FAQPage structured data, so the two can never disagree. Every answer
 * restates facts published elsewhere on the site — nothing new is promised here.
 * Answers open with the direct answer, so search and AI engines can quote the
 * first sentence on its own.
 */
export interface FaqItem {
  readonly id: string;
  readonly q: string;
  readonly a: Rich;
}

export const faqIntro =
  "Straight answers to what people ask before they get in touch. Anything else — just ask.";

export const faq: readonly FaqItem[] = [
  {
    id: "what-is-pabloch",
    q: "What is Pabloch Tech?",
    a: `${site.oneLine} The studio is based in India and works US and UK business hours.`,
  },
  {
    id: "cost",
    q: "How much does a website cost?",
    a: [
      "Websites start from ",
      { strong: "$400" },
      ", with growth builds from $700. Online stores start from ",
      { strong: "$1,200" },
      ". Landing pages and custom features such as estimators or booking flows are quoted per project. Whatever the job, you get a fixed price in writing before the paid build starts — the number you agree is the number you pay.",
    ],
  },
  {
    id: "pay-before",
    q: "Do I have to pay before I see anything?",
    a: "No. We build a working first draft of your site for free — real layout, your services, your words. If it isn’t right, you owe nothing. You pay a 50% deposit only after you approve the draft, and the remaining 50% on launch day.",
  },
  {
    id: "payment",
    q: "How do I pay?",
    a: `${site.payments.summary} Your card details go to PayPal and are never shared with us, and every invoice is in ${site.payments.currencyLabel}. You pay in two halves: 50% when you approve the draft, 50% on launch day.`,
  },
  {
    id: "timeline",
    q: "How long does it take to build a website?",
    a: "The free first draft usually takes a few days. After you approve it, the production build takes 1–2 weeks for a website and 3–5 weeks for an online store, depending on how quickly your content arrives.",
  },
  {
    id: "ownership",
    q: "Who owns the website when it’s finished?",
    a: "You do — the site, the code and the domain. The domain is registered in your name from day one, and if you ever want to move on, we hand over all the files.",
  },
  {
    id: "no-templates",
    q: "Do you use WordPress, Wix, Squarespace or templates?",
    a: "No. Every site is designed from scratch and written by hand in HTML, CSS and JavaScript, with a real back end when a store needs one. There are no page builders or plugin stacks to slow it down or break during an update.",
  },
  {
    id: "where",
    q: "Do you work with businesses in the US and UK?",
    a: "Yes — most of our clients are in the United States and the United Kingdom. The studio is based in India and works US and UK business hours, replies within 24 hours, and messages sent overnight are answered before you’re back at your desk.",
  },
  {
    id: "revisions",
    q: "How many revisions are included?",
    a: "Two full revision rounds are included in every project. Small tweaks after that aren’t invoiced; only a redesign in a completely new direction is quoted as a new job.",
  },
  {
    id: "stores",
    q: "Can you build an online store with checkout and order tracking?",
    a: [
      "Yes. Stores include a product catalogue, cart, checkout with a payment gateway, customer accounts, order tracking and search — on a storefront you own rather than rent. ",
      { a: "Al-Abuzer Perfumes", href: "https://alabuzerperfumes.com" },
      " is a live example you can browse today.",
    ],
  },
  {
    id: "seo",
    q: "Will my website show up on Google?",
    a: "Every build includes SEO foundations — clean semantic markup, fast load times on phones, page titles and descriptions, structured data and analytics — so search engines can understand and rank the site. Rankings depend on your market and content, so we don’t promise positions, but we build every site to be found.",
  },
  {
    id: "care",
    q: "Do you look after the website after launch?",
    a: "If you’d like us to. Optional Website Care keeps hosting, SSL and the domain renewed, monitors your forms so no enquiry goes missing, and covers small edits — just send an email. It’s quoted per site, and you’re free to take the files and manage it yourself instead.",
  },
  {
    id: "talk",
    q: "Who will I actually be talking to?",
    a: "The person designing and writing your product. There’s no account manager or ticket system — you email or message one person by email, Telegram, Instagram or Facebook, or talk on Zoom or Google Meet, and that person makes the change.",
  },
];
