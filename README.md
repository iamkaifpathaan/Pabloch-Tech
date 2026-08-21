# Pabloch Tech

The website for **Pabloch Tech** — a one-person web design and development studio building
fast, hand-coded websites and online stores for small businesses.

**Live:** _(add the Vercel URL here once it's deployed)_

---

## What this is

One file. `index.html` contains the markup, the CSS, the JavaScript and both case-study
screenshots (embedded as data URLs), which means it can be opened by double-clicking it,
emailed, or dropped on any host without anything breaking.

No framework, no build step, no dependencies, no package manager. That's deliberate — it
loads in well under a second, there's nothing to update at 3am, and it can move from Vercel
to shared hosting by uploading one file.

| | |
|---|---|
| **Stack** | HTML, CSS, vanilla JS |
| **Fonts** | Instrument Serif + Inter, via Google Fonts, with system fallbacks |
| **Forms** | [Web3Forms](https://web3forms.com) — no backend required |
| **Hosting** | Vercel (static) |

## Run it locally

```bash
git clone https://github.com/pablochsocial/Pabloch-Tech.git
cd Pabloch-Tech
open index.html          # macOS  ·  'start' on Windows  ·  'xdg-open' on Linux
```

That's the whole setup. If you'd rather serve it over HTTP:

```bash
python3 -m http.server 8000
```

## Configuration

Everything configurable lives in a single `CONFIG` object at the bottom of `index.html`:

```js
var CONFIG = {
  WEB3FORMS_KEY : "…",              // free key from web3forms.com
  EMAIL         : "…",
  TELEGRAM      : "…",              // handle only, no @
  INSTAGRAM     : "…",
  FACEBOOK      : "…"
};
```

Blank any handle out (`""`) and that button disappears from the contact block, the footer and
the mobile menu — the links are generated from `CONFIG` at load rather than hard-coded, so
there's one place to change and nothing goes stale.

Until `WEB3FORMS_KEY` is set, a setup bar appears at the top of the page and the enquiry form
falls back to telling visitors to email instead of silently swallowing submissions.

> **On the Web3Forms key:** it is a public identifier, not a secret. It ships in the HTML of
> every deployed static site by design, so committing it here changes nothing. If it ever gets
> abused, rotate it at web3forms.com.

## Deploy

The repo root **is** the site, so Vercel needs no configuration:

1. **vercel.com/new** → import this repository
2. Framework preset: **Other**, root directory: `./`, no build command
3. Deploy

Every push to `main` redeploys. For a one-off deploy without Git, [vercel.com/drop](https://vercel.com/drop)
takes a dragged folder — but note that each drop creates a *new* project rather than updating
an existing one.

Moving to any other static host later is a file copy: upload `index.html` and `robots.txt`
into the web root. The enquiry form keeps working because Web3Forms is called from the
browser, not from a server.

## Structure

`index.html`, top to bottom:

| Section | |
|---|---|
| `<head>` | title, meta, favicon, JSON-LD |
| `<style>` | all CSS. Colour tokens are in `:root` — changing `--gold` reskins the whole site |
| `.nav` / `.mobile` | sticky header and mobile menu |
| `.hero` | headline and the featured-project card |
| `#work` | case studies |
| `#services` `#process` `#pricing` `#about` `#faq` | in that order |
| `#contact` | enquiry form, social links, call booking |
| `<script>` | `CONFIG`, social link generation, nav, scroll reveals, form handling |

## Accessibility & performance notes

- Single request for the document; no external JS or CSS beyond the font stylesheet
- Respects `prefers-reduced-motion` — scroll reveals and transitions are disabled
- Mobile menu closes on Escape, on outside tap, and on viewport resize past the breakpoint
- Visible focus rings, labelled form fields, `aria-expanded` on the menu toggle
- No horizontal overflow at 375px

---

© Pabloch Tech
