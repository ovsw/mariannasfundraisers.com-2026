import { groq } from "next-sanity";
import { buttonProjection } from "./shared/button";
import { imageQuery } from "./shared/image";
import { richTextContentQuery } from "./shared/rich-text-content";
import { simpleRichTextQuery } from "./shared/simple-rich-text";

// @sanity-typegen-ignore
export const menuTeaserQuery = groq`
  _type == "menuTeaser" => {
    theme,
    eyebrow,
    title,
    intro[]{
      ${simpleRichTextQuery}
    },
    items[]{
      _key,
      image{
        ${imageQuery}
      },
      heading,
      text[]{
        ${richTextContentQuery}
      },
      buttons[]{
        ${buttonProjection}
      }
    }
  }
`;
