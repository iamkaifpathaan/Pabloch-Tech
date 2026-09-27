import type { LegalSlug } from "./site.ts";
import { site } from "./site.ts";
import type { LongformDoc } from "../lib/types.ts";

/**
 * Legal pages. Written for how this site and studio actually work:
 *   - no cookies, analytics, pixels or third-party embeds (see the CSP in document.ts)
 *   - the contact form posts to Web3Forms, which emails the brief to the studio
 *   - the site is hosted on Hostinger; fonts are self-hosted
 *   - clients pay through PayPal
 * If any of that changes, change these pages in the same commit.
 *
 * Plain English first: every page opens with a summary a client can read in
 * thirty seconds. Have a qualified lawyer review before relying on them.
 */

/** Bump when the wording of any legal page changes. */
export const LEGAL_UPDATED = "2026-09-27";

const email = site.email;
const mail = { a: email, href: `mailto:${email}` } as const;

export const privacy: LongformDoc = {
  slug: "privacy",
  title: "Privacy policy",
  metaTitle: "Privacy Policy — Pabloch Tech",
  description:
    "How Pabloch Tech collects, uses and protects personal data. No cookies, no trackers, no selling of data — plus your GDPR, CCPA and DPDP rights.",
  lede: "We collect as little as possible, use it only to reply to you and deliver your project, and never sell it. This page explains exactly what that means.",
  updated: LEGAL_UPDATED,
  blocks: [
    { h2: "The short version", id: "summary" },
    {
      ul: [
        "This website sets no cookies and runs no analytics, advertising pixels or third-party trackers.",
        "If you send us a project brief, we use what you write to reply, prepare a proposal and — if you go ahead — deliver the project.",
        "We never sell or rent personal data, and we never share it for advertising.",
        ["You can ask to see, correct or delete your data at any time by emailing ", mail, "."],
      ],
    },

    { h2: "Who we are", id: "who" },
    {
      p: [
        "Pabloch Tech (“Pabloch”, “we”, “us”) is an independent digital product studio based in India. We are the data controller for the personal data described in this policy. You can reach us about anything privacy-related at ",
        mail,
        ".",
      ],
    },
    {
      p: "This policy covers this website (projects.pablochtech.com), enquiries you send us, and the personal data we handle while delivering a project for you. Our Renewal Tracker app has its own privacy information, provided with the app.",
    },

    { h2: "What we collect", id: "collect" },
    { h3: "When you send a project brief" },
    {
      p: "The contact form asks for your name and email address and a message, and optionally your company, project type, budget range and how you’d like to talk. We only receive what you type. The form also contains a hidden field that helps filter out spam bots.",
    },
    { h3: "When you email or message us" },
    {
      p: "If you contact us by email, Telegram, Instagram or Facebook, or join a Zoom or Google Meet call, we receive whatever you share there — typically your name, contact details and what you tell us about your business.",
    },
    { h3: "When you become a client" },
    {
      p: "To deliver and invoice a project we keep your contact and billing details, the content you supply for your site (text, images, logos), project correspondence, and any account access you choose to give us — for example to your domain registrar or hosting — which we use only for your project.",
    },
    { h3: "When you simply visit" },
    {
      p: "Like every web server, our host automatically records basic technical data for each request — IP address, browser type, the page requested and the time — in server logs used for security and keeping the site running. We don’t use these logs to profile visitors, and we don’t combine them with anything else.",
    },
    { note: "We do not collect special-category data (such as health or religious information), and we ask you not to send it to us." },

    { h2: "How we use it, and why we’re allowed to", id: "use" },
    {
      ul: [
        [{ strong: "To reply to your enquiry and prepare a proposal or free draft" }, " — because you asked us to (steps before entering into a contract)."],
        [{ strong: "To deliver, support and invoice your project" }, " — to perform our contract with you."],
        [{ strong: "To keep business, tax and accounting records" }, " — because the law requires it."],
        [{ strong: "To keep the website and our systems secure" }, " — our legitimate interest in preventing abuse and spam."],
      ],
    },
    { p: "We don’t use your data for automated decision-making or profiling, and we don’t send marketing emails. If you ever receive an email from us, it’s a reply to you or about your project." },

    { h2: "Who we share it with", id: "share" },
    { p: "We use a small number of trusted service providers to run the studio. They process data on our behalf, only for the purposes below:" },
    {
      ul: [
        [{ strong: "Web3Forms" }, " — delivers contact-form submissions to our inbox."],
        [{ strong: "Our email providers" }, " — store and deliver our email."],
        [{ strong: "Hostinger" }, " — hosts this website and its server logs."],
        [{ strong: "PayPal" }, " — processes invoice payments. Your card or bank details go to PayPal and are never shared with us."],
        [{ strong: "Zoom, Google Meet, Telegram, Instagram and Facebook" }, " — only if you choose to talk with us there, under those services’ own privacy policies."],
      ],
    },
    { p: "We may also disclose data if the law requires it, or to protect our rights in a dispute. We never sell personal data, and we never “share” it for cross-context behavioural advertising as defined in US state privacy laws." },

    { h2: "International transfers", id: "transfers" },
    {
      p: "We are based in India, and our service providers may process data in other countries, including the United States and the European Union. Where UK or EU law applies, we rely on appropriate safeguards such as the standard contractual clauses our providers offer, so your data keeps an equivalent level of protection.",
    },

    { h2: "How long we keep it", id: "retention" },
    {
      ul: [
        "Enquiries that don’t become projects: up to 24 months after our last contact, then deleted.",
        "Client project records and correspondence: for as long as we work together and as long as needed afterwards to support the site you own.",
        "Invoices and accounting records: for the period tax law requires.",
        "Server logs: kept by our host for a limited period for security, then deleted automatically.",
      ],
    },
    { p: "Access you gave us to your accounts is yours to revoke at any time, and we stop using it as soon as a project or care plan ends." },

    { h2: "Your rights", id: "rights" },
    { p: "Wherever you live, you can ask us to:" },
    {
      ul: [
        "tell you what personal data we hold about you and give you a copy;",
        "correct anything that’s inaccurate or incomplete;",
        "delete your data, unless we must keep it by law;",
        "restrict or object to how we use it, or move it to another provider;",
        "withdraw any consent you’ve given, without affecting what happened before.",
      ],
    },
    {
      p: [
        "Email ",
        mail,
        " to make a request. We’ll reply within 30 days, and we may ask you to confirm your identity first. It’s free.",
      ],
    },
    { h3: "UK and EU residents" },
    {
      p: [
        "You have the rights above under the UK GDPR and EU GDPR, and you can complain to a data protection authority — in the UK, the ",
        { a: "Information Commissioner’s Office", href: "https://ico.org.uk/make-a-complaint/" },
        ". We’d appreciate the chance to put things right first.",
      ],
    },
    { h3: "US residents" },
    {
      p: "Depending on your state (for example California, Colorado, Connecticut, Virginia or Texas), you may have the right to know, access, correct and delete personal information, and to opt out of its sale or use for targeted advertising. We don’t sell personal information or use it for targeted advertising, and we won’t discriminate against you for exercising any right. We honour Global Privacy Control signals, though there’s nothing on this site for them to switch off.",
    },
    { h3: "Residents of India" },
    {
      p: [
        "Under the Digital Personal Data Protection Act, 2023 you can access, correct and erase your data, nominate someone to act for you, and raise a grievance. Send grievances to ",
        mail,
        " — we aim to resolve them within 30 days — and, if you’re not satisfied, you may approach the Data Protection Board of India.",
      ],
    },

    { h2: "Websites we build for clients", id: "client-sites" },
    {
      p: "When we build or maintain a website for you, you decide what data your site collects from your own customers, so you are the controller of that data and we act as your processor, following your instructions. We’re happy to sign a data processing agreement on request, and we’ll help you publish an accurate privacy notice for your site.",
    },

    { h2: "Children", id: "children" },
    { p: "Our services are for businesses. This website isn’t aimed at children, and we don’t knowingly collect data from anyone under 18. If you believe a child has sent us personal data, tell us and we’ll delete it." },

    { h2: "Security", id: "security" },
    {
      p: "The site is served over HTTPS with a strict Content Security Policy and loads no third-party scripts. We keep what we collect to a minimum, limit who can access it, and use strong authentication on the accounts that hold it. No system is perfectly secure, but if a breach ever affects your data, we’ll tell you and the relevant authorities as the law requires.",
    },

    { h2: "Changes to this policy", id: "changes" },
    { p: "If we change how we handle personal data — for example by adding analytics — we’ll update this page first and change the date at the top. Significant changes will be highlighted here." },

    { h2: "Contact", id: "contact" },
    { p: ["Questions, requests or complaints about privacy: ", mail, ". You’ll hear back from a person, not an autoresponder, usually within 24 hours."] },
  ],
};

export const cookies: LongformDoc = {
  slug: "cookies",
  title: "Cookie policy",
  metaTitle: "Cookie Policy — Pabloch Tech",
  description:
    "Pabloch Tech’s website uses no cookies, analytics or tracking — so there’s no cookie banner. Here’s exactly what the site does and doesn’t store.",
  lede: "This website uses no cookies at all. That’s why you didn’t see a cookie banner.",
  updated: LEGAL_UPDATED,
  blocks: [
    { h2: "What this site stores", id: "stores" },
    {
      p: "Nothing. The site sets no cookies — first-party or third-party — and doesn’t use local storage, session storage, tracking pixels, fingerprinting or any similar technology to recognise you or follow you around the web.",
    },
    {
      ul: [
        "No analytics (no Google Analytics, no Meta Pixel, nothing similar).",
        "No advertising or retargeting tags.",
        "No embedded videos, maps or social widgets that set their own cookies.",
        "Fonts and images are served from our own server, so viewing a page doesn’t contact any third party.",
      ],
    },
    { p: "A Content Security Policy built into every page blocks scripts and embeds from other domains, so this can’t change quietly." },

    { h2: "The contact form", id: "form" },
    {
      p: [
        "When you press send, the details you typed are posted directly to Web3Forms, which emails them to us. Sending the form doesn’t set a cookie. How we use what you send is covered in our ",
        { a: "privacy policy", href: "/privacy/" },
        ".",
      ],
    },

    { h2: "Links to other sites", id: "links" },
    {
      p: "Our portfolio links to live sites and previews (for example Al-Abuzer Perfumes, Renewal Tracker and projects hosted on Netlify), and to our social profiles. Those sites have their own cookie and privacy policies, which apply once you arrive there.",
    },

    { h2: "Do Not Track and Global Privacy Control", id: "gpc" },
    { p: "Because we don’t track you, there’s nothing for Do Not Track or Global Privacy Control to switch off — but we treat both signals as a valid opt-out anyway." },

    { h2: "If this ever changes", id: "changes" },
    {
      p: "If we ever add analytics or any technology that stores information on your device, we’ll update this page before it goes live and ask for your consent wherever the law requires it — for example under UK and EU rules, which require consent for non-essential cookies.",
    },

    { h2: "Questions", id: "contact" },
    { p: ["Email ", mail, " and we’ll answer."] },
  ],
};

export const terms: LongformDoc = {
  slug: "terms",
  title: "Terms of service",
  metaTitle: "Terms of Service — Pabloch Tech",
  description:
    "Terms for working with Pabloch Tech: free first draft, fixed prices, two revision rounds, 50/50 payment via PayPal, and full ownership at launch.",
  lede: "How working with Pabloch Tech works, in plain English: the free draft, the fixed price, what you own, and what happens if plans change.",
  updated: LEGAL_UPDATED,
  blocks: [
    { h2: "The short version", id: "summary" },
    {
      ul: [
        "Your first working draft is free, and you owe nothing if you don’t go ahead.",
        "If you do, you get a one-page scope with a fixed price and timeline — the number you agree is the number you pay.",
        "You pay 50% when you approve the draft and 50% on launch day, through PayPal.",
        "Two full revision rounds are included.",
        "Once the project is paid in full, you own the site, the code and the domain.",
      ],
    },
    {
      p: "These terms apply to your use of projects.pablochtech.com and to every project Pabloch Tech (“we”, “us”) carries out for you (“you”). If a signed scope for your project says something different, the scope wins for that project.",
    },

    { h2: "1. Enquiries and the free draft", id: "draft" },
    {
      ul: [
        "Sending a brief doesn’t commit you to anything. We aim to reply within 24 hours with what we’d build, the likely cost and the timeline.",
        "If the project is a fit, we build a working first draft at no cost. You’re under no obligation to proceed.",
        "Until you approve the draft and pay the deposit, the draft and its code remain ours. If you don’t proceed, please don’t publish or reuse it — and we won’t either, except as a labelled example in our portfolio.",
      ],
    },

    { h2: "2. Scope, price and timeline", id: "scope" },
    {
      ul: [
        "When you approve the draft, we send a one-page scope setting out what’s included, the fixed price and the timeline.",
        "Prices on the website marked “from” are starting prices; the scope is the price you pay.",
        "Work outside the agreed scope — new pages, features or a new design direction — is quoted separately, and we only start it once you’ve agreed in writing.",
        "Typical timelines are 1–2 weeks for a website and 3–5 weeks for an online store after the deposit and your content arrive. Delays in content, feedback or third-party access move the timeline by the same amount.",
      ],
    },

    { h2: "3. Payment", id: "payment" },
    {
      ul: [
        "You pay a 50% deposit when you approve the draft, and the remaining 50% on launch day, before the site goes live on your domain.",
        `${site.payments.summary} Invoices are issued in ${site.payments.currencyLabel}.`,
        "Third-party costs — such as your domain, hosting, paid plugins or APIs, and payment-gateway fees on your own store — are yours unless your scope says they’re included.",
        "We may pause work, or hold back launch, while an invoice is unpaid.",
      ],
    },

    { h2: "4. Revisions", id: "revisions" },
    { p: "Two full revision rounds are included. Small tweaks after that aren’t invoiced. A redesign in a new direction, or changes that go beyond the agreed scope, is a new piece of work and is quoted as one." },

    { h2: "5. Your responsibilities", id: "yours" },
    {
      ul: [
        "Supply accurate content — text, images, logos, prices — and make sure you have the right to use it. You’re responsible for the content you give us and for what your site says about your business.",
        "Give timely feedback and any access we need (domain, hosting, payment provider).",
        "Make sure your site’s legal notices (for example your own privacy policy and terms of sale) fit your business. We’ll help you publish them, but we can’t give legal advice.",
      ],
    },

    { h2: "6. Ownership and licences", id: "ownership" },
    {
      ul: [
        "When the project is paid in full, you own the website and the code written for it, and we hand over all files on request. Your domain is registered in your name from day one.",
        "Fonts, libraries, icons and any stock images stay under their own licences, which we choose so that you can use them on your site.",
        "We may reuse general techniques, and small generic pieces of code that aren’t specific to your business, in other work.",
        "We may show the finished project in our portfolio and describe our role in it. If you’d rather we didn’t, tell us and we’ll keep it private.",
      ],
    },

    { h2: "7. Launch, testing and fixes", id: "launch" },
    {
      p: "We test every build on current desktop and mobile browsers before launch. If something we built doesn’t work as described in the scope, tell us and we’ll fix it at no charge. Problems caused by later changes made by someone else, by third-party services, or by hosting we don’t manage aren’t covered, but we’re happy to quote for them.",
    },

    { h2: "8. Website Care", id: "care" },
    {
      p: "Website Care is optional and quoted per site. What it covers — such as renewals, form monitoring and small edits — is set out when you sign up, and either of us can end it with reasonable notice. If it ends, we hand over everything you need to manage the site yourself.",
    },

    { h2: "9. Cancelling a project", id: "cancel" },
    {
      ul: [
        "Before you pay the deposit, you can walk away at any point and owe nothing.",
        "After the deposit, you can cancel at any time by telling us in writing. The deposit covers the work already done; if the work completed is worth clearly less than the deposit, we refund the difference.",
        "If we ever have to cancel a project ourselves, we refund any payment for work not yet delivered and hand over what has been built.",
      ],
    },

    { h2: "10. Liability", id: "liability" },
    {
      p: "We take care over everything we build, but we can’t guarantee that a website will be uninterrupted, error-free, or produce any particular search ranking or amount of business. To the extent the law allows, our total liability for a project is limited to the amount you paid us for it, and we aren’t liable for indirect losses such as lost profits or lost data. Nothing in these terms limits liability that can’t legally be limited, or any rights you have as a consumer under the laws of the country you live in.",
    },

    { h2: "11. Using this website", id: "website" },
    {
      ul: [
        "The design, text and code of this website belong to Pabloch Tech. You’re welcome to browse, link to and share it, but please don’t copy it or present it as your own.",
        "Portfolio entries are labelled for exactly what they are. See our portfolio disclaimer for what “concept” and “preview” mean.",
        "Links to other sites are provided for convenience; we aren’t responsible for their content.",
        "Please don’t misuse the site — for example by attempting to break its security or sending spam through the contact form.",
      ],
    },

    { h2: "12. Governing law", id: "law" },
    {
      p: "These terms are governed by the laws of India, and disputes are subject to the courts of India. If you’re a consumer, you also keep the protection of the mandatory laws of the country where you live, and you may bring a claim there. Either way, please talk to us first — most things are solved with one email.",
    },

    { h2: "13. Changes and contact", id: "contact" },
    {
      p: [
        "We may update these terms; the version that applies to your project is the one in force when you approved its scope. Questions: ",
        mail,
        ".",
      ],
    },
  ],
};

export const disclaimer: LongformDoc = {
  slug: "disclaimer",
  title: "Portfolio disclaimer",
  metaTitle: "Portfolio Disclaimer — Pabloch Tech",
  description:
    "What the labels on Pabloch Tech’s portfolio mean — live, product, concept and preview — plus trademark, pricing and information notices.",
  lede: "Every project on this site is labelled for exactly what it is. This page explains the labels, and the notices that go with them.",
  updated: LEGAL_UPDATED,
  blocks: [
    { h2: "What the labels mean", id: "labels" },
    {
      ul: [
        [{ strong: "Live" }, " — a client’s website, built by us and running in production."],
        [{ strong: "Product" }, " — our own product, built and run by Pabloch Tech (for example Renewal Tracker)."],
        [{ strong: "Concept" }, " — a self-initiated design built on our own time to show what we can do. It is not a real business or client."],
        [{ strong: "Preview" }, " — an unpaid, unpublished spec build we made for a real local business before anyone asked, to show them what their site could be."],
      ],
    },

    { h2: "Concepts", id: "concepts" },
    {
      p: "Royal Compass Travels is a concept. It isn’t a travel agency, it doesn’t take bookings or payments, and any destinations, tiers or prices shown are illustrative. Please don’t submit real travel plans or personal details through it.",
    },

    { h2: "Previews of real businesses", id: "previews" },
    {
      p: "Previews such as The Cleaning Queens, Oak Tree Garden Maintenance and Dean the Decorator are speculative designs. Unless a project says otherwise, the business named hasn’t commissioned, approved, paid for or endorsed the preview, and it isn’t their official website. Details such as review ratings, review counts and years in business were taken from public listings when the preview was made and may have changed since.",
    },
    {
      p: [
        "If you own one of these businesses and would like a preview changed or taken down, email ",
        { a: site.email, href: `mailto:${site.email}` },
        " and we’ll do it promptly — no questions asked.",
      ],
    },

    { h2: "Trademarks", id: "trademarks" },
    {
      p: "Business names, logos and trademarks shown in our portfolio belong to their respective owners and are used only to identify the work. Third-party product names mentioned on this site — including PayPal, WordPress, Wix, Squarespace, Shopify, Zoom and Google Meet — are trademarks of their owners, and their mention doesn’t imply any partnership or endorsement.",
    },

    { h2: "Prices and information", id: "information" },
    {
      p: "Prices marked “from” are starting prices, and your written scope sets the price you pay. Articles in our journal are general information about websites and online business, not legal, financial or tax advice, and they reflect our understanding on the date shown. Third-party features and pricing change often, so check the provider’s own site before deciding.",
    },

    { h2: "Questions", id: "contact" },
    { p: ["Anything unclear? Email ", { a: site.email, href: `mailto:${site.email}` }, "."] },
  ],
};

export const legalDocs: Readonly<Record<LegalSlug, LongformDoc>> = { privacy, terms, cookies, disclaimer };
