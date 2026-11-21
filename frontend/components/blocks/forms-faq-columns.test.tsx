import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import CognitoForm, { hasCognitoFormContent } from "./cognito-form";
import FaqList, { hasFaqListContent } from "./faq-list";
import TwoTextColumns, { hasTwoTextColumnsContent } from "./two-text-columns";

const paragraph = (key: string, text: string) => ({
  _key: key,
  _type: "block",
  children: [{ _key: `${key}-span`, _type: "span", marks: [], text }],
  markDefs: [],
  style: "normal",
});

function cognitoProps(overrides: Record<string, unknown> = {}) {
  return {
    _key: "form",
    _type: "cognitoForm",
    formId: "168",
    intro: [paragraph("intro", "If you are interested, complete the form.")],
    theme: "light",
    title: "Schedule a free tasting form",
    ...overrides,
  } as unknown as ComponentProps<typeof CognitoForm>;
}

describe("Cognito form section", () => {
  it("draws the form from its ID with the site's fixed account key, named by its title", () => {
    render(<CognitoForm {...cognitoProps()} />);

    const form = screen.getByTitle("Schedule a free tasting form");
    expect(form.tagName).toBe("IFRAME");
    expect(form).toHaveAttribute(
      "src",
      "https://www.cognitoforms.com/f/xPoircp7HEGoNo_tpFEirg/168",
    );
    expect(
      screen.getByRole("region", { name: "Schedule a free tasting form" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("If you are interested, complete the form."),
    ).toBeInTheDocument();
  });

  it("draws nothing for embed code or a missing title", () => {
    const embedCode =
      '<script src="https://www.cognitoforms.com/f/seamless.js" data-form="1"></script>';
    for (const overrides of [{ formId: embedCode }, { formId: "" }, { title: " " }]) {
      const { container, unmount } = render(
        <CognitoForm {...cognitoProps(overrides)} />,
      );
      expect(container).toBeEmptyDOMElement();
      expect(hasCognitoFormContent(cognitoProps(overrides))).toBe(false);
      unmount();
    }
  });
});

function faqProps(overrides: Record<string, unknown> = {}) {
  return {
    _key: "selling",
    _type: "faqList",
    faqs: [
      { _id: "faq-1", title: "Do you have a minimum order?", body: [paragraph("a1", "Yes, at least 100 items.")] },
      null,
      { _id: "faq-2", title: "Can I cancel my order, if needed?", body: [paragraph("a2", "Yes, with notice.")] },
    ],
    theme: "light",
    title: "Selling",
    ...overrides,
  } as unknown as ComponentProps<typeof FaqList>;
}

describe("FAQ list section", () => {
  it("lists each published FAQ under its title, in order, as a question that opens", () => {
    render(<FaqList {...faqProps()} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Selling" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual([
      "Do you have a minimum order?",
      "Can I cancel my order, if needed?",
    ]);
    expect(screen.getAllByRole("button")[0]).toHaveAttribute("aria-expanded", "false");
  });

  it("draws nothing without a title or without a published FAQ", () => {
    for (const overrides of [{ title: "  " }, { faqs: [null] }, { faqs: [] }]) {
      const { container, unmount } = render(<FaqList {...faqProps(overrides)} />);
      expect(container).toBeEmptyDOMElement();
      expect(hasFaqListContent(faqProps(overrides))).toBe(false);
      unmount();
    }
  });
});

function columnsProps(overrides: Record<string, unknown> = {}) {
  return {
    _key: "columns",
    _type: "twoTextColumns",
    leftText: [paragraph("left", "Our hoagies are made on freshly baked rolls.")],
    rightText: [paragraph("right", "Plus, our hoagies come with dressing.")],
    theme: "shaded",
    ...overrides,
  } as unknown as ComponentProps<typeof TwoTextColumns>;
}

describe("Two text columns section", () => {
  it("draws both texts, the left one first", () => {
    const { container } = render(<TwoTextColumns {...columnsProps()} />);

    expect(container.textContent?.indexOf("Our hoagies")).toBeLessThan(
      container.textContent?.indexOf("Plus, our hoagies") ?? 0,
    );
  });

  it("draws nothing when either text is missing, so it is never one column", () => {
    for (const overrides of [{ leftText: [] }, { rightText: null }]) {
      const { container, unmount } = render(
        <TwoTextColumns {...columnsProps(overrides)} />,
      );
      expect(container).toBeEmptyDOMElement();
      expect(hasTwoTextColumnsContent(columnsProps(overrides))).toBe(false);
      unmount();
    }
  });
});
