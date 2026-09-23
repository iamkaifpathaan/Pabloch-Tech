import { html, type SafeHtml } from "../lib/html.ts";
import { scrubWords } from "../lib/rich.ts";
import { introNotes, introStatement } from "../content/studio.ts";
import { SectionLabel } from "./primitives.ts";

export function Intro(): SafeHtml {
  return html`<section class="intro" id="intro" data-theme="ink" aria-label="About the studio, in one paragraph">
    <div class="intro-track" data-island="scrub-text">
      <div class="wrap intro-inner">
        ${SectionLabel("01", "The studio")}
        <p class="intro-statement">${scrubWords(introStatement)}</p>
        <div class="intro-notes">
          ${introNotes.map(
            (n, i) => html`<div class="intro-note" data-reveal="fade" style="--delay:${i * 120}ms">
              <p class="mono intro-note-label">${n.label}</p>
              <p>${n.body}</p>
            </div>`,
          )}
        </div>
      </div>
    </div>
  </section>`;
}
