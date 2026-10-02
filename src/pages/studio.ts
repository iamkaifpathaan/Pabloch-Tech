import { html, type SafeHtml } from "../lib/html.ts";
import { site } from "../content/site.ts";
import { about } from "../content/studio.ts";
import { Page, PageHeader, PageNext } from "../components/page.ts";
import { About } from "../components/about.ts";
import { Proof } from "../components/proof.ts";

export function renderStudio(): SafeHtml {
  return Page({
    id: "studio",
    title: `Studio — ${site.name}`,
    description: about.paragraphs[0] ?? site.description,
    body: html`${PageHeader({
      id: "studio",
      title: about.title,
      lede: "An independent studio based in India, working US and UK business hours — you talk to the person designing and writing your product.",
      meta: [
        { label: "Based in", value: site.studio.base },
        { label: "Hours", value: site.studio.hours.replace("Working ", "") },
        { label: "Reply time", value: site.studio.replyTime },
      ],
      toc: [
        { id: "about", label: "The studio" },
        { id: "proof", label: "Proof" },
      ],
    })}
${About("01")}
${Proof("02")}
${PageNext({ to: "contact", kicker: "Start a project", title: ["Tell us what you’re ", { em: "building." }], note: "A few lines is enough. A real reply within 24 hours — and if it’s a fit, your first draft is free." })}`,
  });
}
