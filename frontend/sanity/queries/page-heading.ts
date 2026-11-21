import { groq } from "next-sanity";
import { simpleRichTextQuery } from "./shared/simple-rich-text";

// @sanity-typegen-ignore
export const pageHeadingQuery = groq`
  _type == "pageHeading" => {
    theme,
    title,
    intro[]{
      ${simpleRichTextQuery}
    }
  }
`;
