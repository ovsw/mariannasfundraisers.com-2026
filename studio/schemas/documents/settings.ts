import { Contact, Globe2, ImageIcon, Settings } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { requiredText } from "../validation/required-text";

/** A Google Analytics 4 measurement ID (the Website checks the same shape). */
const GA_MEASUREMENT_ID = /^G-[A-Z0-9]{4,}$/;

const socialLink = defineType({
  name: "socialLink",
  title: "Social link",
  type: "object",
  icon: Globe2,
  fields: [
    defineField({
      name: "label",
      type: "string",
      description: "The network or community name shown to visitors.",
      validation: (rule) => requiredText(rule),
    }),
    defineField({
      name: "url",
      type: "url",
      validation: (rule) =>
        rule.required().uri({ scheme: ["http", "https"] }),
    }),
  ],
  preview: { select: { title: "label", subtitle: "url" } },
});

const contactDetails = defineType({
  name: "contactDetails",
  title: "Contact details",
  type: "object",
  icon: Contact,
  fields: [
    defineField({ name: "email", type: "email" }),
    defineField({
      name: "phone",
      type: "string",
      description: "Include the country or area code visitors should dial.",
    }),
    defineField({
      name: "addressLines",
      title: "Address",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.max(4),
    }),
  ],
});

const settings = defineType({
  name: "settings",
  title: "Global Settings",
  type: "document",
  icon: Settings,
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "contact", title: "Contact" },
    { name: "analytics", title: "Analytics" },
  ],
  fields: [
    defineField({
      name: "siteName",
      title: "Site name",
      type: "string",
      group: "identity",
      validation: (rule) => requiredText(rule),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "object",
      icon: ImageIcon,
      group: "identity",
      description:
        "Optional. When no logo is supplied, the header uses the site name as text.",
      fields: [
        defineField({
          name: "light",
          title: "For light backgrounds",
          type: "image",
          options: { hotspot: true },
        }),
        defineField({
          name: "dark",
          title: "For dark backgrounds",
          type: "image",
          options: { hotspot: true },
        }),
      ],
    }),
    defineField({
      name: "contact",
      type: "contactDetails",
      group: "contact",
    }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      group: "contact",
      of: [defineArrayMember({ type: "socialLink" })],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "googleAnalyticsMeasurementId",
      title: "Google Analytics measurement ID",
      type: "string",
      group: "analytics",
      description:
        "Optional. The ID of the Google Analytics web stream, e.g. G-ABC123XYZ9. Analytics runs only for visitors whose privacy choice allows it; leave empty to switch it off.",
      validation: (rule) =>
        rule.custom((value) =>
          !value || GA_MEASUREMENT_ID.test(value)
            ? true
            : "Use the measurement ID of a web stream: G- followed by letters and digits",
        ),
    }),
  ],
  preview: {
    select: { media: "logo.light", title: "siteName" },
    prepare: ({ media, title }) => ({
      title: title || "Global Settings",
      subtitle: "Site identity and contact details",
      media,
    }),
  },
});

export const settingsSchemaTypes = [socialLink, contactDetails];

export default settings;
