import { groq } from "next-sanity";
import { imageAndTextFields } from "./shared/image-and-text";

// @sanity-typegen-ignore
export const badgeAndTextQuery = groq`
  _type == "badgeAndText" => {
    ${imageAndTextFields}
  }
`;
