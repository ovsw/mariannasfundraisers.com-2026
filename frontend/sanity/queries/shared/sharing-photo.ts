import { groq } from "next-sanity";

// The photo on a generated sharing card: the Social sharing photo first, then
// the photo the page already leads with. A photo without an asset is skipped,
// so an emptied field falls through instead of blocking the next source.
const photoProjection = groq`{ asset, crop, hotspot }`;

/** A page without a Social sharing photo uses the photo of its Page banner. */
export const pageSharingPhotoQuery = groq`"sharingPhoto": select(
  defined(meta.image.asset) => meta.image,
  blocks[_type in ["homeHero", "pageBanner"] && defined(image.asset)][0].image
)${photoProjection}`;

/** Posts lead with their main image. */
export const postSharingPhotoQuery = groq`"sharingPhoto": select(
  defined(meta.image.asset) => meta.image,
  defined(image.asset) => image
)${photoProjection}`;

/** Archives have no hero, so only the Social sharing photo applies. */
export const archiveSharingPhotoQuery = groq`"sharingPhoto": select(
  defined(meta.image.asset) => meta.image
)${photoProjection}`;
