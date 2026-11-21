import { defineField } from "sanity";
import { sectionThemes } from "../../../../shared/site-design.ts";

export const sectionThemeValues = sectionThemes.map(({ title, value }) => ({
  title,
  value,
}));

const allowedThemes = new Set<string>(sectionThemes.map(({ value }) => value));

export default defineField({
  name: "theme",
  title: "Theme",
  type: "string",
  description:
    "The section's background: Light (white), Shaded (off-white), Muslin (dark muslin texture) or Primary (green). Neighbouring sections with the same theme read as one surface.",
  options: { list: sectionThemeValues },
  initialValue: "light",
  validation: (rule) =>
    rule.required().custom((value) =>
      typeof value === "string" && allowedThemes.has(value)
        ? true
        : "Choose Light, Shaded, Muslin or Primary.",
    ),
});
