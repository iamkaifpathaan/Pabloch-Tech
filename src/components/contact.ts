import { attrs, html, type SafeHtml } from "../lib/html.ts";
import { budgets, callPreferences, contactCopy, projectTypes, type Choice } from "../content/contact.ts";
import { site } from "../content/site.ts";
import { SectionLabel } from "./primitives.ts";
import { SocialList } from "./nav.ts";
import { icons } from "./icons.ts";

interface FieldOptions {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  type?: "text" | "email";
  autocomplete?: string;
  maxlength: number;
  inputmode?: string;
  hint?: string;
}

function Field(o: FieldOptions): SafeHtml {
  const describedBy = [o.hint ? `${o.id}-hint` : "", `${o.id}-err`].filter(Boolean).join(" ");
  return html`<div class="field" data-field="${o.name}">
    <label class="field-label" for="${o.id}"><span>${o.label}${o.required ? html`<span class="req" aria-hidden="true"> *</span>` : ""}</span>${o.required ? "" : html`<span class="opt mono">Optional</span>`}</label>
    <input ${attrs({
      class: "field-input",
      id: o.id,
      name: o.name,
      type: o.type ?? "text",
      autocomplete: o.autocomplete,
      inputmode: o.inputmode,
      maxlength: o.maxlength,
      required: o.required,
      "aria-required": o.required ? "true" : undefined,
      "aria-describedby": describedBy,
      spellcheck: o.type === "email" ? "false" : undefined,
    })}>
    ${o.hint ? html`<p class="field-hint" id="${o.id}-hint">${o.hint}</p>` : ""}
    <p class="field-err" id="${o.id}-err" data-err-for="${o.name}"></p>
  </div>`;
}

function Choices(o: { name: string; legend: string; choices: readonly Choice[]; checked?: string; optional?: boolean }): SafeHtml {
  return html`<fieldset class="choices" data-field="${o.name}">
    <legend class="field-label">${o.legend}${o.optional ? html`<span class="opt mono">Optional</span>` : ""}</legend>
    <div class="choice-row">
      ${o.choices.map((c, i) => {
        const id = `f-${o.name}-${i}`;
        return html`<span class="choice">
          <input ${attrs({ type: "radio", id, name: o.name, value: c.value, checked: c.value === o.checked })}>
          <label for="${id}">${c.label}</label>
        </span>`;
      })}
    </div>
  </fieldset>`;
}

export function Contact(): SafeHtml {
  return html`<section class="contact" id="contact" data-theme="ink" aria-labelledby="contact-title">
    <div class="wrap contact-grid">
      <div class="contact-intro">
        ${SectionLabel("11", "Contact")}
        <h2 class="display-l contact-title" id="contact-title" data-reveal="fade">${contactCopy.title}</h2>
        <p class="contact-lede" data-reveal="fade">${contactCopy.lede}</p>
        <div class="contact-direct" data-reveal="fade">
          <p class="mono contact-direct-label">Or reach us directly</p>
          ${SocialList("contact-social")}
          <p class="contact-call">Prefer to talk? Pick <strong>Zoom</strong> or <strong>Google Meet</strong> in the form and the invite comes back with our reply.</p>
        </div>
      </div>

      <div class="contact-form-wrap" data-island="brief-form">
        <form class="brief" id="brief" novalidate aria-describedby="brief-note">
          <div class="brief-row">
            ${Field({ id: "f-name", name: "name", label: "Name", required: true, autocomplete: "name", maxlength: 120 })}
            ${Field({ id: "f-email", name: "email", label: "Email", required: true, type: "email", autocomplete: "email", inputmode: "email", maxlength: 254 })}
          </div>
          ${Field({ id: "f-company", name: "company", label: "Company", autocomplete: "organization", maxlength: 120 })}
          ${Choices({ name: "project_type", legend: "Project type", choices: projectTypes, optional: true })}
          ${Choices({ name: "budget", legend: "Budget", choices: budgets, optional: true })}
          <div class="field" data-field="message">
            <label class="field-label" for="f-message"><span>Message<span class="req" aria-hidden="true"> *</span></span></label>
            <textarea class="field-input field-textarea" id="f-message" name="message" rows="5" maxlength="4000" required aria-required="true" aria-describedby="f-message-hint f-message-err"></textarea>
            <p class="field-hint" id="f-message-hint">What the business does, what the site needs to do, and anything you already have — a domain, a logo, an old site.</p>
            <p class="field-err" id="f-message-err" data-err-for="message"></p>
          </div>
          ${Choices({ name: "preferred_contact", legend: "How shall we talk?", choices: callPreferences, checked: "Email is fine" })}

          <div class="hp" aria-hidden="true">
            <label for="f-hp">Leave this field empty</label>
            <input id="f-hp" type="text" name="pt_hp" tabindex="-1" autocomplete="off">
          </div>

          <div class="brief-foot">
            <button class="btn btn--primary btn--lg brief-submit" type="submit" data-magnetic disabled data-submit>
              <span class="btn-label" data-submit-label>${contactCopy.submit}</span><span class="btn-icon">${icons.arrowRight}</span>
            </button>
            <p class="brief-note mono" id="brief-note">${contactCopy.reassurance}</p>
          </div>
          <p class="brief-status" role="status" aria-live="polite" data-status></p>
          <noscript><p class="brief-status is-error">This form needs JavaScript, which is switched off in your browser. Email <a href="mailto:${site.email}">${site.email}</a> instead — it reaches us just the same.</p></noscript>
        </form>

        <div class="brief-done" tabindex="-1" hidden data-done>
          <p class="mono brief-done-kicker"><span class="live-dot" aria-hidden="true"></span>Sent</p>
          <h3 class="display-l">${contactCopy.success.title}</h3>
          <p>${contactCopy.success.body}</p>
          <p class="mono">In a hurry? <a href="mailto:${site.email}" data-email-link><span data-email-text>${site.email}</span></a></p>
        </div>
      </div>
    </div>
  </section>`;
}
