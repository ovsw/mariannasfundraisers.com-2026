import type { FormDefinition, FormResult } from "@/lib/forms/fields";
import { HONEYPOT_FIELD } from "@/lib/forms/fields";

/**
 * The delivery every Website form calls through: the honeypot, the send
 * limit, the server-side check, and the post to the form's own Formspark
 * form, which emails the office notification and the reply email. The
 * visitor's browser never talks to Formspark. Guide:
 * docs/agents/form-notifications.md.
 */

/** Posts one payload to Formspark, or throws. */
export type FormsparkClient = (payload: Record<string, unknown>) => Promise<void>;

export function createFormsparkClient(formId: string | undefined): FormsparkClient {
  return async (payload) => {
    if (!formId) throw new Error("the Formspark form ID is not set");
    const response = await fetch(`https://submit-form.com/${encodeURIComponent(formId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`Formspark answered HTTP ${response.status}`);
  };
}

/**
 * Counts sends per visitor in this server instance's memory. Each instance
 * keeps its own count, so it slows a flood from one visitor; it is not a
 * global quota.
 */
export function createSubmitLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const sends = new Map<string, number[]>();
  return function allow(visitor: string, now: number) {
    if (sends.size > 1000) {
      for (const [key, times] of sends) {
        if (times.every((time) => now - time >= windowMs)) sends.delete(key);
      }
    }
    const recent = (sends.get(visitor) ?? []).filter((time) => now - time < windowMs);
    if (recent.length >= limit) {
      sends.set(visitor, recent);
      return false;
    }
    sends.set(visitor, [...recent, now]);
    return true;
  };
}

export type SubmitLimiter = ReturnType<typeof createSubmitLimiter>;

/** What the browser sends besides the answers. */
export type FormMeta = {
  /** The path the form was sent from. */
  page?: unknown;
  /** The honeypot field's value. */
  [HONEYPOT_FIELD]?: unknown;
};

export type FormDeliveryDeps = {
  formspark: FormsparkClient;
  allow: SubmitLimiter;
  now?: () => Date;
};

/** A site path as sent by the browser, or "unknown" when it is not one. */
export function pagePath(value: unknown) {
  return typeof value === "string" &&
    value.length <= 200 &&
    /^\/(?!\/)[A-Za-z0-9\-._~/]*$/.test(value)
    ? value
    : "unknown";
}

/** The first message of each invalid field, keyed by its name. */
function fieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const name = String(issue.path[0] ?? "form");
    errors[name] ??= issue.message;
  }
  return errors;
}

function reason(error: unknown) {
  const name = (error as { name?: unknown } | null)?.name;
  if (name === "TimeoutError" || name === "AbortError") return "no answer in 10 seconds";
  return error instanceof Error ? error.message : "unknown error";
}

/**
 * Check one sent form and post it to Formspark. The visitor key identifies
 * one visitor for the send limit; it is not stored. Only the reason a post
 * failed is logged, never the entry, which holds the visitor's details.
 */
export async function submitForm<Values>(
  form: FormDefinition<Values>,
  values: unknown,
  meta: FormMeta,
  visitor: string,
  { formspark, allow, now = () => new Date() }: FormDeliveryDeps,
): Promise<FormResult> {
  const honeypot = meta[HONEYPOT_FIELD];
  if (typeof honeypot === "string" && honeypot.trim()) return { status: "failed" };

  const checked = form.schema.safeParse(values);
  if (!checked.success) return { status: "invalid", errors: fieldErrors(checked.error.issues) };

  const sentAt = now();
  if (!allow(visitor, sentAt.getTime())) return { status: "failed" };

  try {
    await formspark(form.payload(checked.data, { page: pagePath(meta.page), sentAt }));
    return { status: "sent" };
  } catch (error) {
    console.error(`${form.name} did not reach Formspark: ${reason(error)}`);
    return { status: "failed" };
  }
}
