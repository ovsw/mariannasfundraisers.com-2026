import { z } from "zod";
import {
  addressFields,
  addressLine,
  EMAIL_FROM,
  emailField,
  type FormDefinition,
  fullName,
  formatUsPhone,
  heardAboutField,
  joinList,
  longText,
  metaFields,
  nameFields,
  optionalPhone,
  orEmpty,
  requiredText,
  ZIP,
} from "./fields";

/**
 * The contact form (old Cognito form 114, on contact-us and get-assistance).
 * Which fields it shows, and which it requires, follow the chosen topic:
 * that is the form's behaviour, not an editor setting.
 */

export const CONTACT_TOPICS = ["Book a Fundraiser", "General Info", "Submit Testimonial"] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export const CUSTOMER_TYPES = ["New Customer", "Returning Customer"] as const;

export const CONTACT_THANKS =
  "Thank you for contacting us! Someone from Marianna's Fundraisers will respond to you shortly.";

export const GROUP_NAME_HELP =
  "Please note: We do not allow individual fundraisers. All sales must be run through a group or an organization. (Example: Churches, Fire Departments, Service Clubs, etc.)";

/** The groups of fields beyond the ones always shown. */
export type ContactSection = "booking" | "deliveryAddress" | "general";

/** Which groups of fields the form shows for a topic and customer type. */
export function contactSections(topic: string | undefined, customerType: string | undefined) {
  const sections = new Set<ContactSection>();
  if (topic === "Book a Fundraiser") {
    sections.add("booking");
    if (customerType === "New Customer") sections.add("deliveryAddress");
  } else if (topic === "General Info" || topic === "Submit Testimonial") {
    sections.add("general");
  }
  return sections;
}

export const contactSchema = z
  .object({
    topic: z.enum(CONTACT_TOPICS, { message: "Choose a topic." }),
    ...nameFields,
    email: emailField,
    phone: optionalPhone,
    groupName: requiredText("Enter your group name."),
    newsletter: z.boolean(),
    // Book a Fundraiser
    customerType: z.enum(CUSTOMER_TYPES).optional(),
    deliveryTimeline: longText(),
    orderForms: longText(100),
    ...addressFields,
    heardAbout: heardAboutField,
    comments: longText(),
    // General Info and Submit Testimonial
    discuss: longText(),
  })
  .superRefine((values, context) => {
    const sections = contactSections(values.topic, values.customerType);
    const require = (path: keyof typeof values, message: string) => {
      const value = values[path];
      if (typeof value === "string" ? !value.trim() : !value) {
        context.addIssue({ code: "custom", path: [path], message });
      }
    };
    if (sections.has("booking")) {
      require("customerType", "Choose new or returning customer.");
      require("deliveryTimeline", "Tell us which months, days and times work best.");
      require("orderForms", "Enter how many order forms you need.");
    }
    if (sections.has("deliveryAddress")) {
      require("addressLine1", "Enter the street address.");
      require("city", "Enter the city.");
      require("state", "Enter the state.");
      require("zip", "Enter the zip code.");
      if (values.zip && !ZIP.test(values.zip)) {
        context.addIssue({ code: "custom", path: ["zip"], message: "Enter a 5-digit zip code." });
      }
    }
  });

export type ContactValues = z.infer<typeof contactSchema>;

/** The answers as Formspark stores them; fields not shown for the topic are left out. */
export function contactPayload(values: ContactValues, meta: Parameters<typeof metaFields>[0]) {
  const sections = contactSections(values.topic, values.customerType);
  return {
    topic: values.topic,
    name: fullName(values),
    first_name: values.firstName.trim(),
    email: values.email,
    phone: values.phone ? formatUsPhone(values.phone) : orEmpty(values.phone),
    group_name: values.groupName,
    ...(sections.has("booking")
      ? {
          customer_type: values.customerType,
          delivery_timeline: values.deliveryTimeline,
          order_forms: values.orderForms,
        }
      : {}),
    ...(sections.has("deliveryAddress")
      ? { delivery_address: addressLine(values), heard_about: joinList(values.heardAbout) }
      : {}),
    ...(sections.has("booking") ? { comments: orEmpty(values.comments) } : {}),
    ...(sections.has("general")
      ? {
          address: addressLine({ city: values.city, state: values.state }),
          heard_about: joinList(values.heardAbout),
          discuss: orEmpty(values.discuss),
        }
      : {}),
    newsletter: values.newsletter ? "Yes" : "No",
    ...metaFields(meta),
    _email: {
      subject: `Contact form: ${values.topic}, ${values.groupName}`,
      from: EMAIL_FROM,
    },
  };
}

export const contactForm: FormDefinition<ContactValues> = {
  name: "Contact form",
  schema: contactSchema,
  payload: contactPayload,
};
