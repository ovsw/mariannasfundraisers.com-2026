import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import CallToActionWithImage, { hasCallToActionWithImageContent } from "./call-to-action-with-image";
import HomeHero, { hasHomeHeroContent } from "./home-hero";
import MenuTeaser, { hasMenuTeaserContent } from "./menu-teaser";
import Steps, { hasStepsContent } from "./steps";
import Testimonials, { hasTestimonialsContent } from "./testimonials";

// The home page sections (issue #18): what each draws and when it draws
// nothing. Appearance is not tested.

const paragraph = (key: string, text: string) => ({
  _key: key,
  _type: "block",
  children: [{ _key: `${key}-span`, _type: "span", marks: [], text }],
  markDefs: [],
  style: "normal",
});

const image = (alt = "") => ({
  _type: "image",
  alt,
  asset: {
    _id: "image-abc123-1200x800-jpg",
    url: "https://cdn.sanity.io/images/test-project/test/abc123-1200x800.jpg",
    metadata: { dimensions: { width: 1200, height: 800 } },
  },
});

const button = (key: string, text: string, href: string) => ({
  _key: key,
  text,
  href,
  colour: "accent",
  icon: null,
  openInNewTab: false,
});

function heroProps(overrides: Record<string, unknown> = {}) {
  return {
    _key: "hero",
    _type: "homeHero",
    theme: "light",
    image: image("Two young football players"),
    title: '"The Fundraiser That Sells Itself"',
    text: [paragraph("text", "Empowering groups to raise funds for worthy causes.")],
    youTubeUrl: "https://www.youtube.com/watch?v=3nQNiWdeH2Q",
    ...overrides,
  } as unknown as ComponentProps<typeof HomeHero>;
}

describe("Home hero section", () => {
  it("draws its title as the page's main heading, its text, and a button to the video", () => {
    render(<HomeHero {...heroProps()} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent('"The Fundraiser That Sells Itself"');
    expect(screen.getByText("Empowering groups to raise funds for worthy causes.")).toBeInTheDocument();
    const video = screen.getByRole("link", { name: /Watch the video/ });
    expect(video).toHaveAttribute("href", "https://www.youtube.com/watch?v=3nQNiWdeH2Q");
    expect(video).toHaveAttribute("target", "_blank");
    expect(screen.getByAltText("Two young football players")).toBeInTheDocument();
  });

  it("draws no video button without a YouTube video link", () => {
    render(<HomeHero {...heroProps({ youTubeUrl: "https://example.com/video" })} />);
    expect(screen.queryByRole("link", { name: /Watch the video/ })).toBeNull();
  });

  it("draws nothing without its photo or title", () => {
    for (const overrides of [{ image: null }, { title: " " }]) {
      const { container, unmount } = render(<HomeHero {...heroProps(overrides)} />);
      expect(container).toBeEmptyDOMElement();
      expect(hasHomeHeroContent(heroProps(overrides))).toBe(false);
      unmount();
    }
  });
});

function stepsProps(overrides: Record<string, unknown> = {}) {
  return {
    _key: "steps",
    _type: "steps",
    theme: "light",
    items: [
      { _key: "one", image: image("call icon"), title: "Contact Us", text: [paragraph("t1", "set up delivery date")] },
      { _key: "two", image: image("sell icon"), title: "Start Selling", text: null },
      { _key: "three", image: image("submit order icon"), title: "Submit Order", text: null },
    ],
    ...overrides,
  } as unknown as ComponentProps<typeof Steps>;
}

describe("Steps section", () => {
  it("lists the steps in order, each numbered", () => {
    render(<Steps {...stepsProps()} />);
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items.map((item) => within(item).getByRole("heading", { level: 3 }).textContent)).toEqual([
      "1Step 1: Contact Us",
      "2Step 2: Start Selling",
      "3Step 3: Submit Order",
    ]);
    expect(screen.getByText("set up delivery date")).toBeInTheDocument();
  });

  it("leaves out a step without its picture or title, and draws nothing with none", () => {
    const partial = stepsProps({
      items: [
        { _key: "one", image: null, title: "Contact Us" },
        { _key: "two", image: image(), title: "Start Selling" },
      ],
    });
    render(<Steps {...partial} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("Start Selling")).toBeInTheDocument();

    const none = stepsProps({ items: [{ _key: "one", image: image(), title: " " }] });
    expect(hasStepsContent(none)).toBe(false);
    const { container } = render(<Steps {...none} />);
    expect(container).toBeEmptyDOMElement();
  });
});

function teaserProps(overrides: Record<string, unknown> = {}) {
  return {
    _key: "teaser",
    _type: "menuTeaser",
    theme: "shaded",
    eyebrow: "Handmade Food Menu",
    title: "Fresh & Clean Obsessed",
    intro: [paragraph("intro", "From the Kitchens of DelGrosso.")],
    items: [
      {
        _key: "content-1",
        image: image(),
        heading: "14'' Famous Hoagies",
        text: [paragraph("h", "The largest, freshest hoagies.")],
        buttons: [button("b1", "See Hoagie Menu", "/products")],
      },
      {
        _key: "content-2",
        image: image("Marianna's 12'' Pepperoni Pizza"),
        heading: "12'' Delicious Pizzas",
        text: null,
        buttons: [button("b2", "See Pizza Menu", "/products#pizza")],
      },
    ],
    ...overrides,
  } as unknown as ComponentProps<typeof MenuTeaser>;
}

describe("Menu teaser section", () => {
  it("draws its heading, introduction and both parts with their buttons", () => {
    render(<MenuTeaser {...teaserProps()} />);
    expect(screen.getByRole("region", { name: /Fresh & Clean Obsessed/ })).toBeInTheDocument();
    expect(screen.getByText("From the Kitchens of DelGrosso.")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)).toEqual([
      "14'' Famous Hoagies",
      "12'' Delicious Pizzas",
    ]);
    expect(screen.getByRole("link", { name: "See Pizza Menu" })).toHaveAttribute("href", "/products#pizza");
  });

  it("draws nothing without its heading or with one part only", () => {
    const one = teaserProps();
    for (const overrides of [{ title: " " }, { items: (one.items ?? []).slice(0, 1) }]) {
      const { container, unmount } = render(<MenuTeaser {...teaserProps(overrides)} />);
      expect(container).toBeEmptyDOMElement();
      expect(hasMenuTeaserContent(teaserProps(overrides))).toBe(false);
      unmount();
    }
  });
});

function ctaProps(overrides: Record<string, unknown> = {}) {
  return {
    _key: "cta",
    _type: "callToActionWithImage",
    theme: "muslin",
    title: "Over 40 years of experience, one phone call away",
    richText: [paragraph("r", "We're here to help!")],
    buttons: [button("support", "Get Support", "tel:8146842666")],
    image: image(),
    ...overrides,
  } as unknown as ComponentProps<typeof CallToActionWithImage>;
}

describe("Call to action with image section", () => {
  it("draws its heading, text and button", () => {
    render(<CallToActionWithImage {...ctaProps()} />);
    expect(
      screen.getByRole("region", { name: "Over 40 years of experience, one phone call away" }),
    ).toBeInTheDocument();
    expect(screen.getByText("We're here to help!")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get Support" })).toHaveAttribute("href", "tel:8146842666");
  });

  it("draws nothing without its heading or photo", () => {
    for (const overrides of [{ title: "" }, { image: null }]) {
      const { container, unmount } = render(<CallToActionWithImage {...ctaProps(overrides)} />);
      expect(container).toBeEmptyDOMElement();
      expect(hasCallToActionWithImageContent(ctaProps(overrides))).toBe(false);
      unmount();
    }
  });
});

const testimonial = (id: string, name: string, quote: string, title: string | null = null) => ({
  _id: id,
  name,
  title,
  body: [paragraph(`${id}-body`, quote)],
});

function testimonialsProps(overrides: Record<string, unknown> = {}) {
  return {
    _key: "quotes",
    _type: "testimonials",
    theme: "muslin",
    eyebrow: "Quotes From Our",
    title: "Hoagie Heroes",
    image: image(),
    testimonials: [
      testimonial("suzie", "Suzie", "I can't thank the staff enough.", "Verona, PA"),
      null,
      testimonial("megan", "Megan", "You made it a breeze!", "Worthington, PA"),
    ],
    ...overrides,
  } as unknown as ComponentProps<typeof Testimonials>;
}

describe("Testimonials section", () => {
  it("shows one quote at a time and steps through them, leaving out unpublished ones", () => {
    render(<Testimonials {...testimonialsProps()} />);
    expect(screen.getByText("I can't thank the staff enough.")).toBeVisible();
    expect(screen.getByText("Verona, PA")).toBeVisible();
    expect(screen.getByText("You made it a breeze!")).not.toBeVisible();

    const previous = screen.getByRole("button", { name: "Previous testimonial" });
    const next = screen.getByRole("button", { name: "Next testimonial" });
    expect(previous).toBeDisabled();
    fireEvent.click(next);
    expect(screen.getByText("You made it a breeze!")).toBeVisible();
    expect(screen.getByText("I can't thank the staff enough.")).not.toBeVisible();
    // Two published quotes: the second is the last.
    expect(next).toBeDisabled();
    expect(previous).toBeEnabled();
  });

  it("draws no buttons for a single quote", () => {
    render(<Testimonials {...testimonialsProps({ testimonials: [testimonial("ronald", "Ronald", "Keep up the good work!")] })} />);
    expect(screen.getByText("Keep up the good work!")).toBeVisible();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("draws nothing without its heading, its photo or a published quote", () => {
    for (const overrides of [{ title: " " }, { image: null }, { testimonials: [null] }]) {
      const { container, unmount } = render(<Testimonials {...testimonialsProps(overrides)} />);
      expect(container).toBeEmptyDOMElement();
      expect(hasTestimonialsContent(testimonialsProps(overrides))).toBe(false);
      unmount();
    }
  });
});
