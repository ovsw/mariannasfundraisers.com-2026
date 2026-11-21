import { richTextBlockQuery } from "./rich-text-block";
import { scaffoldQuery } from "./scaffold";
import { pageBannerQuery } from "./page-banner";
import { pageHeadingQuery } from "./page-heading";
import { photoLeftAndTextQuery } from "./photo-left-and-text";
import { photoRightAndTextQuery } from "./photo-right-and-text";
import { boxedPhotoLeftAndTextQuery } from "./boxed-photo-left-and-text";
import { boxedPhotoRightAndTextQuery } from "./boxed-photo-right-and-text";
import { cutoutLeftAndTextQuery } from "./cutout-left-and-text";
import { cutoutRightAndTextQuery } from "./cutout-right-and-text";
import { badgeAndTextQuery } from "./badge-and-text";
import { videoLeftAndTextQuery } from "./video-left-and-text";
import { videoRightAndTextQuery } from "./video-right-and-text";
import { boxedVideoLeftAndTextQuery } from "./boxed-video-left-and-text";
import { boxedVideoRightAndTextQuery } from "./boxed-video-right-and-text";
import { imageAndIconListQuery } from "./image-and-icon-list";
import { latestNewsQuery } from "./latest-news";
import { cognitoFormQuery } from "./cognito-form";
import { cognitoFormAndTextQuery } from "./cognito-form-and-text";
import { faqListQuery } from "./faq-list";
import { twoTextColumnsQuery } from "./two-text-columns";
import { hoagieMenuQuery } from "./hoagie-menu";
import { pizzaMenuQuery } from "./pizza-menu";
import { salsaMenuQuery } from "./salsa-menu";
import { homeHeroQuery } from "./home-hero";
import { stepsQuery } from "./steps";
import { menuTeaserQuery } from "./menu-teaser";
import { callToActionWithImageQuery } from "./call-to-action-with-image";
import { testimonialsQuery } from "./testimonials";
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
    ${boxedPhotoLeftAndTextQuery},
    ${boxedPhotoRightAndTextQuery},
    ${cutoutLeftAndTextQuery},
    ${cutoutRightAndTextQuery},
    ${badgeAndTextQuery},
    ${videoLeftAndTextQuery},
    ${videoRightAndTextQuery},
    ${boxedVideoLeftAndTextQuery},
    ${boxedVideoRightAndTextQuery},
    ${imageAndIconListQuery},
    ${latestNewsQuery},
    ${cognitoFormQuery},
    ${cognitoFormAndTextQuery},
    ${faqListQuery},
    ${twoTextColumnsQuery},
    ${hoagieMenuQuery},
    ${pizzaMenuQuery},
    ${salsaMenuQuery},
    ${homeHeroQuery},
    ${stepsQuery},
    ${menuTeaserQuery},
    ${callToActionWithImageQuery},
    ${testimonialsQuery},
    ${"" /* page-builder-generator:query-spreads */}
  }
`;
