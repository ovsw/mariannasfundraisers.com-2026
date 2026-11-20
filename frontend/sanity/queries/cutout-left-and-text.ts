import { groq } from "next-sanity";
import { imageAndTextFields } from "./shared/image-and-text";

// @sanity-typegen-ignore
export const cutoutLeftAndTextQuery = groq`
  _type == "cutoutLeftAndText" => {
    ${imageAndTextFields}
  }
`;
