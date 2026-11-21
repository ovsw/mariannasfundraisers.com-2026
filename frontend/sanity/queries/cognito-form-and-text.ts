import { groq } from "next-sanity";
import { richTextContentQuery } from "./shared/rich-text-content";

// @sanity-typegen-ignore
export const cognitoFormAndTextQuery = groq`
  _type == "cognitoFormAndText" => {
    theme,
    formId,
    title,
    richText[]{
      ${richTextContentQuery}
    }
  }
`;
