import { groq } from "next-sanity";
import { imageQuery } from "./shared/image";
import { simpleRichTextQuery } from "./shared/simple-rich-text";

// A reference to a testimonial that is not published resolves to null; the
// renderer leaves it out.
// @sanity-typegen-ignore
export const testimonialsQuery = groq`
  _type == "testimonials" => {
    theme,
    eyebrow,
    title,
    image{
      ${imageQuery}
    },
    "testimonials": testimonials[]->{
      _id,
      name,
      title,
      body[]{
        ${simpleRichTextQuery}
      }
    }
  }
`;
