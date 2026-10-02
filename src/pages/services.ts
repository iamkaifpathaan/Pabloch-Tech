import { html, type SafeHtml } from "../lib/html.ts";
import { site } from "../content/site.ts";
import { services } from "../content/services.ts";
import { Page, PageHeader, PageNext } from "../components/page.ts";
import { Services } from "../components/services.ts";
import { Capabilities } from "../components/capabilities.ts";
import { Terms } from "../components/proof.ts";

export function renderServices(): SafeHtml {
  return Page({
    id: "services",
    title: `Services & pricing — ${site.name}`,
    description: "Websites from $400, online stores from $1,200, landing pages, product features and website care — hand-written, with a fixed price in writing before work starts.",
    body: html`${PageHeader({
      id: "services",
      title: ["What we ", { em: "build." }],
      lede: "A short list, done properly. If what you need isn’t on it, we’ll tell you — and we won’t pretend otherwise to win the job.",
      meta: services.slice(0, 4).map((s) => ({ label: s.name, value: s.price.replace(" · growth builds from $700", "") })),
      toc: [
        { id: "services", label: "Services" },
        { id: "capabilities", label: "Capabilities" },
        { id: "pricing", label: "Pricing & terms" },
      ],
    })}
${Services("01")}
${Capabilities("02")}
${Terms("03")}
${PageNext({ to: "process", title: ["From idea ", { em: "to impact." }], note: "Five steps, in this order — with the free draft in the middle." })}`,
  });
}
