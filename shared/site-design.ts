// The design choices editors make, shared by the Studio (field options) and
// the Website (rendering). See docs/design.md.

/**
 * The section theme: a section's background colour, from the four the old
 * site used. Each theme re-points the job tokens in
 * frontend/app/globals.css (`.section-scene-<value>`).
 */
export const sectionThemes = [
  { title: "Light", value: "light", description: "White" },
  { title: "Shaded", value: "shaded", description: "Off-white" },
  { title: "Muslin", value: "muslin", description: "Dark muslin texture" },
  { title: "Primary", value: "primary", description: "Green" },
] as const;

export type SectionThemeValue = (typeof sectionThemes)[number]["value"];

/**
 * A button's colours: the four button styles of the old site, stored under
 * their old names so imported buttons keep their look. The Website maps each
 * to one of the Starter's button styles (frontend/lib/button-colour.ts).
 */
export const buttonColours = [
  { title: "Red", value: "accent" },
  { title: "Green", value: "primary" },
  { title: "White with red text", value: "light-accent" },
  { title: "White with green text", value: "light-primary" },
] as const;

export type ButtonColourValue = (typeof buttonColours)[number]["value"];

export const defaultButtonColour: ButtonColourValue = "accent";

/**
 * The site's icon list: the 22 icons of the old site's `icons` option list,
 * under their old values. The SVGs live in frontend/components/site-icon.tsx.
 */
export const siteIcons = [
  { title: "Book of spells", value: "book-spells" },
  { title: "Chef hat", value: "chef-hat" },
  { title: "Chevron left", value: "chevron-left" },
  { title: "Chevron right", value: "chevron-right" },
  { title: "Delivery truck", value: "delivery-truck" },
  { title: "Documents", value: "documents" },
  { title: "Documents, checked", value: "documents-checked" },
  { title: "Envelope", value: "envelope" },
  { title: "Info", value: "info" },
  { title: "Info, round", value: "info-round" },
  { title: "Hand, asking", value: "hand-asking" },
  { title: "Hand, heart", value: "hand-heart" },
  { title: "Hand, helping", value: "hand-helping" },
  { title: "Heart", value: "heart" },
  { title: "Hoagie", value: "hoagie" },
  { title: "Price tag", value: "price-tag" },
  { title: "Paper plane", value: "paper-plane" },
  { title: "People", value: "people" },
  { title: "Phone ringing", value: "phone-ringing" },
  { title: "Pizza", value: "pizza" },
  { title: "Search", value: "search" },
  { title: "Share arrow", value: "share" },
] as const;

export type SiteIconName = (typeof siteIcons)[number]["value"];

const siteIconNames = new Set<string>(siteIcons.map(({ value }) => value));

export function isSiteIconName(value: unknown): value is SiteIconName {
  return typeof value === "string" && siteIconNames.has(value);
}

/**
 * Which side of a button's label its icon sits on. It is not a field:
 * `chevron-right` points onward, so it follows the label; every other icon
 * leads it.
 */
export function buttonIconSide(icon: SiteIconName): "before" | "after" {
  return icon === "chevron-right" ? "after" : "before";
}
