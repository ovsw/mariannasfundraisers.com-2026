import { describe, expect, it } from "vitest";
import { sectionThemes } from "../../../shared/site-design";
import {
  resolveSectionBands,
  resolveSectionBoundaries,
  resolveSectionTheme,
  sectionSceneClassName,
  sectionThemeValues,
} from "./section-boundaries";

describe("Page Builder section boundaries", () => {
  it("knows the same four themes as the Studio's theme field", () => {
    expect([...sectionThemeValues]).toEqual(
      sectionThemes.map(({ value }) => value),
    );
  });

  it.each([
    [undefined, "light"],
    [null, "light"],
    ["invalid", "light"],
    ["dark", "light"],
    ["light", "light"],
    ["shaded", "shaded"],
    ["muslin", "muslin"],
    ["primary", "primary"],
  ])("resolves %s to %s", (value, expected) => {
    expect(resolveSectionTheme(value)).toBe(expected);
  });

  it("gives each theme its own scene class", () => {
    for (const theme of sectionThemeValues) {
      expect(sectionSceneClassName(theme, "outer", "outer")).toContain(
        `section-scene-${theme}`,
      );
    }
  });

  it("resolves visible joins and preserves outer boundaries", () => {
    expect(
      resolveSectionBoundaries([
        { key: "first", theme: "light" },
        { key: "same", theme: "light" },
        { key: "different", theme: "muslin" },
        { key: "unknown", theme: null },
        { key: "untitled" },
      ]),
    ).toEqual([
      { key: "first", theme: "light", top: "outer", bottom: "seam" },
      { key: "same", theme: "light", top: "seam", bottom: "edge" },
      { key: "different", theme: "muslin", top: "edge", bottom: "edge" },
      { key: "unknown", theme: null, top: "edge", bottom: "edge" },
      { key: "untitled", theme: null, top: "edge", bottom: "outer" },
    ]);
  });

  it("compares preview-encoded themes after cleaning them", () => {
    const hidden = String.fromCodePoint(8203, 8203, 8203, 8203);
    const encodedShaded = `shaded${hidden}`;
    expect(resolveSectionTheme(encodedShaded)).toBe("shaded");
    expect(
      resolveSectionBoundaries([
        { key: "one", theme: encodedShaded },
        { key: "two", theme: "shaded" },
      ]).map(({ top, bottom }) => [top, bottom]),
    ).toEqual([
      ["outer", "seam"],
      ["seam", "outer"],
    ]);
  });

  it("groups seam-joined sections into bands", () => {
    expect(
      resolveSectionBands(
        resolveSectionBoundaries([
          { key: "lead" },
          { key: "a", theme: "light" },
          { key: "b", theme: "light" },
          { key: "c", theme: "primary" },
          { key: "d", theme: "primary" },
          { key: "e", theme: "shaded" },
        ]),
      ),
    ).toEqual([
      { keys: ["lead"], theme: null },
      { keys: ["a", "b"], theme: "light" },
      { keys: ["c", "d"], theme: "primary" },
      { keys: ["e"], theme: "shaded" },
    ]);
  });
});
