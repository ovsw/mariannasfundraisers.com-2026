/**
 * The shared theme and the two layouts every form email is built from: the
 * office notification and the reply email. Each layout returns a Formspark
 * template, HTML with Handlebars placeholders. Formspark sends no stylesheet,
 * so every style is inline. Rules and the script: docs/agents/form-notifications.md.
 *
 * Plain functions on purpose: `pnpm form-emails` runs this file with Node, so
 * it imports nothing but other files in this folder.
 */

/** Marianna's colours from frontend/app/globals.css, and a plain system font. */
export const theme = {
  page: "#fffdee", // cream (brand-cream-light)
  ink: "#363232", // headings and answers (brand-ink)
  inkSoft: "#5b5656", // body text, a little lighter than the ink
  rule: "#e7e5e4", // hairlines (brand-line)
  button: "#00764f", // green (brand-green)
  buttonText: "#ffffff",
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  width: 600,
} as const;

/** The signature that ends every reply email. */
export const SIGNATURE = "Marianna's Fundraisers";

/** A Handlebars placeholder for one payload field, for example `{{data.phone}}`. */
export function field(name: string) {
  return `{{data.${name}}}`;
}

/** Escapes text written here, so it shows as written. Placeholders escape themselves. */
export function text(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export type Button = {
  /** Template code, for example `Call {{data.name}}`. */
  label: string;
  /** Template code for the link, for example `tel:{{data.phone}}`. */
  href: string;
};

export type Answer = {
  /** The form's own label, as the office reads it. */
  label: string;
  /** Template code, usually `field(name)`. */
  value: string;
  /**
   * The payload field of an optional answer: the row shows only when the
   * visitor gave it. The Website sends "—" for an optional field left empty
   * and leaves out a field the form did not show (the contact form's fields
   * for another topic), and the row hides in both cases.
   */
  onlyWhenGiven?: string;
};

/** What the Website sends for an optional field left empty (frontend/lib/forms/fields.ts). */
export const EMPTY = "—";

/**
 * Shows `content` only when the payload holds the field and it is not the
 * "—" placeholder. Formspark has no `eq` helper, so the placeholder is
 * skipped with its `switch` helper.
 */
function whenGiven(name: string, content: string) {
  return `{{#if data.${name}}}{{#switch data.${name}}}{{#case "${EMPTY}"}}{{/case}}{{#default}}${content}{{/default}}{{/switch}}{{/if}}`;
}

function page(content: string) {
  return [
    `<div style="margin:0;padding:0;background-color:${theme.page};">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${theme.page};">`,
    `<tr><td align="center" style="padding:32px 16px;">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:${theme.width}px;font-family:${theme.font};color:${theme.inkSoft};font-size:16px;line-height:1.5;">`,
    content,
    `</table>`,
    `</td></tr>`,
    `</table>`,
    `</div>`,
  ].join("\n");
}

function heading(value: string) {
  return `<tr><td style="padding:0 0 12px;"><h1 style="margin:0;font-family:${theme.font};font-size:24px;line-height:1.25;font-weight:700;color:${theme.ink};">${value}</h1></td></tr>`;
}

function paragraph(value: string, padding = "0 0 16px") {
  return `<tr><td style="padding:${padding};"><p style="margin:0;font-size:16px;line-height:1.5;color:${theme.inkSoft};">${value}</p></td></tr>`;
}

function button({ label, href }: Button) {
  return [
    `<tr><td style="padding:8px 0 24px;">`,
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>`,
    `<td style="border-radius:6px;background-color:${theme.button};">`,
    `<a href="${href}" style="display:inline-block;padding:12px 24px;border-radius:6px;font-family:${theme.font};font-size:16px;font-weight:700;line-height:1.25;color:${theme.buttonText};text-decoration:none;">${label}</a>`,
    `</td></tr></table>`,
    `</td></tr>`,
  ].join("\n");
}

/**
 * The visitor's answers as label-over-value rows, in form order. A row marked
 * `onlyWhenGiven` shows only when the visitor filled that field in.
 */
function answers(list: Answer[]) {
  const rows = list.map(({ label, value, onlyWhenGiven }) => {
    const row =
      `<tr><td style="padding:10px 0;border-top:1px solid ${theme.rule};">` +
      `<div style="font-size:13px;line-height:1.4;color:${theme.inkSoft};">${text(label)}</div>` +
      `<div style="font-size:16px;line-height:1.5;color:${theme.ink};white-space:pre-line;">${value}</div>` +
      `</td></tr>`;
    return onlyWhenGiven ? whenGiven(onlyWhenGiven, row) : row;
  });
  return [
    `<tr><td style="padding:0 0 16px;">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom:1px solid ${theme.rule};">`,
    ...rows,
    `</table>`,
    `</td></tr>`,
  ].join("\n");
}

/** The page the form was sent from and when, and the entry in Formspark when Formspark gives a link. */
function smallPrint() {
  const line = (label: string, value: string) => `${text(label)}: ${value}`;
  return [
    `<tr><td style="padding:8px 0 0;font-size:13px;line-height:1.6;color:${theme.inkSoft};">`,
    [line("Page", field("page")), line("Sent", field("sent_at"))].join("<br>"),
    `{{#if viewLink}}<br><a href="{{sanitizeUrl viewLink}}" style="color:${theme.button};text-decoration:underline;">View in Formspark</a>{{/if}}`,
    `</td></tr>`,
  ].join("\n");
}

export type OfficeNotification = {
  /** What happened, as template code. */
  heading: string;
  /** One line on what the office does next, as template code. */
  nextStep: string;
  /** The visitor's answers, in form order, with the form's labels. */
  answers: Answer[];
  /** Only when there is one clear action. */
  button?: Button;
};

/**
 * The email the office gets for each entry. Its subject comes from the
 * `_email.subject` the Website sends, so the template sets none.
 */
export function officeNotification(email: OfficeNotification) {
  return page(
    [
      heading(email.heading),
      paragraph(email.nextStep, "0 0 20px"),
      answers(email.answers),
      email.button ? button(email.button) : "",
      smallPrint(),
    ]
      .filter(Boolean)
      .join("\n"),
  );
}

export type ReplyEmail = {
  /** Template code, for example `Hi {{data.first_name}},`. */
  greeting: string;
  /** What happens next, one paragraph each, as template code. */
  paragraphs: string[];
  /** What the visitor sent, repeated under "Here is what you sent us". */
  answers: Answer[];
};

/**
 * The email the visitor gets right after sending the form. Formspark adds its
 * own footer below it, which cannot be removed, so the signature ends the body.
 */
export function replyEmail(email: ReplyEmail) {
  return page(
    [
      paragraph(email.greeting),
      ...email.paragraphs.map((value) => paragraph(value)),
      paragraph(text("Here is what you sent us:"), "8px 0 12px"),
      answers(email.answers),
      paragraph(text(SIGNATURE), "8px 0 0"),
    ].join("\n"),
  );
}

/** One form's two emails, and the example entries the preview renders them with. */
export type FormEmails = {
  /** The form's name, as the office reads it. */
  form: string;
  /** The variable that holds the form's Formspark ID. */
  formIdVariable: string;
  notification: string;
  reply: { subject: string; code: string };
  /**
   * Entries shaped like the Website's Formspark payload (frontend/lib/forms),
   * the first one for the preview. The contact form has one per topic.
   */
  examples: Record<string, unknown>[];
};
