import { groq } from "next-sanity";
import { richTextContentQuery } from "./shared/rich-text-content";

// @sanity-typegen-ignore
export const contactFormQuery = groq`
  _type == "contactForm" => {
    theme,
    intro[]{
      ${richTextContentQuery}
    }
  }
`;
