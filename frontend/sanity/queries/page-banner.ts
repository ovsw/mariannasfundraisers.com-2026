import { groq } from "next-sanity";
import { imageQuery } from "./shared/image";
import { simpleRichTextQuery } from "./shared/simple-rich-text";

// @sanity-typegen-ignore
export const pageBannerQuery = groq`
  _type == "pageBanner" => {
    theme,
    title,
    text[]{
      ${simpleRichTextQuery}
    },
    image{
      ${imageQuery}
    }
  }
`;
