import { describe, expect, it } from "vitest";
import { ingredientsListHref, kindLinks } from "./model";

const button = (key: string, href: string) => ({
  _key: key,
  text: key,
  colour: "accent",
  icon: null,
  openInNewTab: false,
  href,
});

describe("ingredientsListHref", () => {
  it("lands on the heading with the product's name", () => {
    expect(ingredientsListHref("/ingredients-list", "Italian Hoagie")).toBe(
      "/ingredients-list#italian-hoagie",
    );
    // The old anchors: "&" is read as "and".
    expect(ingredientsListHref("/ingredients-list", "Smoked Ham & Cheddar Hoagie")).toBe(
      "/ingredients-list#smoked-ham-and-cheddar-hoagie",
    );
  });

  it("replaces an anchor stored on the shared button", () => {
    expect(ingredientsListHref("/ingredients-list#cheese-pizza", "White Pizza")).toBe(
      "/ingredients-list#white-pizza",
    );
  });

  it("leaves an outside link alone and drops a missing one", () => {
    expect(ingredientsListHref("https://example.com/list", "White Pizza")).toBe(
      "https://example.com/list",
    );
    expect(ingredientsListHref(null, "White Pizza")).toBeNull();
  });
});

describe("kindLinks", () => {
  const settings = {
    hoagie: { heroButtons: [button("more", "/products")], ingredientsListButton: button("list", "/ingredients-list") },
    pizza: { heroButtons: [button("more", "/products#pizza")], ingredientsListButton: null },
    salsa: { heroButtons: [button("other", "/flavored-salsas")], ingredientsListButton: null },
  };

  it("gives each kind its own buttons", () => {
    expect(kindLinks(settings, "pizza").heroButtons[0].href).toBe("/products#pizza");
    expect(kindLinks(settings, "salsa").ingredientsListButton).toBeNull();
    expect(kindLinks(settings, "hoagie").ingredientsListButton?.href).toBe("/ingredients-list");
  });

  it("gives no buttons without settings or a kind", () => {
    expect(kindLinks(null, "hoagie")).toEqual({ heroButtons: [], ingredientsListButton: null });
    expect(kindLinks(settings, "taco")).toEqual({ heroButtons: [], ingredientsListButton: null });
  });
});
