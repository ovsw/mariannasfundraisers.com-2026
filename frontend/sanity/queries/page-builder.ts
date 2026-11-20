import { richTextBlockQuery } from "./rich-text-block";
import { scaffoldQuery } from "./scaffold";
import { pageBannerQuery } from "./page-banner";
import { pageHeadingQuery } from "./page-heading";
// page-builder-generator:query-imports

export const pageBuilderQuery = `
  blocks[]{
    _key,
    _type,
    ${richTextBlockQuery},
    ${scaffoldQuery},
    ${pageBannerQuery},
    ${pageHeadingQuery},
    ${"" /* page-builder-generator:query-spreads */}
  }
`;
