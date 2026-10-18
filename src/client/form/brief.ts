/**
 * The project brief: data shape, validation and the transport it's sent with.
 *
 * INTEGRATION POINT — the form talks to a `BriefTransport`. Briefs go to the
 * studio's own endpoint first (/api/brief.php: saves the lead to the admin
 * inbox, then sends the Telegram and email alerts). If that endpoint is down,
 * or saved the lead but couldn't alert anyone, the brief also goes through
 * Web3Forms (key in /config.js) — so an enquiry is never silently lost.
 */
import type { RuntimeConfig } from "../config.ts";

export interface ProjectBrief {
  name: string;
  email: string;
  company: string;
  projectType: string;
  budget: string;
  preferredContact: string;
  message: string;
  page: string;
}

export type BriefField = "name" | "email" | "message";
export type BriefErrors = Partial<Record<BriefField, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateBrief(b: ProjectBrief): BriefErrors {
  const errors: BriefErrors = {};
  if (!b.name) errors.name = "Please tell us your name.";
  else if (b.name.length > 120) errors.name = "That’s a long name — could you shorten it?";

  if (!b.email) errors.email = "We need an email address to reply to.";
  else if (b.email.length > 254 || !EMAIL_RE.test(b.email)) errors.email = "That email address doesn’t look right — mind checking it?";

  if (!b.message) errors.message = "A few lines about the project, please.";
  else if (b.message.length < 10) errors.message = "Just a little more detail — a sentence or two is plenty.";
  else if (b.message.length > 4000) errors.message = "That’s over 4,000 characters — could you trim it a little?";
  return errors;
}

export interface BriefTransport {
  readonly name: string;
  send(brief: ProjectBrief, signal: AbortSignal): Promise<void>;
}

export class BriefSendError extends Error {
  override name = "BriefSendError";
}

/** One line only — keeps subjects and headers clean whatever gets typed. */
const oneLine = (s: string) => s.replace(/[\r\n\t]+/g, " ").slice(0, 140);

export function web3formsTransport(accessKey: string): BriefTransport {
  return {
    name: "web3forms",
    async send(b, signal) {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `New project brief — ${oneLine(b.company || b.name)}`,
          from_name: "projects.pablochtech.com",
          name: oneLine(b.name),
          email: b.email,
          replyto: b.email,
          company: b.company || "—",
          project_type: b.projectType || "—",
          budget: b.budget || "—",
          preferred_contact: b.preferredContact || "Email is fine",
          message: b.message,
          page: b.page,
        }),
        signal,
      });
      let data: unknown = null;
      try {
        data = await res.json();
      } catch {
        /* non-JSON error page */
      }
      const ok = typeof data === "object" && data !== null && (data as { success?: unknown }).success === true;
      if (!res.ok || !ok) throw new BriefSendError(`Web3Forms rejected the submission (HTTP ${res.status})`);
    },
  };
}

/** Where the first-party endpoint lives (PHP on the same host). */
export const BRIEF_ENDPOINT = "/api/brief.php";

/**
 * The studio's own endpoint. Resolves to whether anyone was alerted, so the
 * caller can add a second channel when the lead was saved but not announced.
 */
async function postToEndpoint(url: string, b: ProjectBrief, signal: AbortSignal): Promise<{ notified: boolean }> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(b),
    signal,
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON error page, e.g. no PHP on a local preview */
  }
  const body = (typeof data === "object" && data !== null ? data : {}) as { ok?: unknown; notified?: unknown };
  if (!res.ok || body.ok !== true) throw new BriefSendError(`Endpoint returned HTTP ${res.status}`);
  return { notified: body.notified === true };
}

export function jsonEndpointTransport(url: string): BriefTransport {
  return {
    name: "endpoint",
    async send(b, signal) {
      await postToEndpoint(url, b, signal);
    },
  };
}

/** How long the first-party endpoint gets before Web3Forms takes over. */
const ENDPOINT_TIMEOUT_MS = 12_000;

/**
 * Own endpoint first, Web3Forms as the safety net:
 *   saved + alerted        → done
 *   saved, nobody alerted  → also Web3Forms (its failure is fine: the lead is saved)
 *   endpoint failed        → Web3Forms decides success
 */
export function endpointWithFallback(url: string, fallback: BriefTransport | null): BriefTransport {
  return {
    name: "endpoint+fallback",
    async send(b, signal) {
      const inner = new AbortController();
      const abort = () => inner.abort();
      signal.addEventListener("abort", abort, { once: true });
      const timer = window.setTimeout(abort, ENDPOINT_TIMEOUT_MS);
      let saved = false;
      try {
        const { notified } = await postToEndpoint(url, b, inner.signal);
        if (notified) return;
        saved = true;
      } catch (err) {
        if (!fallback || signal.aborted) throw err;
        console.warn("[brief] endpoint failed, using fallback", err);
      } finally {
        window.clearTimeout(timer);
        signal.removeEventListener("abort", abort);
      }
      if (!fallback) return;
      try {
        await fallback.send(b, signal);
      } catch (err) {
        if (!saved) throw err;
        console.warn("[brief] saved, but the fallback alert failed", err);
      }
    },
  };
}

/** null means "not connected": the form says so honestly instead of pretending. */
export function resolveTransport(config: RuntimeConfig): BriefTransport {
  return endpointWithFallback(BRIEF_ENDPOINT, config.web3formsKey ? web3formsTransport(config.web3formsKey) : null);
}
