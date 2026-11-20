import { customLinkInternalHref, urlInternalHref } from "./internal-href";

// The href of a `customUrl` object: a site document with its optional anchor,
// an external URL (web, mailto:, tel: or a site path), or an uploaded file. A
// reference to a missing document gives no href, and neither does its anchor
// on its own. One constant per field name the object is stored under.

/** For a `customUrl` stored at `url` (buttons). */
export const urlHref = `select(
  url.type == "internal" => ${urlInternalHref} + select(defined(url.anchor) => "#" + url.anchor, ""),
  url.type == "external" => url.external,
  url.type == "file" => url.file.asset->url,
  url.href
)`;

/** For a `customUrl` stored at `customLink` (inline links). */
export const customLinkHref = `select(
  customLink.type == "internal" => ${customLinkInternalHref} + select(defined(customLink.anchor) => "#" + customLink.anchor, ""),
  customLink.type == "external" => customLink.external,
  customLink.type == "file" => customLink.file.asset->url,
  customLink.href
)`;
