import { groq } from "next-sanity";
import { buttonProjection } from "./shared/button";
import { richTextContentQuery } from "./shared/rich-text-content";

// @sanity-typegen-ignore
export const richTextBlockQuery = groq`
  _type == "richTextBlock" => {
    theme,
    eyebrow,
    title,
    anchorId,
    richText[]{
      ${richTextContentQuery}
    },
    buttons[]{
      ${buttonProjection}
    }
  }
`;
