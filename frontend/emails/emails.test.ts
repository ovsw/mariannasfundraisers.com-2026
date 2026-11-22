import Handlebars from "handlebars";
import { describe, expect, it } from "vitest";
import { contactPayload, contactSchema, CONTACT_THANKS } from "@/lib/forms/contact";
import { findASalePayload, findASaleSchema, FIND_A_SALE_THANKS } from "@/lib/forms/find-a-sale";
import { tastingPayload, tastingSchema, TASTING_THANKS } from "@/lib/forms/tasting";
import { contactFormEmails } from "./contact-form";
import { findASaleFormEmails } from "./find-a-sale-form";
import { formEmails } from "./index";
import { EMPTY, text } from "./layout";
import { tastingFormEmails } from "./tasting-form";

/**
 * A Handlebars with the Formspark helpers the templates use: `switch`, `case`
 * and `default` (Formspark has no `eq`), and `sanitizeUrl`.
 */
function formsparkHandlebars() {
  const hb = Handlebars.create();
  const switches: { value: unknown; matched: boolean }[] = [];
  hb.registerHelper("switch", function (this: unknown, value: unknown, options: Handlebars.HelperOptions) {
    switches.push({ value, matched: false });
    const out = options.fn(this);
    switches.pop();
    return out;
  });
  hb.registerHelper("case", function (this: unknown, value: unknown, options: Handlebars.HelperOptions) {
    const current = switches.at(-1)!;
    if (current.matched || current.value !== value) return "";
    current.matched = true;
    return options.fn(this);
  });
  hb.registerHelper("default", function (this: unknown, options: Handlebars.HelperOptions) {
    return switches.at(-1)!.matched ? "" : options.fn(this);
  });
  hb.registerHelper("sanitizeUrl", (url: string) => (/^https:\/\//.test(url) ? url : "about:blank"));
  return hb;
}

const hb = formsparkHandlebars();
const render = (code: string, data: Record<string, unknown>) =>
  hb.compile(code, { strict: false })({ data, viewLink: "https://dashboard.formspark.io/entry" });

/** The labels of the answer rows an email shows. */
function shownLabels(html: string) {
  return [...html.matchAll(/<div style="font-size:13px;line-height:1.4;[^"]*">([^<]*)<\/div>/g)].map(
    ([, label]) => label,
  );
}

describe("form emails", () => {
  it("lists the three forms with an office notification and a reply email each: six templates", () => {
    expect(formEmails.map((form) => form.form)).toEqual(["Contact form", "Free tasting form", "Find a sale form"]);
    expect(formEmails.flatMap((form) => [form.notification, form.reply.code])).toHaveLength(6);
  });

  it("compiles every template as Handlebars", () => {
    for (const form of formEmails) {
      for (const code of [form.notification, form.reply.code]) {
        expect(() => hb.precompile(code), form.form).not.toThrow();
      }
    }
  });

  it("styles inline only, with no images and no wider than 600px", () => {
    for (const form of formEmails) {
      for (const code of [form.notification, form.reply.code]) {
        expect(code).not.toMatch(/<style|<link|<img|class=/);
        expect(code).toContain("max-width:600px");
      }
    }
  });

  it("says in each reply email what happens next, in the form's own thank-you words, signed by Marianna's", () => {
    const thanks = new Map([
      [contactFormEmails, CONTACT_THANKS],
      [tastingFormEmails, TASTING_THANKS],
      [findASaleFormEmails, FIND_A_SALE_THANKS],
    ]);
    for (const [form, message] of thanks) {
      const html = render(form.reply.code, form.examples[0]);
      expect(html).toContain(`Hi ${form.examples[0].first_name},`);
      expect(html).toContain(text(message));
      expect(html).toContain(">Marianna's Fundraisers</p>");
    }
    expect(formEmails.map((form) => form.reply.subject)).toEqual([
      "We got your message",
      "We got your free tasting request",
      "We got your request",
    ]);
  });

  it("ends each office notification with the page, the sent time and the Formspark link", () => {
    for (const form of formEmails) {
      const html = render(form.notification, form.examples[0]);
      expect(html).toContain(`Page: ${form.examples[0].page}`);
      expect(html).toContain("Sent: Nov 5, 2026, 10:30 AM ET");
      expect(html).toContain('href="https://dashboard.formspark.io/entry"');
    }
  });

  it("shows each answer the entry holds, hides optional ones left empty, and always shows the newsletter row", () => {
    const expected: [typeof contactFormEmails, number, string[]][] = [
      [
        contactFormEmails,
        0,
        [
          "Topic",
          "Name",
          "Email",
          "Phone Number",
          "Group Name",
          "Are you a new or returning customer?",
          "Delivery Timeline",
          "Number of Order Forms Needed",
          "Delivery Address",
          "How did you hear about us?",
          "Newsletter",
        ],
      ],
      [contactFormEmails, 1, ["Topic", "Name", "Email", "Group Name", "Address", "What do you want to discuss", "Newsletter"]],
      [
        contactFormEmails,
        2,
        ["Topic", "Name", "Email", "Phone Number", "Group Name", "How did you hear about us?", "What do you want to discuss", "Newsletter"],
      ],
      [tastingFormEmails, 0, ["Name", "Email", "Phone", "Group Name", "No. of attendees", "Address (we'll come to you)", "Newsletter"]],
      [findASaleFormEmails, 0, ["Name", "Email", "Hometown"]],
    ];
    for (const [form, index, labels] of expected) {
      const example = form.examples[index];
      for (const code of [form.notification, form.reply.code]) {
        expect(shownLabels(render(code, example)), `${form.form} example ${index}`).toEqual(labels);
      }
    }
    // A newsletter "No" is still shown.
    expect(render(contactFormEmails.notification, contactFormEmails.examples[1])).toContain(">No</div>");
  });

  it("has one contact example per topic", () => {
    expect(contactFormEmails.examples.map((example) => example.topic)).toEqual([
      "Book a Fundraiser",
      "General Info",
      "Submit Testimonial",
    ]);
  });

  it("uses examples shaped like the Website's own payloads", () => {
    const meta = { page: "/contact-us", sentAt: new Date("2026-11-05T15:30:00.000Z") };
    const keys = (value: object) => Object.keys(value).sort();
    const contactBase = {
      firstName: "Maria",
      lastName: "Rossi",
      email: "maria@example.com",
      phone: "",
      groupName: "Group",
      newsletter: false,
      deliveryTimeline: "March",
      orderForms: "4",
      addressLine1: "12 Main St",
      addressLine2: "",
      city: "Erie",
      state: "PA",
      zip: "15201",
      heardAbout: [],
      comments: "",
      discuss: "",
    };
    const contact = [
      { ...contactBase, topic: "Book a Fundraiser", customerType: "New Customer" },
      { ...contactBase, topic: "General Info" },
      { ...contactBase, topic: "Submit Testimonial" },
    ];
    contact.forEach((values, index) => {
      expect(keys(contactFormEmails.examples[index])).toEqual(keys(contactPayload(contactSchema.parse(values), meta)));
    });
    const tasting = tastingSchema.parse({ ...contactBase, phone: "6105550147", attendees: "3" });
    expect(keys(tastingFormEmails.examples[0])).toEqual(keys(tastingPayload(tasting, meta)));
    const findASale = findASaleSchema.parse({ ...contactBase, hometown: "Erie" });
    expect(keys(findASaleFormEmails.examples[0])).toEqual(keys(findASalePayload(findASale, meta)));
    expect(EMPTY).toBe("—");
  });
});
