import { groq } from "next-sanity";
import { productMenuFields } from "./shared/product-card";

// @sanity-typegen-ignore
export const salsaMenuQuery = groq`
  _type == "salsaMenu" => {
    ${productMenuFields}
  }
`;
