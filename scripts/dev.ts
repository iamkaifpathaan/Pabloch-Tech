/**
 * Local preview: builds in dev mode, serves the repo root on http://localhost:5173
 * and rebuilds when anything in src/ changes. Reload the browser to see changes.
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { watch } from "node:fs";
import path from "node:path";
import { ROOT } from "./build.ts";

const PORT = Number(process.env.PORT ?? 5173);
const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
};

/** Each rebuild runs in a fresh process, so edits to content and components are always picked up. */
function rebuild(): Promise<void> {
  return new Promise((resolve) => {
    const child = spawn("npx tsx scripts/build.ts --dev", { cwd: ROOT, stdio: "inherit", shell: true });
    child.on("exit", (code) => {
      if (code !== 0) console.error("✗ build failed — fix the error above and save again");
      resolve();
    });
  });
}

await rebuild();

let timer: NodeJS.Timeout | undefined;
watch(path.join(ROOT, "src"), { recursive: true }, () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    void rebuild();
  }, 120);
});

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.join(ROOT, path.normalize(rel).replace(/^([/\\])+/, ""));
  if (!file.startsWith(ROOT) || /[/\\](src|scripts|node_modules)[/\\]/.test(file)) {
    res.writeHead(404).end("Not found");
    return;
  }
  try {
    if (!(await stat(file)).isFile()) throw new Error("not a file");
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] ?? "application/octet-stream", "Cache-Control": "no-store" });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404, { "Content-Type": TYPES[".html"] });
    res.end(await readFile(path.join(ROOT, "404.html")).catch(() => "Not found"));
  }
}).listen(PORT, () => console.log(`→ http://localhost:${PORT}`));
