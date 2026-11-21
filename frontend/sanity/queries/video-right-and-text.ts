import { groq } from "next-sanity";
import { imageAndTextFields } from "./shared/image-and-text";

// @sanity-typegen-ignore
export const videoRightAndTextQuery = groq`
  _type == "videoRightAndText" => {
    ${imageAndTextFields},
    youTubeUrl
  }
`;
