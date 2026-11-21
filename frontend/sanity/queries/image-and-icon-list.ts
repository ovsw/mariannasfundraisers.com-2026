import { groq } from "next-sanity";
import { imageAndTextFields, iconListItemsProjection } from "./shared/image-and-text";

// @sanity-typegen-ignore
export const imageAndIconListQuery = groq`
  _type == "imageAndIconList" => {
    ${imageAndTextFields},
    ${iconListItemsProjection}
  }
`;
