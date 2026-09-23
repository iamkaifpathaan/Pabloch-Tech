import { qs } from "../core/env.ts";
import { readConfig } from "../config.ts";
import { resolveTransport, validateBrief, type BriefErrors, type BriefField, type ProjectBrief } from "../form/brief.ts";

const TIMEOUT_MS = 20_000;

/**
 * Contact form: inline validation (on blur once touched, on submit always),
 * an honest "not connected" state, a timeout, and a real confirmation only
 * after the transport reports success. All text is set with textContent.
 */
export function mountBriefForm(wrap: HTMLElement): void {
  const form = qs<HTMLFormElement>("form", wrap);
  const submit = qs<HTMLButtonElement>("[data-submit]", wrap);
  const submitLabel = qs<HTMLElement>("[data-submit-label]", wrap);
  const status = qs<HTMLElement>("[data-status]", wrap);
  const done = qs<HTMLElement>("[data-done]", wrap);
  if (!form || !submit || !status || !done) return;

  const config = readConfig();
  const transport = resolveTransport(config);
  const idleLabel = submitLabel?.textContent ?? "Send project brief";
  if (!transport) console.warn("[brief] No valid Web3Forms key in config.js — the form will ask visitors to email instead.");

  submit.disabled = false;
  let attempted = false;
  const touched = new Set<BriefField>();
  let busy = false;

  const value = (name: string): string => {
    const el = form.elements.namedItem(name);
    if (el instanceof RadioNodeList) return el.value.trim();
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return el.value.trim();
    return "";
  };

  const collect = (): ProjectBrief => ({
    name: value("name"),
    email: value("email"),
    company: value("company"),
    projectType: value("project_type"),
    budget: value("budget"),
    preferredContact: value("preferred_contact"),
    message: value("message"),
    page: `${location.origin}${location.pathname}`,
  });

  const fieldEl = (name: BriefField) => form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
  const errEl = (name: BriefField) => qs<HTMLElement>(`[data-err-for="${name}"]`, form);

  const showErrors = (errors: BriefErrors, only?: BriefField) => {
    const names: BriefField[] = only ? [only] : ["name", "email", "message"];
    for (const n of names) {
      const input = fieldEl(n);
      const err = errEl(n);
      const msg = errors[n] ?? "";
      if (input) {
        if (msg) input.setAttribute("aria-invalid", "true");
        else input.removeAttribute("aria-invalid");
      }
      if (err) err.textContent = msg;
    }
  };

  const setStatus = (text: string, isError = false, withEmail = false) => {
    status.textContent = "";
    status.classList.toggle("is-error", isError);
    status.append(document.createTextNode(text));
    if (withEmail) {
      const a = document.createElement("a");
      a.href = `mailto:${config.email}`;
      a.textContent = config.email;
      status.append(a, document.createTextNode(" — it reaches us just the same."));
    }
  };

  const setBusy = (on: boolean) => {
    busy = on;
    submit.disabled = on;
    submit.setAttribute("aria-busy", String(on));
    if (submitLabel) submitLabel.textContent = on ? "Sending…" : idleLabel;
  };

  const finish = () => {
    form.hidden = true;
    done.hidden = false;
    done.focus({ preventScroll: true });
    done.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  for (const n of ["name", "email", "message"] as const) {
    const input = fieldEl(n);
    input?.addEventListener("blur", () => {
      if (input.value.trim() !== "") touched.add(n);
      if (touched.has(n) || attempted) showErrors(validateBrief(collect()), n);
    });
    input?.addEventListener("input", () => {
      // clear an error as soon as it's fixed; don't nag while typing
      if (input.getAttribute("aria-invalid") === "true" && !validateBrief(collect())[n]) showErrors({}, n);
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (busy) return;
    attempted = true;
    setStatus("");

    // Honeypot filled: a bot. Give it nothing to learn from.
    if (value("pt_hp")) {
      finish();
      return;
    }

    const brief = collect();
    const errors = validateBrief(brief);
    showErrors(errors);
    const firstInvalid = (["name", "email", "message"] as const).find((n) => errors[n]);
    if (firstInvalid) {
      setStatus("Please check the highlighted fields.", true);
      fieldEl(firstInvalid)?.focus();
      return;
    }

    if (!transport) {
      setStatus("This form isn’t connected yet, so nothing was sent. Please email ", true, true);
      return;
    }

    setBusy(true);
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      await transport.send(brief, controller.signal);
      finish();
    } catch (err) {
      console.error("[brief]", err);
      const timedOut = controller.signal.aborted;
      setStatus(
        timedOut ? "That took too long, so we stopped trying — your brief was not sent. Please try again, or email " : "Something went wrong and your brief was not sent. Please try again, or email ",
        true,
        true,
      );
    } finally {
      window.clearTimeout(timer);
      setBusy(false);
    }
  });
}
