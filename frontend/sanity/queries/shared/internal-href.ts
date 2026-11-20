import { groq } from "next-sanity";

export const customLinkInternalHref = groq`select(
  customLink.internal->_id == "homePage" || customLink.internal->_type == "homePage" => "/",
  customLink.internal->_id == "blogIndex" || customLink.internal->_type == "blogIndex" => "/news",
  customLink.internal->_type == "product" && defined(customLink.internal->slug.current) => select(customLink.internal->kind == "salsa" => "/flavored-salsas/", "/products/") + customLink.internal->slug.current,
  customLink.internal->_type == "post" && defined(customLink.internal->slug.current) => "/news/" + array::join(string::split(customLink.internal->slug.current, "/")[@ != ""], "/"),
  defined(customLink.internal->slug.current) => "/" + array::join(string::split(customLink.internal->slug.current, "/")[@ != ""], "/")
)`;

export const urlInternalHref = groq`select(
  url.internal->_id == "homePage" || url.internal->_type == "homePage" => "/",
  url.internal->_id == "blogIndex" || url.internal->_type == "blogIndex" => "/news",
  url.internal->_type == "product" && defined(url.internal->slug.current) => select(url.internal->kind == "salsa" => "/flavored-salsas/", "/products/") + url.internal->slug.current,
  url.internal->_type == "post" && defined(url.internal->slug.current) => "/news/" + array::join(string::split(url.internal->slug.current, "/")[@ != ""], "/"),
  defined(url.internal->slug.current) => "/" + array::join(string::split(url.internal->slug.current, "/")[@ != ""], "/")
)`;

export const internalReferenceHref = groq`select(
  internal->_id == "homePage" || internal->_type == "homePage" => "/",
  internal->_id == "blogIndex" || internal->_type == "blogIndex" => "/news",
  internal->_type == "product" && defined(internal->slug.current) => select(internal->kind == "salsa" => "/flavored-salsas/", "/products/") + internal->slug.current,
  internal->_type == "post" && defined(internal->slug.current) => "/news/" + array::join(string::split(internal->slug.current, "/")[@ != ""], "/"),
  defined(internal->slug.current) => "/" + array::join(string::split(internal->slug.current, "/")[@ != ""], "/")
)`;

export const linkInternalHref = groq`select(
  link.internal->_id == "homePage" || link.internal->_type == "homePage" => "/",
  link.internal->_id == "blogIndex" || link.internal->_type == "blogIndex" => "/news",
  link.internal->_type == "product" && defined(link.internal->slug.current) => select(link.internal->kind == "salsa" => "/flavored-salsas/", "/products/") + link.internal->slug.current,
  link.internal->_type == "post" && defined(link.internal->slug.current) => "/news/" + array::join(string::split(link.internal->slug.current, "/")[@ != ""], "/"),
  defined(link.internal->slug.current) => "/" + array::join(string::split(link.internal->slug.current, "/")[@ != ""], "/")
)`;

export const legacyInternalLinkHref = groq`select(
  @.internalLink->_id == "homePage" || @.internalLink->_type == "homePage" => "/",
  @.internalLink->_id == "blogIndex" || @.internalLink->_type == "blogIndex" => "/news",
  @.internalLink->_type == "product" && defined(@.internalLink->slug.current) => select(@.internalLink->kind == "salsa" => "/flavored-salsas/", "/products/") + @.internalLink->slug.current,
  @.internalLink->_type == "post" && defined(@.internalLink->slug.current) => "/news/" + array::join(string::split(@.internalLink->slug.current, "/")[@ != ""], "/"),
  defined(@.internalLink->slug.current) => "/" + array::join(string::split(@.internalLink->slug.current, "/")[@ != ""], "/")
)`;
