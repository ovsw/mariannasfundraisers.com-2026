import { groq } from "next-sanity";
import { imageAndTextFields } from "./shared/image-and-text";

// @sanity-typegen-ignore
export const photoLeftAndTextQuery = groq`
  _type == "photoLeftAndText" => {
    ${imageAndTextFields}
  }
`;
