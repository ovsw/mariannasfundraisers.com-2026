import { groq } from "next-sanity";
import { imageQuery } from "./shared/image";

// @sanity-typegen-ignore
export const pageBannerQuery = groq`
  _type == "pageBanner" => {
    theme,
    title,
    image{
      ${imageQuery}
    }
  }
`;
