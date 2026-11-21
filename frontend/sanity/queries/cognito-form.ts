import { groq } from "next-sanity";
import { richTextContentQuery } from "./shared/rich-text-content";

// @sanity-typegen-ignore
export const cognitoFormQuery = groq`
  _type == "cognitoForm" => {
    theme,
    formId,
    title,
    intro[]{
      ${richTextContentQuery}
    }
  }
`;
