/**
 * The project brief: data shape, validation and the transport it's sent with.
 *
 * INTEGRATION POINT — the form talks to a `BriefTransport`. Today that's
 * Web3Forms (the key lives in /config.js, as before). To move to your own
 * backend later, return `jsonEndpointTransport("https://…/brief")` from
 * `resolveTransport()` — nothing else in the form needs to change.
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

/** Ready for a future first-party endpoint that accepts the brief as JSON. */
export function jsonEndpointTransport(url: string): BriefTransport {
  return {
    name: "endpoint",
    async send(b, signal) {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(b),
        signal,
      });
      if (!res.ok) throw new BriefSendError(`Endpoint returned HTTP ${res.status}`);
    },
  };
}

/** null means "not connected": the form says so honestly instead of pretending. */
export function resolveTransport(config: RuntimeConfig): BriefTransport | null {
  return config.web3formsKey ? web3formsTransport(config.web3formsKey) : null;
}
