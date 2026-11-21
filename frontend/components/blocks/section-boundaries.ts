import { cn } from "@/lib/utils";
import { stegaClean } from "next-sanity";

// The four section themes, in the order of shared/site-design.ts, which the
// Studio's theme field reads. This file imports nothing local, so the Page
// Builder generator's test can load it on its own; section-boundaries.test.ts
// checks that the two lists match.
export const sectionThemeValues = ["light", "shaded", "muslin", "primary"] as const;
export type SectionTheme = (typeof sectionThemeValues)[number];
export type SectionBoundary = "outer" | "seam" | "edge";
export type SectionSceneProps = {
  theme?: string | null;
  top?: SectionBoundary;
  bottom?: SectionBoundary;
};

export type SectionDescriptor = {
  key: string;
  theme?: string | null;
};

export type ResolvedSectionBoundary = {
  key: string;
  theme: SectionTheme | null;
  top: SectionBoundary;
  bottom: SectionBoundary;
};

export function resolveSectionTheme(value: string | null | undefined): SectionTheme {
  const clean = stegaClean(value);
  return (sectionThemeValues as readonly string[]).includes(clean ?? "")
    ? (clean as SectionTheme)
    : "light";
}

export function resolveSectionBoundaries(
  sections: SectionDescriptor[],
): ResolvedSectionBoundary[] {
  return sections.map((section, index) => {
    const previous = sections[index - 1];
    const next = sections[index + 1];
    return {
      key: section.key,
      theme: section.theme == null ? null : resolveSectionTheme(section.theme),
      top: previous ? resolveJoin(previous, section) : "outer",
      bottom: next ? resolveJoin(section, next) : "outer",
    };
  });
}

function resolveJoin(upper: SectionDescriptor, lower: SectionDescriptor): SectionBoundary {
  // A section without a theme, such as a Scaffold, never shares a surface.
  if (!upper.theme || !lower.theme) return "edge";
  return resolveSectionTheme(upper.theme) === resolveSectionTheme(lower.theme)
    ? "seam"
    : "edge";
}

export function sectionSceneClassName(
  theme: SectionTheme,
  top: SectionBoundary,
  bottom: SectionBoundary,
) {
  return cn(
    "section-scene",
    `section-scene-${resolveSectionTheme(theme)}`,
    top === "seam" ? "section-scene-seam-top" : "section-scene-edge-top",
    bottom === "seam"
      ? "section-scene-seam-bottom"
      : "section-scene-edge-bottom",
  );
}

export type SectionBand = {
  /** Keys of the sections in the band, in page order. */
  keys: string[];
  theme: SectionTheme | null;
};

/**
 * Groups consecutive sections joined by seams into bands. Sections in one
 * band share a theme and read as one continuous surface, so the stylesheet
 * paints a surface texture (Muslin's) once per band instead of once per
 * section. An outer or edge boundary always starts a new band.
 */
export function resolveSectionBands(
  boundaries: ResolvedSectionBoundary[],
): SectionBand[] {
  const bands: SectionBand[] = [];
  for (const boundary of boundaries) {
    const current = bands[bands.length - 1];
    if (current && boundary.top === "seam") {
      current.keys.push(boundary.key);
      continue;
    }
    bands.push({ keys: [boundary.key], theme: boundary.theme });
  }
  return bands;
}
