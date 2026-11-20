import { buttonProjection } from "./button";
import { imageQuery } from "./image";
import { richTextContentQuery } from "./rich-text-content";
import { simpleRichTextQuery } from "./simple-rich-text";

// The fields every image-and-text section shares (issue #15). Each section's
// projection spreads them and adds its own.
export const imageAndTextFields = `
    theme,
    eyebrow,
    title,
    anchorId,
    richText[]{
      ${richTextContentQuery}
    },
    buttons[]{
      ${buttonProjection}
    },
    image{
      ${imageQuery}
    }
`;

export const iconListItemsProjection = `
    items[]{
      _key,
      icon,
      heading,
      text[]{
        ${simpleRichTextQuery}
      }
    }
`;
