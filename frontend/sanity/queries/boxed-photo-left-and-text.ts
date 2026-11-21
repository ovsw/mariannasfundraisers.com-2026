import { groq } from "next-sanity";
import { imageAndTextFields } from "./shared/image-and-text";

// @sanity-typegen-ignore
export const boxedPhotoLeftAndTextQuery = groq`
  _type == "boxedPhotoLeftAndText" => {
    ${imageAndTextFields}
  }
`;
