import { html, type SafeHtml } from "../lib/html.ts";
import { rich } from "../lib/rich.ts";
import { site } from "../content/site.ts";
import { blogIntro, posts } from "../content/blog.ts";
import type { Post } from "../lib/types.ts";
import { Document, type Json } from "../components/document.ts";
import { Footer } from "../components/footer.ts";
import { Blocks, DocCta, DocHead, PageBar, Toc, formatDate, readingMinutes, wordsIn } from "../components/longform.ts";
import { icons } from "../components/icons.ts";

const blogUrl = `${site.url}blog/`;
export const postUrl = (p: Post): string => `${blogUrl}${p.slug}/`;

function PostCard(p: Post): SafeHtml {
  return html`<li class="post-card">
    <a class="post-card-link" href="/blog/${p.slug}/">
      <p class="mono post-card-meta"><span>${p.category}</span><span aria-hidden="true">·</span><time datetime="${p.published}">${formatDate(p.published)}</time><span aria-hidden="true">·</span><span>${readingMinutes(p)} min read</span></p>
      <h2 class="post-card-title">${p.title}</h2>
      <p class="post-card-desc">${p.description}</p>
      <span class="arrow-link"><span class="arrow-link-label">Read the article</span>${icons.arrowRight}</span>
    </a>
  </li>`;
}

export function renderBlogIndex(): SafeHtml {
  const crumbs = [
    { name: "Home", url: site.url },
    { name: blogIntro.title, url: blogUrl },
  ];
  const body = html`<a class="skip-link" href="#main">Skip to content</a>
${PageBar()}
<main id="main" tabindex="-1">
  <section class="doc" data-theme="paper" aria-labelledby="doc-title">
    ${DocHead({
      crumbs,
      kicker: "Journal",
      title: blogIntro.title,
      lede: html`${blogIntro.lede}`,
      meta: html`${posts.length} articles · written by the studio`,
    })}
    <div class="wrap">
      <ul class="post-list" role="list">${posts.map(PostCard)}</ul>
    </div>
  </section>
  ${DocCta()}
</main>
${Footer()}`;

  return Document({
    title: blogIntro.metaTitle,
    description: blogIntro.description,
    canonical: blogUrl,
    body,
    bodyClass: "page-doc",
    pageType: "CollectionPage",
    crumbs,
    schema: [
      {
        "@type": "Blog",
        "@id": `${blogUrl}#blog`,
        name: `${site.name} — ${blogIntro.title}`,
        description: blogIntro.description,
        url: blogUrl,
        publisher: { "@id": `${site.url}#studio` },
        inLanguage: site.locale,
        blogPost: posts.map((p) => ({ "@id": `${postUrl(p)}#article` })),
      },
      {
        "@type": "ItemList",
        itemListElement: posts.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: postUrl(p), name: p.title })),
      },
    ],
  });
}

export function renderPost(post: Post): SafeHtml {
  const url = postUrl(post);
  const crumbs = [
    { name: "Home", url: site.url },
    { name: blogIntro.title, url: blogUrl },
    { name: post.title, url },
  ];
  const related = posts.filter((p) => p.slug !== post.slug).slice(0, 3);

  const body = html`<a class="skip-link" href="#main">Skip to content</a>
${PageBar()}
<main id="main" tabindex="-1">
  <article class="doc" data-theme="paper" aria-labelledby="doc-title">
    ${DocHead({
      crumbs,
      kicker: post.category,
      title: post.title,
      lede: rich(post.lede),
      meta: html`By ${site.name} · <time datetime="${post.published}">${formatDate(post.published)}</time>${
        post.updated !== post.published ? html` · Updated <time datetime="${post.updated}">${formatDate(post.updated)}</time>` : ""
      } · ${readingMinutes(post)} min read`,
    })}
    <div class="wrap doc-grid">
      ${Toc(post.blocks)}
      <div class="prose">
        <aside class="takeaways" aria-labelledby="takeaways-title">
          <p class="mono takeaways-title" id="takeaways-title">Key takeaways</p>
          <ul>${post.takeaways.map((t) => html`<li>${t}</li>`)}</ul>
        </aside>
        ${Blocks(post.blocks)}
        ${post.faq?.length
          ? html`<section class="post-faq" aria-labelledby="post-faq-title">
              <h2 id="post-faq-title">Common questions</h2>
              ${post.faq.map(
                (f) => html`<details class="post-faq-item"><summary>${f.q}</summary><p>${f.a}</p></details>`,
              )}
            </section>`
          : ""}
      </div>
    </div>
    <nav class="wrap doc-related" aria-label="More from the journal">
      <p class="mono doc-related-title">Keep reading</p>
      <ul role="list">${related.map((p) => html`<li><a href="/blog/${p.slug}/">${p.title}</a></li>`)}</ul>
    </nav>
  </article>
  ${DocCta()}
</main>
${Footer()}`;

  const schema: Json[] = [
    {
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      mainEntityOfPage: { "@id": `${url}#webpage` },
      headline: post.title,
      description: post.description,
      abstract: post.takeaways.join(" "),
      articleSection: post.category,
      datePublished: post.published,
      dateModified: post.updated,
      wordCount: wordsIn(post.blocks),
      timeRequired: `PT${readingMinutes(post)}M`,
      inLanguage: site.locale,
      image: `${site.url}${site.ogImage}`,
      author: { "@id": `${site.url}#studio` },
      publisher: { "@id": `${site.url}#studio` },
      isPartOf: { "@id": `${blogUrl}#blog` },
      about: post.blocks.filter((b): b is { h2: string; id: string } => "h2" in b).map((b) => b.h2),
    },
  ];
  if (post.faq?.length) {
    schema.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: post.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }

  return Document({
    title: `${post.metaTitle} | ${site.name}`.length <= 60 ? `${post.metaTitle} | ${site.name}` : post.metaTitle,
    description: post.description,
    canonical: url,
    body,
    bodyClass: "page-doc",
    modified: post.updated,
    crumbs,
    schema,
    article: { published: post.published, modified: post.updated, section: post.category },
  });
}

/** Plain-text excerpt for feeds and llms.txt. */
export const postSummary = (p: Post): string => `${p.description} ${p.takeaways.join(" ")}`;
