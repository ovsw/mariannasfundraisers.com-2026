import { groq } from "next-sanity";
import { richTextContentQuery } from "./shared/rich-text-content";

// @sanity-typegen-ignore
export const tastingFormQuery = groq`
  _type == "tastingForm" => {
    theme,
    richText[]{
      ${richTextContentQuery}
    }
  }
`;
