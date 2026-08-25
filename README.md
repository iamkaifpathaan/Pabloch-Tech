# Pabloch Tech

The website for **Pabloch Tech** — a one-person web design and development studio building fast,
hand-coded websites and online stores for small businesses.

**Live:** https://pablochtech.com

---

## What this is

A static site with no framework, no build step, no dependencies and no package manager. It loads
in well under a second, there is nothing to update at 3am, and it moves between hosts by copying
files.

| | |
|---|---|
| **Stack** | HTML, CSS, vanilla JS |
| **Fonts** | Instrument Serif + Inter, via Google Fonts, with system fallbacks |
| **Forms** | [Web3Forms](https://web3forms.com) — no backend required |
| **Hosting** | Hostinger (Apache/LiteSpeed), deployed from this repo |

```
index.html      the page — markup, styles and script in one file
config.js       settings: form key, email, social handles
.htaccess       HTTPS, canonical host, caching, compression, security headers
assets/         case-study screenshots
og-image.jpg    1200×630 social share card
robots.txt      sitemap.xml
```

## Run it locally

```bash
git clone https://github.com/pablochsocial/Pabloch-Tech.git
cd Pabloch-Tech
python3 -m http.server 8000
```

Opening `index.html` directly works too. Serving over HTTP is closer to production and avoids
`file://` quirks.

## Configuration

Everything configurable lives in **`config.js`**, deliberately separate from `index.html`:

```js
window.PABLOCH_CONFIG = {
  WEB3FORMS_KEY : "…",              // free key from web3forms.com
  EMAIL         : "hello@pablochtech.com",
  TELEGRAM      : "…",              // handle only, no @
  INSTAGRAM     : "…",
  FACEBOOK      : "…"
};
```

`index.html` declares empty defaults and merges `window.PABLOCH_CONFIG` over them, so the markup
can be regenerated without disturbing live settings, and a missing `config.js` degrades to a
setup notice rather than a broken page.

Blank a handle out (`""`) and that button disappears from the contact block, the footer and the
mobile menu — the links are generated at load, so there is one place to change and nothing goes
stale.

> **On the Web3Forms key:** it is a public identifier, not a secret. It ships in the HTML of every
> deployed static site by design, so committing it here changes nothing. If it is ever abused,
> rotate it at web3forms.com.

## Deploy

The repo root **is** the site. Deployment is Hostinger's GitHub integration
(hPanel → Websites → Dashboard → Advanced → Git), pointed at `main` and `public_html`, with
automatic deployment on push.

Any static host works the same way: copy the files into the web root. `.htaccess` is
Apache/LiteSpeed-specific and is simply ignored elsewhere.

## Accessibility & performance notes

- Text contrast meets WCAG AA throughout (lowest measured pair is 5.0:1)
- `prefers-reduced-motion` disables scroll reveals and every transition, pseudo-elements included
- Mobile menu closes on Escape, on outside tap, and on resize past the breakpoint, returning
  focus to the toggle
- Form fields are 16px so iOS does not zoom the page on focus
- Submitting moves focus to the confirmation rather than dropping it to `<body>`
- Works with JavaScript disabled: content renders and the form is replaced by an email address
- No horizontal overflow at 320px
- Images are cached for a year and the HTML is revalidated on every request

---

© Pabloch Tech
