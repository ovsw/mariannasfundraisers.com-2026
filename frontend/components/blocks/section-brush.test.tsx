import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { resolveSectionBrushes, SectionBrush } from "./section-brush";

function edges(themes: (string | null)[]) {
  return resolveSectionBrushes(
    themes.map((theme, index) => ({ key: String(index), theme })),
  ).map(({ top, bottom }) => `${top ? "T" : "-"}${bottom ? "B" : "-"}`);
}

describe("brushed edge rule", () => {
  it("draws nothing between sections with the same theme", () => {
    expect(edges(["light", "light", "light"])).toEqual(["--", "--", "--"]);
    expect(edges(["primary", "primary"])).toEqual(["--", "--"]);
  });

  it("lets the higher-ranked theme paint a join between different themes", () => {
    // Shaded outranks Light: it paints into the Light sections on both sides.
    expect(edges(["light", "shaded", "light"])).toEqual(["--", "TB", "--"]);
    // Primary outranks Shaded.
    expect(edges(["shaded", "primary"])).toEqual(["--", "T-"]);
    expect(edges(["primary", "shaded"])).toEqual(["-B", "--"]);
  });

  it("never lets Muslin paint: its neighbour paints into it", () => {
    expect(edges(["light", "muslin", "shaded"])).toEqual(["-B", "--", "T-"]);
    expect(edges(["muslin", "primary", "muslin"])).toEqual(["--", "TB", "--"]);
  });

  it("draws nothing above the first section or below the last", () => {
    expect(edges(["shaded"])).toEqual(["--"]);
    expect(edges(["shaded", "light"])).toEqual(["-B", "--"]);
    expect(edges(["light", "shaded"])).toEqual(["--", "T-"]);
  });

  it("draws nothing next to a section without a theme", () => {
    expect(edges([null, "shaded", null])).toEqual(["--", "--", "--"]);
    expect(edges(["primary", null, "light"])).toEqual(["--", "--", "--"]);
  });

  it("reads an unknown theme as Light and cleans preview encoding", () => {
    const hidden = String.fromCodePoint(8203, 8203, 8203, 8203);
    expect(edges(["dark", "shaded"])).toEqual(["--", "T-"]);
    expect(edges([`shaded${hidden}`, "shaded"])).toEqual(["--", "--"]);
  });
});

describe("SectionBrush", () => {
  it("paints a decorative stroke in its theme's background colour", () => {
    const { container } = render(<SectionBrush edge="bottom" theme="shaded" />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.getAttribute("data-brush")).toBe("bottom");
    expect(svg?.getAttribute("class")).toContain("section-scene-shaded");
    expect(svg?.querySelector("path")?.getAttribute("d")).toBeTruthy();
  });

  it("uses different strokes for the top and bottom of the default shape", () => {
    const path = (edge: "top" | "bottom") =>
      render(<SectionBrush edge={edge} theme="light" />)
        .container.querySelector("path")
        ?.getAttribute("d");
    expect(path("top")).not.toBe(path("bottom"));
  });
});
