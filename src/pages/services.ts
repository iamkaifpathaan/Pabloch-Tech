import { html, type SafeHtml } from "../lib/html.ts";
import { site } from "../content/site.ts";
import { services } from "../content/services.ts";
import { Page, PageHeader, PageNext } from "../components/page.ts";
import { Services } from "../components/services.ts";
import { VideoWork } from "../components/video-work.ts";
import { Capabilities } from "../components/capabilities.ts";
import { Terms } from "../components/proof.ts";

export function renderServices(): SafeHtml {
  return Page({
    id: "services",
    title: `Services & pricing — ${site.name}`,
    description: "Websites from $400, online stores from $1,200, motion graphics reels from $21, plus landing pages, features and care — fixed prices in writing.",
    body: html`${PageHeader({
      id: "services",
      title: ["What we ", { em: "build." }],
      lede: "A short list, done properly. If what you need isn’t on it, we’ll tell you — and we won’t pretend otherwise to win the job.",
      meta: services.slice(0, 4).map((s) => ({ label: s.name, value: s.price.replace(" · growth builds from $700", "") })),
      toc: [
        { id: "services", label: "Services" },
        { id: "motion-graphics-work", label: "Video samples" },
        { id: "capabilities", label: "Capabilities" },
        { id: "pricing", label: "Pricing & terms" },
      ],
    })}
${Services("01")}
${VideoWork("02")}
${Capabilities("03")}
${Terms("04")}
${PageNext({ to: "process", title: ["From idea ", { em: "to impact." }], note: "Five steps, in this order — with the free draft in the middle." })}`,
  });
}
