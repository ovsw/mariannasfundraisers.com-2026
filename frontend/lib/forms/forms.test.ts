import { describe, expect, it } from "vitest";
import { type ContactValues, contactPayload, contactSchema } from "./contact";
import { addressLine, easternSentTime, EMPTY, joinList } from "./fields";
import { type FindASaleValues, findASalePayload, findASaleSchema } from "./find-a-sale";
import { type TastingValues, tastingPayload, tastingSchema } from "./tasting";

const meta = { page: "/contact-us", sentAt: new Date("2026-11-05T15:30:00.000Z") };

function errorFields(result: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) {
  return [...new Set((result.error?.issues ?? []).map((issue) => String(issue.path[0])))].sort();
}

const contactBase = {
  firstName: "Maria",
  lastName: "Rossi",
  email: "maria@example.com",
  phone: "",
  groupName: "St. Anne's Youth Group",
  newsletter: false,
  deliveryTimeline: "",
  orderForms: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zip: "",
  heardAbout: [],
  comments: "",
  discuss: "",
};

const newBooking = {
  ...contactBase,
  topic: "Book a Fundraiser",
  customerType: "New Customer",
  deliveryTimeline: "Any Saturday in March",
  orderForms: "40",
  addressLine1: "12 Main St",
  city: "Pittsburgh",
  state: "PA",
  zip: "15201",
  heardAbout: ["Friend", "Social Media"],
};

describe("shared field helpers", () => {
  it("writes the sent time in Eastern time, ready to show", () => {
    expect(easternSentTime(meta.sentAt)).toBe("Nov 5, 2026, 10:30 AM ET");
  });

  it("joins a checkbox list and an address into one line, or sends the empty mark", () => {
    expect(joinList(["Friend", "Mailer"])).toBe("Friend, Mailer");
    expect(joinList([])).toBe(EMPTY);
    expect(
      addressLine({ addressLine1: "12 Main St", addressLine2: "Apt 4", city: "Pittsburgh", state: "PA", zip: "15201" }),
    ).toBe("12 Main St, Apt 4, Pittsburgh, PA 15201");
    expect(addressLine({ city: "Erie", state: "PA" })).toBe("Erie, PA");
    expect(addressLine({ addressLine1: " ", city: "" })).toBe(EMPTY);
  });
});

describe("contact form rules", () => {
  it("always requires the topic, the name, a valid email and the group name", () => {
    const result = contactSchema.safeParse({ ...contactBase, firstName: " ", lastName: "", email: "maria", groupName: "" });
    expect(errorFields(result)).toEqual(["email", "firstName", "groupName", "lastName", "topic"]);
  });

  it("checks an optional phone number only when given", () => {
    expect(contactSchema.safeParse({ ...contactBase, topic: "General Info" }).success).toBe(true);
    const bad = contactSchema.safeParse({ ...contactBase, topic: "General Info", phone: "555-01" });
    expect(errorFields(bad)).toEqual(["phone"]);
  });

  it("requires the booking fields for Book a Fundraiser", () => {
    const result = contactSchema.safeParse({ ...contactBase, topic: "Book a Fundraiser" });
    expect(errorFields(result)).toEqual(["customerType", "deliveryTimeline", "orderForms"]);
  });

  it("requires the delivery address only for a new customer", () => {
    const missing = contactSchema.safeParse({ ...newBooking, addressLine1: "", city: "", state: "", zip: "" });
    expect(errorFields(missing)).toEqual(["addressLine1", "city", "state", "zip"]);
    const badZip = contactSchema.safeParse({ ...newBooking, zip: "152" });
    expect(errorFields(badZip)).toEqual(["zip"]);
    const returning = contactSchema.safeParse({
      ...newBooking,
      customerType: "Returning Customer",
      addressLine1: "",
      city: "",
      state: "",
      zip: "1",
    });
    expect(returning.success).toBe(true);
  });

  it("requires nothing more for General Info or Submit Testimonial, whatever the hidden fields hold", () => {
    for (const topic of ["General Info", "Submit Testimonial"]) {
      expect(contactSchema.safeParse({ ...contactBase, topic, zip: "x" }).success, topic).toBe(true);
    }
  });
});

describe("contact form payload", () => {
  const parse = (values: object) => contactSchema.parse(values) as ContactValues;

  it("sends a new booking with its delivery address, its sources and the empty mark", () => {
    expect(contactPayload(parse({ ...newBooking, phone: "610 555 0147", newsletter: true }), meta)).toEqual({
      topic: "Book a Fundraiser",
      name: "Maria Rossi",
      first_name: "Maria",
      email: "maria@example.com",
      phone: "(610) 555-0147",
      group_name: "St. Anne's Youth Group",
      customer_type: "New Customer",
      delivery_timeline: "Any Saturday in March",
      order_forms: "40",
      delivery_address: "12 Main St, Pittsburgh, PA 15201",
      heard_about: "Friend, Social Media",
      comments: EMPTY,
      newsletter: "Yes",
      page: "/contact-us",
      sent_at: "Nov 5, 2026, 10:30 AM ET",
      _email: {
        subject: "Contact form: Book a Fundraiser, St. Anne's Youth Group",
        from: "Marianna's Fundraisers website",
      },
    });
  });

  it("leaves out the delivery address and sources for a returning customer", () => {
    const payload = contactPayload(parse({ ...newBooking, customerType: "Returning Customer" }), meta);
    expect(payload).not.toHaveProperty("delivery_address");
    expect(payload).not.toHaveProperty("heard_about");
    expect(payload).toHaveProperty("comments", EMPTY);
  });

  it("drops the booking fields for the other topics and sends their own", () => {
    for (const topic of ["General Info", "Submit Testimonial"]) {
      const payload = contactPayload(
        parse({ ...newBooking, topic, discuss: "Hello", city: "Erie", state: "PA", heardAbout: [] }),
        meta,
      );
      for (const dropped of ["customer_type", "delivery_timeline", "order_forms", "delivery_address", "comments"]) {
        expect(payload, `${topic} ${dropped}`).not.toHaveProperty(dropped);
      }
      expect(payload).toMatchObject({
        topic,
        phone: EMPTY,
        address: "Erie, PA",
        heard_about: EMPTY,
        discuss: "Hello",
        newsletter: "No",
      });
      expect(payload._email.subject).toBe(`Contact form: ${topic}, St. Anne's Youth Group`);
    }
  });
});

describe("free tasting form", () => {
  const values = {
    firstName: "Maria",
    lastName: "Rossi",
    email: "maria@example.com",
    phone: "6105550147",
    groupName: "St. Anne's Youth Group",
    attendees: "12",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zip: "",
    newsletter: false,
  };

  it("requires the phone, the group name and a whole number of attendees, 1 or more", () => {
    const empty = tastingSchema.safeParse({ ...values, phone: "", groupName: "", attendees: "" });
    expect(errorFields(empty)).toEqual(["attendees", "groupName", "phone"]);
    for (const attendees of ["0", "2.5", "-3", "ten"]) {
      expect(errorFields(tastingSchema.safeParse({ ...values, attendees })), attendees).toEqual(["attendees"]);
    }
    expect(errorFields(tastingSchema.safeParse({ ...values, zip: "abc" }))).toEqual(["zip"]);
  });

  it("sends the address as one line, or the empty mark", () => {
    const parse = (input: object) => tastingSchema.parse(input) as TastingValues;
    expect(tastingPayload(parse(values), meta)).toMatchObject({
      phone: "(610) 555-0147",
      attendees: "12",
      address: EMPTY,
      newsletter: "No",
      _email: { subject: "Free tasting request: St. Anne's Youth Group" },
    });
    const withAddress = parse({ ...values, addressLine1: "12 Main St", addressLine2: "Apt 4", city: "Pittsburgh", state: "PA", zip: "15201", newsletter: true });
    expect(tastingPayload(withAddress, meta)).toMatchObject({
      address: "12 Main St, Apt 4, Pittsburgh, PA 15201",
      newsletter: "Yes",
    });
  });
});

describe("find a sale form", () => {
  const values = { firstName: "Joe", lastName: "Smith", email: "joe@example.com", phone: "", hometown: "Erie, PA" };

  it("requires the name, a valid email and the hometown; the phone is optional", () => {
    expect(findASaleSchema.safeParse(values).success).toBe(true);
    const bad = findASaleSchema.safeParse({ ...values, email: "joe@", hometown: " ", phone: "12" });
    expect(errorFields(bad)).toEqual(["email", "hometown", "phone"]);
  });

  it("sends the empty mark for a phone left empty, and names the person and hometown in the subject", () => {
    const payload = findASalePayload(findASaleSchema.parse(values) as FindASaleValues, meta);
    expect(payload).toEqual({
      name: "Joe Smith",
      first_name: "Joe",
      email: "joe@example.com",
      phone: EMPTY,
      hometown: "Erie, PA",
      page: "/contact-us",
      sent_at: "Nov 5, 2026, 10:30 AM ET",
      _email: { subject: "Find a sale: Joe Smith, Erie, PA", from: "Marianna's Fundraisers website" },
    });
  });
});
