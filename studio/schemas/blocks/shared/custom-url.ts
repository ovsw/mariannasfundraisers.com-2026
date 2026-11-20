import { defineField, defineType } from "sanity";
import { InlineObjectField } from "../../inputs/inline-object-field";

const safeProtocols = new Set(["http:", "https:", "mailto:", "tel:"]);

function validateExternalUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return "Add the external URL";
  }

  const href = value.trim();
  if (
    href.startsWith("#") ||
    (href.startsWith("/") && !href.startsWith("//") && href[1] !== "\\")
  ) {
    return true;
  }

  try {
    const url = new URL(href);
    if (
      ["http:", "https:"].includes(url.protocol) &&
      !/^https?:\/\//i.test(href)
    ) {
      return "Enter a valid URL";
    }
    return safeProtocols.has(url.protocol)
      ? true
      : "Use an http, https, mailto, or tel URL";
  } catch {
    return "Enter a valid URL";
  }
}

export default defineType({
  name: "customUrl",
  title: "URL",
  type: "object",
  components: { field: InlineObjectField },
  fields: [
    defineField({
      name: "external",
      title: "External URL",
      type: "string",
      description: "A web address, mailto: for email, tel: for a phone number, or a path on this site.",
      hidden: ({ parent }) => parent?.type !== "external",
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { type?: string } | undefined;
          return parent?.type === "external"
            ? validateExternalUrl(value)
            : true;
        }),
    }),
    defineField({
      name: "internal",
      title: "Internal Page",
      type: "reference",
      to: [
        { type: "homePage" },
        { type: "page" },
        { type: "post" },
        { type: "product" },
        { type: "blogIndex" },
      ],
      hidden: ({ parent }) => parent?.type !== "internal",
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { type?: string } | undefined;
          return parent?.type === "internal" && !value
            ? "Select the internal page"
            : true;
        }),
    }),
    defineField({
      name: "anchor",
      title: "Anchor",
      type: "string",
      description:
        "Optional. Jumps to a part of the page: the Anchor ID of a section there, or a heading's text in lowercase words with hyphens.",
      hidden: ({ parent }) => parent?.type !== "internal",
      validation: (rule) =>
        rule.custom((value) =>
          value === undefined || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value as string)
            ? true
            : "Use lowercase letters, numbers and single hyphens, without #",
        ),
    }),
    defineField({
      name: "file",
      title: "File",
      type: "file",
      description: "A document to download, such as a PDF.",
      hidden: ({ parent }) => parent?.type !== "file",
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { type?: string } | undefined;
          const asset = (value as { asset?: { _ref?: string } } | undefined)
            ?.asset;
          return parent?.type === "file" && !asset?._ref
            ? "Choose the file"
            : true;
        }),
    }),
    defineField({
      name: "type",
      type: "string",
      initialValue: "internal",
      options: {
        layout: "radio",
        direction: "horizontal",
        list: [
          { title: "Internal", value: "internal" },
          { title: "External", value: "external" },
          { title: "File", value: "file" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "openInNewTab",
      title: "Open in new tab",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "href",
      type: "string",
      hidden: true,
      readOnly: true,
    }),
  ],
});
