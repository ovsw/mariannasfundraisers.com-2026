import { stegaClean } from "next-sanity";
import {
  buttonColours,
  defaultButtonColour,
  type ButtonColourValue,
} from "../../shared/site-design";

export type SiteButtonVariant =
  | "primary"
  | "secondary"
  | "primary-inverted"
  | "secondary-inverted";

// The old site's four button styles, stored under their old names, mapped to
// the Starter's button styles in components/ui/button.tsx. The Starter's
// `primary` is the main action, which on this site is red (the old "accent").
const variantByColour: Record<ButtonColourValue, SiteButtonVariant> = {
  accent: "primary",
  primary: "secondary",
  "light-accent": "primary-inverted",
  "light-primary": "secondary-inverted",
};

const colourValues = new Set<string>(buttonColours.map(({ value }) => value));

/** The button style for a stored colour; a missing or unknown one is red. */
export function buttonVariantForColour(value: unknown): SiteButtonVariant {
  const clean = typeof value === "string" ? stegaClean(value) : null;
  const colour =
    clean && colourValues.has(clean)
      ? (clean as ButtonColourValue)
      : defaultButtonColour;
  return variantByColour[colour];
}
