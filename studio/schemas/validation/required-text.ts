import type { StringRule } from "sanity";

/**
 * A required string or text field that must hold more than spaces. Renderers
 * trim text before they draw it, so a value of only spaces would hide its
 * Section or item while Studio still let the page publish.
 *
 * Every required string or text field uses this rule. Chain no other
 * constraint on the result: `.error(message)` replaces their messages too.
 * Return an array instead, for example `[requiredText(rule), rule.max(96)]`.
 */
export function requiredText(
  rule: StringRule,
  message = "Required. Text of only spaces does not count.",
) {
  return rule
    .required()
    .custom((value) =>
      typeof value === "string" && !value.trim() ? message : true,
    )
    .error(message);
}
