import { html, type SafeHtml } from "../lib/html.ts";
import { site } from "../content/site.ts";
import { contactCopy } from "../content/contact.ts";
import { Page } from "../components/page.ts";
import { Contact } from "../components/contact.ts";

export function renderContact(): SafeHtml {
  return Page({
    id: "contact",
    title: `Start a project — ${site.name}`,
    description: contactCopy.lede,
    body: html`${Contact()}`,
  });
}
