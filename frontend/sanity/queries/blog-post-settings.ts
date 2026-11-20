import { groq } from "next-sanity";
import { urlHref } from "./shared/custom-url-href";

const actionProjection = `{
  _key,
  title,
  description,
  ...button{
    "text": text,
    "openInNewTab": url.openInNewTab,
    "href": ${urlHref}
  }
}`;

export const BLOG_POST_SETTINGS_QUERY = groq`*[
  _type == "blogPostSettings" &&
  _id == "blogPostSettings" &&
  defined(actions)
][0]{
  _id,
  _type,
  title,
  description,
  "actions": array::compact(actions[]${actionProjection})
}`;
