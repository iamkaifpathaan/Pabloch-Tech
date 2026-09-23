import type { ProcessStep } from "../lib/types.ts";

/** How a project runs, in order. Mirrors the terms on the previous site. */
export const processIntro =
  "Five steps, in this order. The free draft sits in the middle — after we understand the job, before you’ve paid anything.";

export const process: readonly ProcessStep[] = [
  {
    id: "discover",
    name: "Discover",
    when: "Day one",
    body: "You tell us about the business — what you do, who you sell to, what the site has to achieve. A few lines on the form is enough. Rather talk? Twenty minutes on Zoom or Google Meet.",
    outcome: "A real reply within 24 hours — not an auto-response.",
  },
  {
    id: "define",
    name: "Define",
    when: "Within 24 hours",
    body: "We come back with what we’d build, what it would cost and how long it would take, in plain English. If what you need isn’t something we should be building, we’ll say so.",
    outcome: "A clear proposal and an honest starting price.",
  },
  {
    id: "design",
    name: "Design",
    when: "Usually a few days",
    body: "We build a working first draft — real layout, your services, your words — and send you a link. Open it on your phone, click around, decide. If it isn’t right, you owe nothing.",
    outcome: "A working draft, before you pay a thing.",
  },
  {
    id: "build",
    name: "Build",
    when: "1–2 weeks for a site · 3–5 for a store",
    body: "Approve the draft and you get a one-page scope with a fixed price and timeline. Then a 50% deposit, your content, and the production build: forms, integrations, payments, SEO, testing, your domain.",
    outcome: "A fixed price in writing — the number you agree is the number you pay.",
  },
  {
    id: "refine",
    name: "Refine",
    when: "Launch day, and after",
    body: "Two full revision rounds, then launch and the final 50%. After that, optional Website Care keeps it current — or we hand over the files and you take it from there.",
    outcome: "A live product you own outright — code, domain and all.",
  },
];
