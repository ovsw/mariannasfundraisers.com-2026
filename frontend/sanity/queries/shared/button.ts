import { groq } from "next-sanity";
import { urlHref } from "./custom-url-href";

// The fields of a `button` that components/site-button.tsx draws. Use it as
// the projection of a button or of each item of a `buttons` array:
// `buttons[]{ ${buttonProjection} }`.
// @sanity-typegen-ignore
export const buttonProjection = groq`
  _key,
  text,
  colour,
  icon,
  "openInNewTab": url.openInNewTab,
  "href": ${urlHref}
`;
