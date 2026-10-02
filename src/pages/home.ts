import { html, type SafeHtml } from "../lib/html.ts";
import { site } from "../content/site.ts";
import { Page } from "../components/page.ts";
import { Hero } from "../components/hero.ts";
import { Intro } from "../components/intro.ts";
import { HomeWork } from "../components/work.ts";
import { FactsBand, ProcessStrip, ServicesIndex } from "../components/teasers.ts";
import { FinalCta } from "../components/cta.ts";

/** Home: who we are, the work, and a door into every other page. */
export function renderHome(): SafeHtml {
  return Page({
    id: "home",
    title: site.title,
    description: site.description,
    structured: true,
    body: html`${Hero()}
${Intro("01")}
${HomeWork("02")}
${ServicesIndex("03")}
${ProcessStrip("04")}
${FactsBand("05")}
${FinalCta("06")}`,
  });
}
