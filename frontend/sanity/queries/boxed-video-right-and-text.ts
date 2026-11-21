import { groq } from "next-sanity";
import { imageAndTextFields } from "./shared/image-and-text";

// @sanity-typegen-ignore
export const boxedVideoRightAndTextQuery = groq`
  _type == "boxedVideoRightAndText" => {
    ${imageAndTextFields},
    youTubeUrl
  }
`;
