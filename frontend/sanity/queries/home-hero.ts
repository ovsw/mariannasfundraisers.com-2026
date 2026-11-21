import { groq } from "next-sanity";
import { buttonProjection } from "./shared/button";
import { imageQuery } from "./shared/image";
import { simpleRichTextQuery } from "./shared/simple-rich-text";

// @sanity-typegen-ignore
export const homeHeroQuery = groq`
  _type == "homeHero" => {
    theme,
    image{
      ${imageQuery}
    },
    title,
    heading,
    text[]{
      ${simpleRichTextQuery}
    },
    buttons[]{
      ${buttonProjection}
    },
    youTubeUrl
  }
`;
