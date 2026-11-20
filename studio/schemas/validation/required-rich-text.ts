import type { Rule } from "sanity";

type RichTextMember = {
  _type?: string;
  children?: Array<{ text?: unknown }>;
};

/**
 * True when rich text holds something a visitor can see: a text block with
 * more than spaces, or any non-text member (an image, a table, a callout).
 * An array of empty paragraphs is not content.
 */
export function hasVisibleRichText(value: unknown): boolean {
  if (!Array.isArray(value)) return false;
  return value.some((member: RichTextMember) => {
    if (!member || typeof member !== "object") return false;
    if (member._type !== "block") return true;
    return (member.children ?? []).some(
      (child) => typeof child?.text === "string" && child.text.trim() !== "",
    );
  });
}

/**
 * A required rich text field that must hold visible content, not only empty
 * paragraphs. Every required rich text field uses this rule.
 */
export function requiredRichText(
  rule: Rule,
  message = "Required. Empty paragraphs do not count.",
) {
  return rule
    .required()
    .custom((value) =>
      value === undefined || hasVisibleRichText(value) ? true : message,
    )
    .error(message);
}
