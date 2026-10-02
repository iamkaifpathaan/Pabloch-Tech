import { html, type SafeHtml } from "../lib/html.ts";
import { site } from "../content/site.ts";
import { allWork, workIntro } from "../content/work.ts";
import { Page, PageHeader, PageNext } from "../components/page.ts";
import { CaseTeaser, WorkIndex, WorkList } from "../components/work.ts";

export function renderWork(): SafeHtml {
  const count = (s: string) => allWork.filter((p) => p.status === s).length;
  return Page({
    id: "work",
    title: `Selected work — ${site.name}`,
    description: workIntro.lede,
    body: html`${PageHeader({
      id: "work",
      title: ["Selected ", { em: "work" }],
      lede: workIntro.lede,
      meta: [
        { label: "Builds", value: String(allWork.length).padStart(2, "0") },
        { label: "Live in production", value: String(count("live")).padStart(2, "0") },
        { label: "Own product", value: String(count("product")).padStart(2, "0") },
        { label: "Concept · Previews", value: `${String(count("concept")).padStart(2, "0")} · ${String(count("preview")).padStart(2, "0")}` },
      ],
      toc: [
        { id: "index", label: "Index" },
        { id: "builds", label: "The builds" },
        { id: "case", label: "Case study" },
      ],
    })}
${WorkIndex("01")}
${WorkList("02")}
${CaseTeaser("03")}
${PageNext({ to: "services", title: ["What we ", { em: "build." }], note: "Five services, with starting prices and exactly what each one includes." })}`,
  });
}
