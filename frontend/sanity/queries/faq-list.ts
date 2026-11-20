import { groq } from "next-sanity";
import { richTextContentQuery } from "./shared/rich-text-content";

// A reference to an FAQ that is not published resolves to null; the renderer
// leaves it out.
// @sanity-typegen-ignore
export const faqListQuery = groq`
  _type == "faqList" => {
    theme,
    title,
    "faqs": faqs[]->{
      _id,
      title,
      body[]{
        ${richTextContentQuery}
      }
    }
  }
`;
