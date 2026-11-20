import { richTextBlockQuery } from "./rich-text-block";
import { scaffoldQuery } from "./scaffold";
import { pageBannerQuery } from "./page-banner";
import { pageHeadingQuery } from "./page-heading";
import { photoLeftAndTextQuery } from "./photo-left-and-text";
import { photoRightAndTextQuery } from "./photo-right-and-text";
import { cutoutLeftAndTextQuery } from "./cutout-left-and-text";
import { cutoutRightAndTextQuery } from "./cutout-right-and-text";
import { badgeAndTextQuery } from "./badge-and-text";
import { videoLeftAndTextQuery } from "./video-left-and-text";
import { videoRightAndTextQuery } from "./video-right-and-text";
import { imageAndIconListQuery } from "./image-and-icon-list";
import { cognitoFormQuery } from "./cognito-form";
import { faqListQuery } from "./faq-list";
import { twoTextColumnsQuery } from "./two-text-columns";
import { hoagieMenuQuery } from "./hoagie-menu";
import { pizzaMenuQuery } from "./pizza-menu";
import { salsaMenuQuery } from "./salsa-menu";
// page-builder-generator:query-imports

export const pageBuilderQuery = `
  blocks[]{
    _key,
    _type,
    ${richTextBlockQuery},
    ${scaffoldQuery},
    ${pageBannerQuery},
    ${pageHeadingQuery},
    ${photoLeftAndTextQuery},
    ${photoRightAndTextQuery},
    ${cutoutLeftAndTextQuery},
    ${cutoutRightAndTextQuery},
    ${badgeAndTextQuery},
    ${videoLeftAndTextQuery},
    ${videoRightAndTextQuery},
    ${imageAndIconListQuery},
    ${cognitoFormQuery},
    ${faqListQuery},
    ${twoTextColumnsQuery},
    ${hoagieMenuQuery},
    ${pizzaMenuQuery},
    ${salsaMenuQuery},
    ${"" /* page-builder-generator:query-spreads */}
  }
`;
