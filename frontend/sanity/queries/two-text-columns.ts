import { groq } from "next-sanity";
import { richTextContentQuery } from "./shared/rich-text-content";

// @sanity-typegen-ignore
export const twoTextColumnsQuery = groq`
  _type == "twoTextColumns" => {
    theme,
    leftText[]{
      ${richTextContentQuery}
    },
    rightText[]{
      ${richTextContentQuery}
    }
  }
`;
