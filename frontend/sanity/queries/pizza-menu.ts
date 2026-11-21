import { groq } from "next-sanity";
import { productMenuFields } from "./shared/product-card";

// @sanity-typegen-ignore
export const pizzaMenuQuery = groq`
  _type == "pizzaMenu" => {
    ${productMenuFields}
  }
`;
