import { attrs, html, type SafeHtml } from "../lib/html.ts";
import { env } from "../lib/env.ts";
import { rich } from "../lib/rich.ts";
import { to } from "../lib/routes.ts";
import { audioLabel, showreel, videoIntro, videoSamples, videoTiers } from "../content/video.ts";
import { Picture, PrimaryButton, RevealHeading, SectionLabel } from "./primitives.ts";
import { icons } from "./icons.ts";

/**
 * Motion graphics samples (the Services page). A silent showreel loop that
 * plays only while it's on screen (and never under reduced motion), fixed
 * prices, and six real reels that open on YouTube. Without JS the loop is a
 * plain video with controls.
 */
export function VideoWork(index = "02"): SafeHtml {
  return html`<section class="vw" id="motion-graphics-work" data-theme="ink" aria-labelledby="vw-title">
    <div class="wrap">
      <div class="vw-top">
        <div class="vw-copy">
          ${SectionLabel(index, "Motion graphics — samples")}
          ${RevealHeading(2, ["Reels that ", { em: "move." }], { id: "vw-title", className: "display-l" })}
          <p class="sec-lede vw-lede" data-reveal="fade">${rich(videoIntro)}</p>
          <ul class="vw-tiers" role="list">
            ${videoTiers.map(
              (t, i) => html`<li class="vw-tier" data-reveal="fade" style="--delay:${i * 70}ms">
                <span class="vw-tier-name">${t.name}</span>
                <span class="vw-tier-price mono">${t.price}</span>
                <span class="vw-tier-detail">${t.detail}</span>
              </li>`,
            )}
          </ul>
          <div class="vw-cta" data-reveal="fade">${PrimaryButton("Start a video brief", to("contact"))}</div>
        </div>
        <figure class="vw-reel" data-reveal="fade">
          <div class="vw-phone">
            <video ${attrs({
              class: "vw-video",
              poster: `${env.base}${showreel.poster}`,
              width: showreel.width,
              height: showreel.height,
              muted: true,
              loop: true,
              playsinline: true,
              controls: true,
              preload: "none",
              "aria-label": showreel.label,
              "data-island": "reel-video",
            })}><source src="${env.base}${showreel.webm}" type="video/webm"><source src="${env.base}${showreel.mp4}" type="video/mp4"></video>
          </div>
          <figcaption class="vw-cap mono">Showreel · 12 s · silent loop</figcaption>
        </figure>
      </div>

      <ul class="vw-grid" role="list">
        ${videoSamples.map(
          (v, i) => html`<li class="vw-card" data-reveal="fade" style="--delay:${(i % 3) * 80}ms">
            <a class="vw-link" href="${v.href}" target="_blank" rel="noopener">
              <span class="vw-poster">
                ${Picture(v.poster, { sizes: "(max-width: 767px) 46vw, (max-width: 1199px) 30vw, 260px" })}
                <span class="vw-play" aria-hidden="true"></span>
              </span>
              <span class="vw-meta mono"><span class="vw-audio vw-audio--${v.audio}">${audioLabel[v.audio]}</span><span>${v.kind} · ${v.length}</span></span>
              <span class="vw-title">${v.title}</span>
              <span class="vw-watch mono">Watch on YouTube ${icons.arrowUpRight}<span class="sr-only"> (opens in a new tab)</span></span>
            </a>
          </li>`,
        )}
      </ul>
    </div>
  </section>`;
}
