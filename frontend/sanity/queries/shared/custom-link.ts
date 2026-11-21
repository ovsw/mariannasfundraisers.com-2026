import { groq } from "next-sanity";
import { customLinkHref } from "./custom-url-href";

// @sanity-typegen-ignore
export const customLinkProjection = groq`
  "href": ${customLinkHref},
  "openInNewTab": customLink.openInNewTab
`;

// @sanity-typegen-ignore
export const customLinkMarkDefsQuery = groq`
  markDefs[]{
    ...,
    _type == "customLink" => {
      ${customLinkProjection}
    }
  }
`;
