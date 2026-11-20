import { groq } from "next-sanity";
import { PRODUCT_PATH_GROQ } from "../../../shared/content-routes";
import { buttonProjection } from "./shared/button";
import { imageQuery } from "./shared/image";
import { metaQuery } from "./shared/meta";
import { richTextContentQuery } from "./shared/rich-text-content";

// A product page (spec decision 8): the product's own fields and, from
// `productPageSettings`, the two shared blocks and the buttons of its kind.
const productKindLinksProjection = `{
  heroButtons[]{
    ${buttonProjection}
  },
  ingredientsListButton{
    ${buttonProjection}
  }
}`;

export const PRODUCT_QUERY = groq`
  *[_type == "product" && kind in $kinds && slug.current == $slug][0]{
    _id,
    _type,
    name,
    kind,
    "slug": slug.current,
    "path": ${PRODUCT_PATH_GROQ},
    heroTitle,
    heroText[]{
      ${richTextContentQuery}
    },
    heroImage{
      ${imageQuery}
    },
    ingredientsLabel,
    ingredientsText[]{
      ${richTextContentQuery}
    },
    ingredientsImage{
      ${imageQuery}
    },
    note[]{
      ${richTextContentQuery}
    },
    nutritionFacts{
      ...,
      servingText[]{
        ${richTextContentQuery}
      }
    },
    "sharingPhoto": select(
      defined(meta.image.asset) => meta.image,
      defined(heroImage.asset) => heroImage
    ){ asset, crop, hotspot },
    ${metaQuery},
    "settings": *[_id == "productPageSettings" && _type == "productPageSettings"][0]{
      _id,
      handmade{
        eyebrow,
        title,
        richText[]{
          ${richTextContentQuery}
        },
        buttons[]{
          ${buttonProjection}
        },
        image{
          ${imageQuery}
        }
      },
      callToAction{
        title,
        richText[]{
          ${richTextContentQuery}
        },
        buttons[]{
          ${buttonProjection}
        },
        image{
          ${imageQuery}
        }
      },
      hoagie${productKindLinksProjection},
      pizza${productKindLinksProjection},
      salsa${productKindLinksProjection}
    }
  }
`;

export const PRODUCTS_SLUGS_QUERY = groq`*[_type == "product" && defined(slug.current) && defined(kind)]{
  "path": ${PRODUCT_PATH_GROQ}
}`;
