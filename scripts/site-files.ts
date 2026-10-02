/**
 * The machine-readable files: robots.txt, sitemap.xml, blog/feed.xml,
 * llms.txt and llms-full.txt. All generated from src/content, so they can
 * never disagree with the pages.
 *
 * llms.txt follows https://llmstxt.org — a short Markdown map of the site
 * for AI assistants and answer engines; llms-full.txt carries the full text
 * of the FAQ, services, process, journal and legal pages in one file.
 */
import type { site as Site } from "../src/content/site.ts";
import type { Block, LongformDoc, Post, Rich, RichPart } from "../src/lib/types.ts";
import type { Route } from "../src/lib/routes.ts";
import { faq } from "../src/content/faq.ts";
import { services } from "../src/content/services.ts";
import { process, processIntro } from "../src/content/process.ts";
import { allWork, statusLabel } from "../src/content/work.ts";

interface Input {
  site: typeof Site;
  /** Every page in the main site structure (home, work, services …). */
  routes: readonly Route[];
  posts: readonly Post[];
  legal: readonly LongformDoc[];
  buildDate: string;
}

/** Crawlers for AI search and assistants. Named explicitly so the intent is unambiguous. */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "DuckAssistBot",
  "meta-externalagent",
  "Amazonbot",
  "CCBot",
];

const xml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function md(rich: Rich, root: string): string {
  const parts: readonly RichPart[] = typeof rich === "string" ? [rich] : rich;
  return parts
    .map((p) => {
      if (typeof p === "string") return p;
      if ("em" in p) return `*${p.em}*`;
      if ("strong" in p) return `**${p.strong}**`;
      const href = p.href.startsWith("/") ? `${root}${p.href.slice(1)}` : p.href;
      return `[${p.a}](${href})`;
    })
    .join("");
}

function blocksToMd(blocks: readonly Block[], root: string): string {
  return blocks
    .map((b) => {
      if ("h2" in b) return `### ${b.h2}`;
      if ("h3" in b) return `#### ${b.h3}`;
      if ("p" in b) return md(b.p, root);
      if ("note" in b) return `> ${md(b.note, root)}`;
      if ("ul" in b) return b.ul.map((li) => `- ${md(li, root)}`).join("\n");
      return b.ol.map((li, i) => `${i + 1}. ${md(li, root)}`).join("\n");
    })
    .join("\n\n");
}

export function siteFiles({ site, routes, posts, legal, buildDate }: Input): Record<string, string> {
  const root = site.url;
  const postUrl = (p: Post) => `${root}blog/${p.slug}/`;

  /* ---------------------------------------------------------------- robots */
  const robots = [
    "# projects.pablochtech.com — every page is public and may be crawled,",
    "# indexed and cited, including by AI search engines and assistants.",
    "",
    "User-agent: *",
    "Allow: /",
    "",
    ...AI_CRAWLERS.flatMap((bot) => [`User-agent: ${bot}`, "Allow: /", ""]),
    `Sitemap: ${root}sitemap.xml`,
    "",
  ].join("\n");

  /* --------------------------------------------------------------- sitemap */
  const urls: { loc: string; lastmod: string; priority: string; changefreq: string }[] = [
    ...routes.map((r) => ({ loc: `${root}${r.path}`, lastmod: buildDate, priority: r.path ? "0.8" : "1.0", changefreq: r.path ? "monthly" : "weekly" })),
    { loc: `${root}blog/`, lastmod: posts[0]?.updated ?? buildDate, priority: "0.8", changefreq: "weekly" },
    ...posts.map((p) => ({ loc: postUrl(p), lastmod: p.updated, priority: "0.7", changefreq: "monthly" })),
    ...legal.map((d) => ({ loc: `${root}${d.slug}/`, lastmod: d.updated, priority: "0.3", changefreq: "yearly" })),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${xml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  /* ------------------------------------------------------------------ feed */
  const rfc822 = (iso: string) => new Date(`${iso}T09:00:00Z`).toUTCString();
  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${xml(site.name)} — Journal</title>
  <link>${root}blog/</link>
  <atom:link href="${root}blog/feed.xml" rel="self" type="application/rss+xml"/>
  <description>${xml("Practical guides on websites, online stores and turning searches into customers, from an independent web design studio.")}</description>
  <language>en</language>
  <lastBuildDate>${rfc822(posts[0]?.updated ?? buildDate)}</lastBuildDate>
${posts
  .map(
    (p) => `  <item>
    <title>${xml(p.title)}</title>
    <link>${postUrl(p)}</link>
    <guid isPermaLink="true">${postUrl(p)}</guid>
    <pubDate>${rfc822(p.published)}</pubDate>
    <category>${xml(p.category)}</category>
    <description>${xml(p.description)}</description>
  </item>`,
  )
  .join("\n")}
</channel>
</rss>
`;

  /* -------------------------------------------------------------- llms.txt */
  const priceLines = services.map((s) => `- **${s.name}** — ${s.price}. ${s.line}`);
  const facts = [
    `- Based in ${site.studio.base}; works ${site.studio.hours.replace(/^Working /, "")}; replies ${site.studio.replyTime.toLowerCase()}.`,
    "- Serves businesses mainly in the United States and United Kingdom.",
    "- Process: Discover → Define → Design → Build → Refine. A working first draft is built free, before any payment.",
    "- Pricing: fixed price in writing; 50% deposit after the draft is approved, 50% on launch day; two revision rounds included.",
    `- Payment: ${site.payments.summary} Invoices in ${site.payments.currencyLabel}.`,
    "- Ownership: the client owns the site, the code and the domain (registered in the client's name from day one).",
    "- Technology: hand-written HTML, CSS and JavaScript — no templates, page builders or WordPress; a real back end when a store needs one.",
    `- Contact: ${site.email} · ${root}contact/`,
  ];
  const llms = `# ${site.name}

> ${site.oneLine}

${site.description}

## Key facts

${facts.join("\n")}

## Services and prices

${priceLines.join("\n")}

## Main pages

- [Home](${root}): who we are, featured work, services, process and FAQ
- [Selected work](${root}work/): ${allWork.map((w) => w.name).join(", ")}
- [Case study: Renewal Tracker](${root}work/renewal-tracker/)
- [Services and prices](${root}services/)
- [Process](${root}process/)
- [Studio](${root}studio/): who you'll be talking to
- [FAQ](${root}#faq)
- [Start a project](${root}contact/): the project brief form

## Journal

${posts.map((p) => `- [${p.title}](${postUrl(p)}): ${p.description}`).join("\n")}

## Legal

${legal.map((d) => `- [${d.title}](${root}${d.slug}/): ${d.description}`).join("\n")}

## Optional

- [Full text of this site for language models](${root}llms-full.txt)
- [Renewal Tracker](https://app.pablochtech.com/): the studio's own Windows & Mac app for tracking renewals
`;

  /* --------------------------------------------------------- llms-full.txt */
  const full = `# ${site.name} — full text

> ${site.oneLine}

Source: ${root} · Generated ${buildDate}

## Key facts

${facts.join("\n")}

## Services

${services
  .map((s) => `### ${s.name}\n\n${s.line}\n\nPrice: ${s.price}\n\nIncludes:\n${s.includes.map((i) => `- ${i}`).join("\n")}`)
  .join("\n\n")}

## Process

${processIntro}

${process.map((st, i) => `${i + 1}. **${st.name}** (${st.when}) — ${st.body} Outcome: ${st.outcome}`).join("\n")}

## Selected work

${allWork
  .map((w) => `- **${w.name}** — ${w.sector}${w.location ? `, ${w.location}` : ""} (${statusLabel[w.status]}). ${md(w.summary, root)} Link: ${w.link.href}`)
  .join("\n")}

## Frequently asked questions

${faq.map((f) => `### ${f.q}\n\n${md(f.a, root)}`).join("\n\n")}

${posts
  .map(
    (p) => `## Journal: ${p.title}

URL: ${postUrl(p)} · Published ${p.published}

Key takeaways:
${p.takeaways.map((t) => `- ${t}`).join("\n")}

${blocksToMd(p.blocks, root)}${p.faq?.length ? `\n\n${p.faq.map((f) => `**${f.q}** ${f.a}`).join("\n\n")}` : ""}`,
  )
  .join("\n\n")}

${legal
  .map(
    (d) => `## ${d.title}

URL: ${root}${d.slug}/ · Last updated ${d.updated}

${md(d.lede, root)}

${blocksToMd(d.blocks, root)}`,
  )
  .join("\n\n")}
`;

  return {
    "robots.txt": robots,
    "sitemap.xml": sitemap,
    "blog/feed.xml": feed,
    "llms.txt": llms,
    "llms-full.txt": full,
  };
}
