import { Columns3, Link, PanelBottom } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { requiredText } from "../validation/required-text";
import { defineDestinationType } from "../blocks/shared/destination";

const destination = defineDestinationType("footerDestination");

const footerLink = defineType({
  name: "footerLink",
  title: "Footer link",
  type: "object",
  icon: Link,
  fields: [
    defineField({
      name: "label",
      type: "string",
      validation: (rule) => requiredText(rule),
    }),
    defineField({ name: "destination", type: "footerDestination" }),
  ],
  preview: { select: { title: "label" } },
});

const footerColumn = defineType({
  name: "footerColumn",
  title: "Footer column",
  type: "object",
  icon: Columns3,
  fields: [
    defineField({
      name: "heading",
      type: "string",
      validation: (rule) => requiredText(rule),
    }),
    defineField({
      name: "links",
      type: "array",
      of: [defineArrayMember({ type: "footerLink" })],
      validation: (rule) => rule.required().min(1).unique(),
    }),
  ],
  preview: {
    select: { title: "heading", links: "links" },
    prepare: ({ title, links }) => ({
      title,
      subtitle: `${links?.length ?? 0} link${links?.length === 1 ? "" : "s"}`,
    }),
  },
});

const footer = defineType({
  name: "footer",
  title: "Site Footer",
  type: "document",
  icon: PanelBottom,
  fields: [
    defineField({
      name: "intro",
      title: "Introduction",
      type: "text",
      rows: 3,
      description: "A short closing statement shown beside the site identity.",
    }),
    defineField({
      name: "affiliation",
      title: "Parent company",
      type: "object",
      description:
        "Optional. A sentence about the parent company, with a link on its name.",
      fields: [
        defineField({
          name: "text",
          title: "Sentence",
          type: "string",
          description:
            "The whole sentence, e.g. “Marianna's Fundraisers is a part of the DelGrosso Family of Companies.”",
          validation: (rule) => requiredText(rule),
        }),
        defineField({
          name: "link",
          type: "footerLink",
          description:
            "The link label must appear in the sentence word for word; that part of the sentence becomes the link.",
          validation: (rule) =>
            rule.custom((value, context) => {
              const label = (value as { label?: string } | undefined)?.label?.trim();
              const text = (context.parent as { text?: string } | undefined)?.text;
              // The footer shows the sentence only with its link.
              if (!text?.trim()) return true;
              if (!label) return "Add a link whose label appears in the sentence";
              return text?.includes(label)
                ? true
                : "Use a label that appears in the sentence";
            }),
        }),
      ],
    }),
    defineField({
      name: "action",
      title: "Button",
      type: "footerLink",
      description: "Optional. One prominent link shown under the contact details.",
    }),
    defineField({
      name: "columns",
      title: "Navigation columns",
      type: "array",
      of: [defineArrayMember({ type: "footerColumn" })],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: "legalLinks",
      title: "Legal links",
      type: "array",
      of: [defineArrayMember({ type: "footerLink" })],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "copyrightStartYear",
      title: "Copyright start year",
      type: "number",
      validation: (rule) => rule.required().integer().min(1900),
    }),
    defineField({
      name: "copyrightOwner",
      title: "Copyright owner",
      type: "string",
      validation: (rule) => requiredText(rule),
    }),
  ],
  preview: { prepare: () => ({ title: "Site Footer" }) },
});

export const footerSchemaTypes = [destination, footerLink, footerColumn];

export default footer;
