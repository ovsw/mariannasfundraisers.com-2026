import { groq } from "next-sanity";
import { richTextContentQuery } from "./shared/rich-text-content";

// @sanity-typegen-ignore
export const findASaleFormQuery = groq`
  _type == "findASaleForm" => {
    theme,
    intro[]{
      ${richTextContentQuery}
    }
  }
`;
