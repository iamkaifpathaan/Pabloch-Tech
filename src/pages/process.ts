import { html, type SafeHtml } from "../lib/html.ts";
import { site } from "../content/site.ts";
import { process, processIntro } from "../content/process.ts";
import { Page, PageHeader, PageNext } from "../components/page.ts";
import { Process } from "../components/process.ts";
import { Why } from "../components/why.ts";

export function renderProcess(): SafeHtml {
  return Page({
    id: "process",
    title: `Process — ${site.name}`,
    description: "Discover, define, design, build, refine. A real reply within 24 hours, a working draft before you pay, a fixed price in writing, and two revision rounds included.",
    body: html`${PageHeader({
      id: "process",
      title: ["From idea ", { em: "to impact." }],
      lede: processIntro,
      meta: process.map((s, i) => ({ label: `0${i + 1} ${s.name}`, value: s.when })),
      toc: [
        { id: "steps", label: "Five steps" },
        { id: "why", label: "Why Pabloch" },
      ],
    })}
${Process("01")}
${Why("02")}
${PageNext({ to: "studio", title: ["Small ", { em: "on purpose." }], note: "Who you’ll be talking to, where we are, and the work you can check for yourself." })}`,
  });
}
