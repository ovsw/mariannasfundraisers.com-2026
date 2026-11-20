import { groq } from "next-sanity";
import { productMenuFields } from "./shared/product-card";

// @sanity-typegen-ignore
export const hoagieMenuQuery = groq`
  _type == "hoagieMenu" => {
    ${productMenuFields}
  }
`;
