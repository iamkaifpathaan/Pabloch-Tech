/**
 * THE PABLOCH GRID — the site's signature element.
 *
 * A drafting grid fills the hero. Points lean away from the pointer like a
 * lens, a snapped crosshair reads out coordinates, and on the right a first
 * draft of a website assembles itself cell by cell — the studio's promise
 * ("you see a working draft before you pay") drawn as a diagram. Hover a
 * block of the draft to inspect it.
 *
 * Canvas 2D, one path per colour per frame, and the loop sleeps whenever
 * nothing is moving. Touch devices get the assembly without the lens;
 * reduced motion gets a single static frame.
 */
import { clamp, easeOutBack, easeOutCubic, media, qs } from "../core/env.ts";
import { addScene, pageTop } from "../core/scenes.ts";
import { addTick } from "../core/ticker.ts";

const FG = "242, 239, 232";
const ACCENT = "233, 180, 76";

interface Point {
  x0: number;
  y0: number;
  dx: number;
  dy: number;
  vx: number;
  vy: number;
  glow: number;
  mark: boolean;
}

type ShapeKind = "frame" | "bar" | "line" | "pill" | "accent" | "image" | "box" | "dots";

interface Shape {
  kind: ShapeKind;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  delay: number;
  fromX: number;
  fromY: number;
}

const ASSEMBLE_MS = 760;

export function mountGridField(section: HTMLElement): void {
  const canvas = qs<HTMLCanvasElement>("canvas", section);
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return;
  const slotEl = qs<HTMLElement>("[data-draft-slot]", section);

  const reduced = media.reducedMotion.matches;
  const lens = media.finePointer.matches && !reduced;

  let W = 0;
  let H = 0;
  let dpr = 1;
  let S = 32; // grid spacing
  let points: Point[] = [];
  let shapes: Shape[] = [];
  let slot = { x: 0, y: 0, w: 0, h: 0, on: false };
  let start = performance.now();
  let assembled = reduced;
  const pointer = { x: -9999, y: -9999, active: false };
  let hovered: Shape | null = null;
  let visible = true;
  let stopTick: (() => void) | null = null;

  /* ---------------------------------------------------------------- layout */

  function layout(): void {
    const rect = section.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas!.width = Math.round(W * dpr);
    canvas!.height = Math.round(H * dpr);

    S = W < 600 ? 26 : W < 1024 ? 30 : W < 1600 ? 34 : 38;
    const cols = Math.floor(W / S) + 2;
    const rows = Math.floor(H / S) + 2;
    const ox = (W - (cols - 1) * S) / 2;
    const oy = (H - (rows - 1) * S) / 2;
    const old = new Map(points.map((p) => [`${p.x0}|${p.y0}`, p]));
    points = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x0 = ox + c * S;
        const y0 = oy + r * S;
        const prev = old.get(`${x0}|${y0}`);
        points.push(prev ?? { x0, y0, dx: 0, dy: 0, vx: 0, vy: 0, glow: 0, mark: r % 4 === 1 && c % 4 === 1 });
      }
    }

    // Snap the draft slot (positioned by CSS) onto the grid, then keep it
    // clear of the headline, lede and buttons whatever the viewport does.
    const s = slotEl?.getBoundingClientRect();
    const free = s && s.width > 120 && s.height > 160 ? clearOfText(s, rect) : null;
    if (free) {
      const snapUp = (v: number, o: number) => o + Math.ceil((v - o) / S) * S;
      const x = snapUp(free.left, ox);
      const y = snapUp(free.top, oy);
      const w = Math.floor((free.right - x) / S) * S;
      const h = Math.floor((free.bottom - y) / S) * S;
      if (w >= 7 * S && h >= 9 * S) {
        slot = { x, y, w, h, on: true };
        shapes = buildDraft(slot, S);
      } else {
        slot.on = false;
        shapes = [];
      }
    } else {
      slot.on = false;
      shapes = [];
    }
    requestDraw();
  }

  /** Shrink the CSS slot so it never overlaps rendered text or buttons. */
  function clearOfText(slotRect: DOMRect, heroRect: DOMRect): { left: number; top: number; right: number; bottom: number } | null {
    const box = {
      left: slotRect.left - heroRect.left,
      top: slotRect.top - heroRect.top,
      right: slotRect.right - heroRect.left,
      bottom: slotRect.bottom - heroRect.top,
    };
    const gap = S;
    const obstacles: DOMRect[] = [];
    // Headline words: measure the masks (.rw-w), which are never transformed,
    // so the result is right even while the words are still rising into place.
    section.querySelectorAll(".hero-title .rw-w").forEach((el) => obstacles.push(el.getBoundingClientRect()));
    const range = document.createRange();
    section.querySelectorAll(".hero-lede").forEach((el) => {
      range.selectNodeContents(el);
      for (const r of Array.from(range.getClientRects())) if (r.width > 0) obstacles.push(r);
    });
    section.querySelectorAll(".hero-ctas > *, .hero-meta, .hero-base > *").forEach((el) => obstacles.push(el.getBoundingClientRect()));
    for (const o of obstacles) {
      const r = { left: o.left - heroRect.left, top: o.top - heroRect.top, right: o.right - heroRect.left, bottom: o.bottom - heroRect.top };
      const overlapsY = r.bottom + gap > box.top && r.top - gap < box.bottom;
      const overlapsX = r.right + gap > box.left && r.left - gap < box.right;
      if (!overlapsX || !overlapsY) continue;
      // Prefer trimming from the side that loses the least area.
      const trimTop = r.bottom + gap - box.top;
      const trimBottom = box.bottom - (r.top - gap);
      const trimLeft = r.right + gap - box.left;
      const options = [
        { k: "top" as const, cost: trimTop * (box.right - box.left) },
        { k: "bottom" as const, cost: trimBottom * (box.right - box.left) },
        { k: "left" as const, cost: trimLeft * (box.bottom - box.top) },
      ].sort((a, b) => a.cost - b.cost);
      const best = options[0]?.k;
      if (best === "top") box.top = r.bottom + gap;
      else if (best === "bottom") box.bottom = r.top - gap;
      else box.left = r.right + gap;
      if (box.right - box.left < 7 * S || box.bottom - box.top < 9 * S) return null;
    }
    return box;
  }

  /* -------------------------------------------------------------- the draft */

  function buildDraft(b: { x: number; y: number; w: number; h: number }, s: number): Shape[] {
    const cols = b.w / s;
    const rows = b.h / s;
    const out: Shape[] = [];
    let n = 0;
    const add = (kind: ShapeKind, c: number, r: number, cw: number, rh: number, label: string) => {
      // deterministic scatter: each block arrives from a nearby cell
      const jx = (((n * 37) % 5) - 2) * s;
      const jy = ((((n * 53) % 4) + 1) * s) * (n % 2 ? -1 : 1);
      out.push({
        kind,
        x: b.x + c * s,
        y: b.y + r * s,
        w: cw * s,
        h: rh * s,
        label,
        delay: 350 + n * 115,
        fromX: jx,
        fromY: jy,
      });
      n++;
    };
    add("frame", 0, 0, cols, rows, "draft-01 · 100% hand-written");
    add("dots", 0.45, 0.35, 1.2, 0.3, "");
    add("pill", cols * 0.3, 0.2, cols * 0.4, 0.6, "pabloch.draft");
    add("box", 0.75, 1.55, 1.4, 0.5, "logo");
    add("line", cols - 4.6, 1.72, 1, 0.16, "");
    add("line", cols - 3.35, 1.72, 1, 0.16, "");
    add("accent", cols - 2.05, 1.5, 1.35, 0.6, "nav · cta");
    const hy = Math.min(3.1, rows * 0.24);
    add("bar", 0.75, hy, cols * 0.72, 0.62, "h1");
    add("bar", 0.75, hy + 0.9, cols * 0.5, 0.62, "h1");
    add("line", 0.75, hy + 2, cols * 0.62, 0.14, "");
    add("line", 0.75, hy + 2.45, cols * 0.5, 0.14, "p");
    add("accent", 0.75, hy + 3.15, 2.9, 0.78, "cta — start a project");
    add("pill", 3.95, hy + 3.15, 2.5, 0.78, "secondary");
    const iy = hy + 4.55;
    const ih = Math.max(1.6, rows - iy - 2.35);
    add("image", 0.75, iy, cols - 1.5, ih, "img — your work, not stock");
    const cw = (cols - 1.5 - 0.6) / 3;
    for (let i = 0; i < 3; i++) add("box", 0.75 + i * (cw + 0.3), rows - 1.95, cw, 1.2, i === 1 ? "services" : "");
    return out;
  }

  /* ------------------------------------------------------------------ loop */

  function needsFrames(now: number): boolean {
    if (!assembled && now - start < totalAssembleMs() + 200) return true;
    if (!assembled) assembled = true;
    if (pointer.active && lens) return true;
    return points.some((p) => Math.abs(p.vx) > 0.02 || Math.abs(p.vy) > 0.02 || p.glow > 0.02);
  }

  const totalAssembleMs = () => (shapes.length ? (shapes[shapes.length - 1]?.delay ?? 0) + ASSEMBLE_MS + 400 : 1200);

  function frame(now: number): void {
    draw(now);
    if (!visible || !needsFrames(now)) {
      stopTick?.();
      stopTick = null;
    }
  }

  function requestDraw(): void {
    if (reduced) {
      draw(Number.POSITIVE_INFINITY);
      return;
    }
    if (!stopTick && visible) stopTick = addTick(frame);
  }

  /* ------------------------------------------------------------------ draw */

  function draw(now: number): void {
    const t = now - start;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, W, H);

    // Grid points, fading in from the top-left on first load.
    const intro = reduced ? 1 : clamp(t / 900);
    const R = Math.min(170, W * 0.16);
    const plain = new Path2D();
    const marks = new Path2D();
    const glowing: Point[] = [];

    for (const p of points) {
      if (lens) {
        let tx = 0;
        let ty = 0;
        if (pointer.active) {
          const ddx = p.x0 - pointer.x;
          const ddy = p.y0 - pointer.y;
          const d2 = ddx * ddx + ddy * ddy;
          if (d2 < R * R) {
            const d = Math.sqrt(d2) || 1;
            const f = 1 - d / R;
            const push = f * f * 20;
            tx = (ddx / d) * push;
            ty = (ddy / d) * push;
            p.glow = Math.max(p.glow, f);
          }
        }
        p.vx = (p.vx + (tx - p.dx) * 0.14) * 0.72;
        p.vy = (p.vy + (ty - p.dy) * 0.14) * 0.72;
        p.dx += p.vx;
        p.dy += p.vy;
        p.glow *= 0.9;
      }
      const reveal = clamp(intro * 1.8 - (p.x0 / W) * 0.5 - (p.y0 / H) * 0.3);
      if (reveal <= 0) continue;
      const x = p.x0 + p.dx;
      const y = p.y0 + p.dy;
      if (p.glow > 0.04) {
        glowing.push(p);
      } else if (p.mark) {
        marks.moveTo(x - 3, y);
        marks.lineTo(x + 3, y);
        marks.moveTo(x, y - 3);
        marks.lineTo(x, y + 3);
      } else {
        plain.rect(x - 0.6, y - 0.6, 1.2, 1.2);
      }
    }
    ctx!.globalAlpha = intro;
    ctx!.fillStyle = `rgba(${FG}, 0.2)`;
    ctx!.fill(plain);
    ctx!.strokeStyle = `rgba(${FG}, 0.26)`;
    ctx!.lineWidth = 1;
    ctx!.stroke(marks);
    for (const p of glowing) {
      const size = 1.2 + p.glow * 2.2;
      ctx!.fillStyle = `rgba(${ACCENT}, ${(0.25 + p.glow * 0.75).toFixed(3)})`;
      ctx!.fillRect(p.x0 + p.dx - size / 2, p.y0 + p.dy - size / 2, size, size);
    }
    ctx!.globalAlpha = 1;

    if (slot.on) drawDraft(t);

    // Snapped crosshair + coordinates
    if (lens && pointer.active) {
      const gx = snapTo(pointer.x, points[0]?.x0 ?? 0);
      const gy = snapTo(pointer.y, points[0]?.y0 ?? 0);
      ctx!.strokeStyle = `rgba(${FG}, 0.09)`;
      ctx!.beginPath();
      ctx!.moveTo(gx + 0.5, 0);
      ctx!.lineTo(gx + 0.5, H);
      ctx!.moveTo(0, gy + 0.5);
      ctx!.lineTo(W, gy + 0.5);
      ctx!.stroke();
      ctx!.strokeStyle = `rgba(${ACCENT}, 0.9)`;
      ctx!.strokeRect(gx - 4.5, gy - 4.5, 9, 9);
      ctx!.font = "500 10px 'Geist Mono', ui-monospace, monospace";
      ctx!.fillStyle = `rgba(${FG}, 0.55)`;
      const text = `X ${String(Math.round(gx)).padStart(4, "0")}  Y ${String(Math.round(gy)).padStart(4, "0")}`;
      const tx = gx + 12 + 150 > W ? gx - 12 - ctx!.measureText(text).width : gx + 12;
      ctx!.fillText(text, tx, gy - 10);
    }
  }

  const snapTo = (v: number, origin: number) => origin + Math.round((v - origin) / S) * S;

  function drawDraft(t: number): void {
    const c = ctx!;
    const assembling = t < totalAssembleMs();
    for (const sh of shapes) {
      const local = clamp((t - sh.delay) / ASSEMBLE_MS);
      if (local <= 0) continue;
      const e = reduced ? 1 : easeOutBack(local);
      const a = reduced ? 1 : easeOutCubic(local);
      const x = sh.x + sh.fromX * (1 - e);
      const y = sh.y + sh.fromY * (1 - e);
      const isHover = hovered === sh;
      const stroke = isHover ? `rgba(${ACCENT}, ${a})` : `rgba(${FG}, ${(0.34 * a).toFixed(3)})`;
      c.lineWidth = 1;
      c.strokeStyle = stroke;

      switch (sh.kind) {
        case "frame": {
          // the frame draws itself around its perimeter
          const per = 2 * (sh.w + sh.h);
          c.save();
          c.setLineDash([per]);
          c.lineDashOffset = per * (1 - (reduced ? 1 : easeOutCubic(local)));
          c.fillStyle = `rgba(11, 11, 12, ${(0.72 * a).toFixed(3)})`;
          roundRect(c, x + 0.5, y + 0.5, sh.w, sh.h, 10);
          c.fill();
          c.stroke();
          c.restore();
          c.beginPath();
          c.moveTo(x, y + S + 0.5);
          c.lineTo(x + sh.w * a, y + S + 0.5);
          c.stroke();
          break;
        }
        case "dots": {
          c.fillStyle = `rgba(${FG}, ${(0.35 * a).toFixed(3)})`;
          for (let i = 0; i < 3; i++) {
            c.beginPath();
            c.arc(x + 4 + i * 11, y + 5, 3, 0, Math.PI * 2);
            c.fill();
          }
          break;
        }
        case "bar": {
          c.fillStyle = isHover ? `rgba(${ACCENT}, ${(0.5 * a).toFixed(3)})` : `rgba(${FG}, ${(0.16 * a).toFixed(3)})`;
          c.fillRect(x, y, sh.w, sh.h);
          break;
        }
        case "line": {
          c.fillStyle = `rgba(${FG}, ${(0.22 * a).toFixed(3)})`;
          c.fillRect(x, y, sh.w, Math.max(2, sh.h));
          break;
        }
        case "pill": {
          roundRect(c, x + 0.5, y + 0.5, sh.w, sh.h, sh.h / 2);
          c.stroke();
          break;
        }
        case "accent": {
          roundRect(c, x, y, sh.w, sh.h, sh.h / 2);
          c.fillStyle = `rgba(${ACCENT}, ${(isHover ? 1 : 0.88 * a).toFixed(3)})`;
          c.fill();
          break;
        }
        case "image": {
          c.strokeRect(x + 0.5, y + 0.5, sh.w, sh.h);
          c.beginPath();
          c.moveTo(x, y);
          c.lineTo(x + sh.w * a, y + sh.h * a);
          c.moveTo(x + sh.w, y);
          c.lineTo(x + sh.w - sh.w * a, y + sh.h * a);
          c.strokeStyle = isHover ? `rgba(${ACCENT}, ${a})` : `rgba(${FG}, ${(0.14 * a).toFixed(3)})`;
          c.stroke();
          break;
        }
        case "box": {
          c.strokeRect(x + 0.5, y + 0.5, sh.w, sh.h);
          break;
        }
      }

      // annotation labels: flash while assembling, return on hover
      const showLabel = sh.label && (isHover || (assembling && local < 1 && local > 0.15));
      if (showLabel) {
        c.font = "500 10px 'Geist Mono', ui-monospace, monospace";
        const text = sh.label.toUpperCase();
        const tw = c.measureText(text).width;
        const lx = sh.kind === "frame" ? x + sh.w - tw - 12 : x;
        const ly = sh.kind === "frame" ? y + sh.h + 16 : y - 7;
        c.fillStyle = isHover ? `rgba(${ACCENT}, 1)` : `rgba(${ACCENT}, ${(0.8 * (1 - local)).toFixed(3)})`;
        c.fillText(text, lx, ly);
      }
    }
  }

  function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    const rr = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + rr, y);
    c.arcTo(x + w, y, x + w, y + h, rr);
    c.arcTo(x + w, y + h, x, y + h, rr);
    c.arcTo(x, y + h, x, y, rr);
    c.arcTo(x, y, x + w, y, rr);
    c.closePath();
  }

  function hitTest(x: number, y: number): Shape | null {
    if (!slot.on || x < slot.x || x > slot.x + slot.w || y < slot.y || y > slot.y + slot.h) return null;
    for (let i = shapes.length - 1; i >= 1; i--) {
      const s = shapes[i];
      if (s && s.label && x >= s.x - 4 && x <= s.x + s.w + 4 && y >= s.y - 4 && y <= s.y + s.h + 4) return s;
    }
    return shapes[0] ?? null;
  }

  /* ---------------------------------------------------------------- events */

  if (lens) {
    section.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
        const rect = section.getBoundingClientRect();
        pointer.x = e.clientX - rect.left;
        pointer.y = e.clientY - rect.top;
        pointer.active = true;
        hovered = hitTest(pointer.x, pointer.y);
        requestDraw();
      },
      { passive: true },
    );
    section.addEventListener("pointerleave", () => {
      pointer.active = false;
      hovered = null;
      requestDraw();
    });
  }

  new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    if (visible) requestDraw();
  }).observe(section);

  let resizeFrame = 0;
  new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(layout);
  }).observe(section);
  if ("fonts" in document) void document.fonts.ready.then(() => layout());

  // As the hero scrolls away, the grid recedes (opacity only).
  if (!reduced) {
    let top = 0;
    let height = 1;
    let last = "";
    addScene({
      measure() {
        top = pageTop(section);
        height = section.offsetHeight || 1;
      },
      update(y) {
        const p = clamp((y - top) / height);
        const v = (1 - p * 0.85).toFixed(3);
        if (v !== last) {
          canvas.style.opacity = v;
          last = v;
        }
      },
    });
  }

  start = performance.now();
  layout();
  // Text positions are only final once the headline reveal has settled.
  window.setTimeout(layout, reduced ? 0 : 1900);
}
