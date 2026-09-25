/**
 * Static build for projects.pablochtech.com
 *
 *   npm run build      → production files in the repo root (commit them)
 *   npm run dev        → same, unminified, with dev-only content markers, served locally
 *
 * Writes:  index.html, 404.html, static/app.<hash>.{css,js}, robots.txt,
 *          sitemap.xml, favicon.svg
 * Never writes: config.js (your Web3Forms key + handles), assets/, .htaccess,
 * googleeaf0a72808bb7594.html (Google Search Console ownership proof)
 * (config.js is only *read*, to fingerprint it — see configFingerprint below)
 */
import { build } from "esbuild";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STATIC_DIR = path.join(ROOT, "static");

/**
 * Google Search Console ownership proof for projects.pablochtech.com.
 * It must stay in the site root, with exactly this name and exactly this
 * content (no trailing newline) — if it goes, Search Console loses the site.
 * Never edit, rename, move or delete it.
 */
const GOOGLE_VERIFICATION = {
  file: "googleeaf0a72808bb7594.html",
  content: "google-site-verification: googleeaf0a72808bb7594.html",
} as const;

/** Files the build must never write, whatever happens. */
const PROTECTED = new Set(["config.js", ".htaccess", GOOGLE_VERIFICATION.file]);

/** Stops a production build if the Google verification file is missing or altered. */
async function checkGoogleVerification(dev: boolean): Promise<void> {
  const { file, content } = GOOGLE_VERIFICATION;
  let problem = "";
  try {
    if ((await readFile(path.join(ROOT, file), "utf8")) !== content) problem = "has been changed";
  } catch {
    problem = "is missing";
  }
  if (!problem) return;
  const msg =
    `${file} ${problem}. It proves ownership of projects.pablochtech.com to Google Search Console.\n` +
    `Restore it in the site root with exactly this content (no newline at the end):\n  ${content}`;
  if (dev) console.warn(`⚠ ${msg}`);
  else throw new Error(msg);
}

async function safeWrite(relPath: string, contents: string | Uint8Array): Promise<void> {
  if (PROTECTED.has(relPath)) throw new Error(`Refusing to overwrite protected file: ${relPath}`);
  const full = path.join(ROOT, relPath);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, contents);
}

const hash = (data: string | Uint8Array, len = 10): string => createHash("sha256").update(data).digest("hex").slice(0, len);

/**
 * The page loads config.js?v=<fingerprint>. Whenever config.js changes (and the
 * site is rebuilt), the URL changes too, so no browser can keep serving an old
 * copy with old handles. Without a config.js (e.g. a fresh clone), the build
 * time is used instead, which still busts every older cached copy.
 * CONFIG_VERSION=<value> overrides it (lowercase letters/digits only).
 */
async function configFingerprint(): Promise<string> {
  if (process.env.CONFIG_VERSION && /^[a-z0-9]{1,16}$/.test(process.env.CONFIG_VERSION)) return process.env.CONFIG_VERSION;
  try {
    return hash(await readFile(path.join(ROOT, "config.js")), 8);
  } catch {
    return Date.now().toString(36);
  }
}

async function bundleAssets(dev: boolean): Promise<{ css: string; js: string }> {
  const [js, css] = await Promise.all([
    build({
      entryPoints: [path.join(ROOT, "src/client/main.ts")],
      bundle: true,
      format: "esm",
      target: ["es2020", "safari14"],
      minify: !dev,
      sourcemap: dev ? "inline" : false,
      legalComments: "none",
      write: false,
      define: { "import.meta.env.DEV": JSON.stringify(dev) },
    }),
    build({
      entryPoints: [path.join(ROOT, "src/styles/main.css")],
      bundle: true,
      minify: !dev,
      write: false,
      // Font URLs stay relative to the bundle (static/app.css → static/fonts/…).
      external: ["fonts/*"],
      target: ["chrome105", "safari15.4", "firefox110"],
      legalComments: "none",
    }),
  ]);

  const jsText = js.outputFiles[0]?.text ?? "";
  const cssText = css.outputFiles[0]?.text ?? "";
  const jsName = `app.${hash(jsText)}.js`;
  const cssName = `app.${hash(cssText)}.css`;

  // Remove previous hashed bundles so stale files don't pile up.
  await mkdir(STATIC_DIR, { recursive: true });
  for (const f of await readdir(STATIC_DIR)) {
    if (/^app\.[a-f0-9]+\.(js|css)$/.test(f) && f !== jsName && f !== cssName) await rm(path.join(STATIC_DIR, f));
  }
  await safeWrite(`static/${jsName}`, jsText);
  await safeWrite(`static/${cssName}`, cssText);
  return { css: cssName, js: jsName };
}

export async function runBuild({ dev = false } = {}): Promise<void> {
  const started = Date.now();
  await checkGoogleVerification(dev);
  const { setEnv } = await import("../src/lib/env.ts");
  const { HEAD_SCRIPT } = await import("../src/components/document.ts");
  const { minifyHtml } = await import("../src/lib/html.ts");
  const { site } = await import("../src/content/site.ts");
  const { faviconSvg } = await import("../src/components/icons.ts");

  const assets = await bundleAssets(dev);
  const headScriptHash = `sha256-${createHash("sha256").update(HEAD_SCRIPT).digest("base64")}`;
  const now = new Date();
  setEnv({
    dev,
    css: assets.css,
    js: assets.js,
    headScriptHash,
    year: now.getFullYear(),
    buildDate: now.toISOString().slice(0, 10),
    configVersion: await configFingerprint(),
  });

  // Pages import content at render time, after env is set.
  const { renderHome } = await import("../src/pages/home.ts");
  const { renderNotFound } = await import("../src/pages/not-found.ts");
  const finish = (s: { value: string }) => (dev ? s.value : minifyHtml(s.value)) + "\n";

  setEnv({ base: "" }); // home page: relative paths, so it also opens straight from disk
  await safeWrite("index.html", finish(renderHome()));
  setEnv({ base: "/" }); // 404 page: served at any URL, so absolute paths
  await safeWrite("404.html", finish(renderNotFound()));
  await safeWrite("favicon.svg", faviconSvg);
  await safeWrite("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${site.url}sitemap.xml\n`);
  await safeWrite(
    "sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${site.url}</loc>\n    <lastmod>${now.toISOString().slice(0, 10)}</lastmod>\n  </url>\n</urlset>\n`,
  );

  console.log(`✓ built ${dev ? "(dev) " : ""}${assets.css} ${assets.js} in ${Date.now() - started}ms`);
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (invokedDirectly) {
  runBuild({ dev: process.argv.includes("--dev") }).catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
}
