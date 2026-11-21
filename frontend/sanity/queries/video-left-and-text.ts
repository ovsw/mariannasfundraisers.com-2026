import { groq } from "next-sanity";
import { imageAndTextFields } from "./shared/image-and-text";

// @sanity-typegen-ignore
export const videoLeftAndTextQuery = groq`
  _type == "videoLeftAndText" => {
    ${imageAndTextFields},
    youTubeUrl
  }
`;
