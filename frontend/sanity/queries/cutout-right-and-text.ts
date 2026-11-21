import { groq } from "next-sanity";
import { imageAndTextFields } from "./shared/image-and-text";

// @sanity-typegen-ignore
export const cutoutRightAndTextQuery = groq`
  _type == "cutoutRightAndText" => {
    ${imageAndTextFields}
  }
`;
