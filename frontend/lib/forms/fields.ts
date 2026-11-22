import { z } from "zod";

/**
 * The pieces every Website form is built from: the field rules the browser
 * and the server share, and the helpers that turn answers into the
 * human-readable values the office reads in Formspark and in its office
 * notification. Guide: docs/agents/form-notifications.md.
 */

/** The hidden field only a bot fills in. People never see or reach it. */
export const HONEYPOT_FIELD = "fax";

/** What a payload holds for an optional field left empty. The emails hide those rows. */
export const EMPTY = "—";

/** The sender name on both emails. Formspark fixes the address itself. */
export const EMAIL_FROM = "Marianna's Fundraisers website";

/** The answers to "How did you hear about us?", in the old form's order. */
export const HEARD_ABOUT_OPTIONS = [
  "Internet Search",
  "Friend",
  "Social Media",
  "Mailer",
  "Other",
] as const;

export const NEWSLETTER_LABEL =
  "Subscribe to our newsletter (we don't spam and we never share your contact info with anyone else)";
export const NEWSLETTER_OPTION =
  "I agree to receive occasional newsletters about Marianna's Fundraisers";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const ZIP = /^\d{5}(-\d{4})?$/;

/** The ten digits of a US phone number, or null when it is not one. */
export function usPhoneDigits(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return null;
}

/** A US phone number as the office reads it, for example "(610) 555-0147". */
export function formatUsPhone(value: string) {
  const digits = usPhoneDigits(value);
  if (!digits) return value.trim();
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export const requiredText = (message: string, max = 200) =>
  z.string().trim().min(1, message).max(max, `Keep it under ${max} characters.`);

export const optionalText = (max = 200) =>
  z.string().trim().max(max, `Keep it under ${max} characters.`);

export const longText = (max = 3000) => optionalText(max);

export const emailField = requiredText("Enter your email address.", 254).regex(
  EMAIL,
  "Enter a valid email address, like name@example.com.",
);

export const requiredPhone = requiredText("Enter your phone number.", 40).refine(
  (value) => usPhoneDigits(value) !== null,
  "Enter a 10-digit US phone number.",
);

export const optionalPhone = optionalText(40).refine(
  (value) => !value || usPhoneDigits(value) !== null,
  "Enter a 10-digit US phone number.",
);

/** A zip code, checked only when given. Required zip codes add their own rule. */
export const zipField = optionalText(10).refine(
  (value) => !value || ZIP.test(value),
  "Enter a 5-digit zip code.",
);

export const nameFields = {
  firstName: requiredText("Enter your first name.", 100),
  lastName: requiredText("Enter your last name.", 100),
};

export const addressFields = {
  addressLine1: optionalText(),
  addressLine2: optionalText(),
  city: optionalText(100),
  state: optionalText(50),
  // Checked by each form only where the zip code is shown (see zipField).
  zip: optionalText(10),
};

export const heardAboutField = z.array(z.enum(HEARD_ABOUT_OPTIONS)).max(HEARD_ABOUT_OPTIONS.length);

export type AddressValues = {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
};

/** The given answer, or the "—" an empty optional field sends. */
export function orEmpty(value: string | undefined) {
  return value?.trim() || EMPTY;
}

/** A checkbox list as one line, or "—" when nothing is ticked. */
export function joinList(values: readonly string[] | undefined) {
  return values?.length ? values.join(", ") : EMPTY;
}

/** An address as one line, for example "12 Main St, Apt 4, Pittsburgh, PA 15201", or "—". */
export function addressLine(address: AddressValues) {
  const stateZip = [address.state, address.zip].map((part) => part?.trim()).filter(Boolean).join(" ");
  const parts = [address.addressLine1, address.addressLine2, address.city, stateZip]
    .map((part) => part?.trim())
    .filter(Boolean);
  return parts.length ? parts.join(", ") : EMPTY;
}

export function fullName(values: { firstName: string; lastName: string }) {
  return `${values.firstName.trim()} ${values.lastName.trim()}`;
}

const EASTERN_TIME = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/**
 * The time an entry was sent, in Eastern time and ready to show, for example
 * "Nov 5, 2026, 10:30 AM ET". The emails print it as it is, so they need no
 * time zone support from Formspark.
 */
export function easternSentTime(sentAt: Date) {
  // ICU puts a narrow no-break space before AM/PM; mail clients get a plain one.
  return `${EASTERN_TIME.format(sentAt).replace(/\s/g, " ")} ET`;
}

/** Where and when an entry was sent: the fields every payload ends with. */
export type EntryMeta = {
  /** The path the form was sent from, for example "/contact-us". */
  page: string;
  sentAt: Date;
};

export function metaFields(meta: EntryMeta) {
  return { page: meta.page, sent_at: easternSentTime(meta.sentAt) };
}

/** The result a form's server action returns to the browser. */
export type FormResult =
  | { status: "idle" }
  | { status: "sent" }
  | { status: "invalid"; errors: Record<string, string> }
  | { status: "failed" };

/** How a visitor reaches the office when their entry did not go through: from the site settings. */
export type OfficeContact = { phone?: string; email?: string };

/** One Website form: its rules, and the Formspark payload its answers become. */
export type FormDefinition<Values> = {
  /** The form's name in logs and in the office notification, for example "Contact form". */
  name: string;
  schema: z.ZodType<Values>;
  payload(values: Values, meta: EntryMeta): Record<string, unknown>;
};
