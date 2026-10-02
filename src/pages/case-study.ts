import { html, type SafeHtml } from "../lib/html.ts";
import { plainText } from "../lib/rich.ts";
import { site } from "../content/site.ts";
import { caseStudy } from "../content/studio.ts";
import { Page, PageHeader, PageNext } from "../components/page.ts";
import { CaseStudy } from "../components/case-study.ts";

export function renderCaseStudy(): SafeHtml {
  const p = caseStudy.project;
  return Page({
    id: "case-study",
    title: `${p.name}: case study — ${site.name}`,
    description: `${plainText(caseStudy.headline)} ${caseStudy.chapters[0]?.body ?? ""}`.trim(),
    body: html`${PageHeader({
      id: "case-study",
      title: p.name,
      lede: caseStudy.headline,
      meta: caseStudy.meta,
    })}
${CaseStudy()}
${PageNext({ to: "work", kicker: "Back to", title: ["Selected ", { em: "work" }], note: "Six builds — a concept, our own app, a live store and three previews — each labelled for exactly what it is." })}`,
  });
}
