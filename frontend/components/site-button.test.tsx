import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { buttonColours, siteIcons } from "../../shared/site-design";
import { buttonVariantForColour } from "@/lib/button-colour";
import { SiteButton } from "./site-button";
import { siteIconViewBoxes } from "./site-icon";

describe("site icons", () => {
  it("draws every icon of the site's 22-icon list", () => {
    expect(siteIcons).toHaveLength(22);
    expect(Object.keys(siteIconViewBoxes).sort()).toEqual(
      siteIcons.map(({ value }) => value).sort(),
    );
  });
});

describe("button colours", () => {
  it("maps each of the four old styles to its own Starter button style", () => {
    expect(
      Object.fromEntries(
        buttonColours.map(({ value }) => [value, buttonVariantForColour(value)]),
      ),
    ).toEqual({
      accent: "primary",
      primary: "secondary",
      "light-accent": "primary-inverted",
      "light-primary": "secondary-inverted",
    });
  });

  it("draws a missing or unknown colour as the main (red) action", () => {
    expect(buttonVariantForColour(undefined)).toBe("primary");
    expect(buttonVariantForColour("dark")).toBe("primary");
  });
});

describe("SiteButton", () => {
  const iconSides = (icon: string) => {
    render(
      <SiteButton
        button={{ text: `Go ${icon}`, href: "/pricing-info", icon }}
      />,
    );
    const link = screen.getByRole("link", { name: `Go ${icon}` });
    return [...link.children].map((child) =>
      child.tagName === "svg" ? child.getAttribute("data-icon") : "label",
    );
  };

  it("puts chevron-right after the label and every other icon before it", () => {
    expect(iconSides("chevron-right")).toEqual(["label", "chevron-right"]);
    expect(iconSides("chevron-left")).toEqual(["chevron-left", "label"]);
    expect(iconSides("price-tag")).toEqual(["price-tag", "label"]);
  });

  it("draws no icon when none is chosen", () => {
    render(<SiteButton button={{ text: "Plain", href: "/" }} />);
    expect(screen.getByRole("link", { name: "Plain" }).querySelector("svg")).toBeNull();
  });

  it("opens an external link in a new tab only when asked", () => {
    render(
      <SiteButton
        button={{
          text: "Order form",
          href: "https://example.com/order",
          openInNewTab: true,
        }}
      />,
    );
    const link = screen.getByRole("link", { name: "Order form" });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("draws nothing without text or a safe link", () => {
    const { container } = render(
      <>
        <SiteButton button={{ text: "  ", href: "/" }} />
        <SiteButton button={{ text: "Bad", href: "javascript:alert(1)" }} />
      </>,
    );
    expect(container.innerHTML).toBe("");
  });
});
