import { html, type SafeHtml } from "../lib/html.ts";
import { site } from "../content/site.ts";
import { type Json } from "../components/document.ts";
import { faq } from "../content/faq.ts";
import { allWork, statusLabel } from "../content/work.ts";
import { process } from "../content/process.ts";
import { plainText } from "../lib/rich.ts";
import { Page } from "../components/page.ts";
import { Hero } from "../components/hero.ts";
import { Intro } from "../components/intro.ts";
import { HomeWork } from "../components/work.ts";
import { FactsBand, ProcessStrip, ServicesIndex } from "../components/teasers.ts";
import { Faq } from "../components/faq.ts";
import { FinalCta } from "../components/cta.ts";

/** Home: who we are, the work, and a door into every other page. */
export function renderHome(): SafeHtml {
  return Page({
    id: "home",
    title: site.title,
    description: site.description,
    body: html`${Hero()}
${Intro("01")}
${HomeWork("02")}
${ServicesIndex("03")}
${ProcessStrip("04")}
${FactsBand("05")}
${Faq("06")}
${FinalCta("07")}`,
    schema: homeSchema(),
  });
}

/** Home-page structured data: the FAQ, the portfolio, the process and our own app. */
function homeSchema(): Json[] {
  return [
    {
      "@type": "FAQPage",
      "@id": `${site.url}#faq`,
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: plainText(item.a) },
      })),
    },
    {
      "@type": "ItemList",
      "@id": `${site.url}#work`,
      name: "Selected work by Pabloch Tech",
      itemListElement: allWork.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "CreativeWork",
          name: p.name,
          url: p.link.href,
          description: plainText(p.summary),
          genre: `${p.sector} · ${statusLabel[p.status]}`,
          keywords: p.features.join(", "),
          creator: { "@id": `${site.url}#studio` },
          ...(p.location ? { contentLocation: { "@type": "Place", name: p.location } } : {}),
        },
      })),
    },
    {
      "@type": "HowTo",
      "@id": `${site.url}#process`,
      name: "How a Pabloch Tech website project works",
      description: "Discover → Define → Design → Build → Refine. The free working draft comes before any payment.",
      step: process.map((step, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: step.name,
        text: `${step.body} ${step.outcome}`,
        url: `${site.url}process/`,
      })),
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://app.pablochtech.com/#app",
      name: "Renewal Tracker",
      url: "https://app.pablochtech.com/",
      downloadUrl: "https://app.pablochtech.com/downloads.html",
      description:
        "Desktop app for Windows and Mac that keeps subscriptions, insurance, MOT, TV Licence, passports and every other renewal in one list, with desktop reminders and a daily 8am email before each one is due.",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Windows 10, Windows 11, macOS 11 or later",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@id": `${site.url}#studio` },
    },
  ];
}
