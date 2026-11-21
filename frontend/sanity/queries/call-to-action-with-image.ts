import { groq } from "next-sanity";
import { buttonProjection } from "./shared/button";
import { imageQuery } from "./shared/image";
import { richTextContentQuery } from "./shared/rich-text-content";

// @sanity-typegen-ignore
export const callToActionWithImageQuery = groq`
  _type == "callToActionWithImage" => {
    theme,
    title,
    richText[]{
      ${richTextContentQuery}
    },
    buttons[]{
      ${buttonProjection}
    },
    image{
      ${imageQuery}
    }
  }
`;
