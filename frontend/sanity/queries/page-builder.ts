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
import { latestNewsQuery } from "./latest-news";
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
    ${latestNewsQuery},
    ${"" /* page-builder-generator:query-spreads */}
  }
`;
