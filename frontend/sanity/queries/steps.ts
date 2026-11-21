import { groq } from "next-sanity";
import { imageQuery } from "./shared/image";
import { richTextContentQuery } from "./shared/rich-text-content";

// @sanity-typegen-ignore
export const stepsQuery = groq`
  _type == "steps" => {
    theme,
    items[]{
      _key,
      image{
        ${imageQuery}
      },
      title,
      text[]{
        ${richTextContentQuery}
      }
    }
  }
`;
