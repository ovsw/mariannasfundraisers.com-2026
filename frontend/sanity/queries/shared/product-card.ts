import { imageQuery } from "./image";

// A product's menu card, as the Hoagie, Pizza and Salsa menus draw it, with
// the kind and slug that make the address of the product's page.
// @sanity-typegen-ignore
export const productCardProjection = `
  _id,
  kind,
  "slug": slug.current,
  "shortName": menuCard.shortName,
  "shortDescription": menuCard.shortDescription,
  "dressing": menuCard.dressing,
  "image": menuCard.image{
    ${imageQuery}
  }
`;

// The fields each menu section projects: its theme and its products, in
// order. A reference to a missing or unpublished product drops out.
export const productMenuFields = `
    theme,
    "products": products[]->{
      ${productCardProjection}
    }
`;
