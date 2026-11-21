import { stegaClean } from "next-sanity";

type TitleBlock = {
  _type: string;
  title?: string | null;
  image?: { asset?: { url?: string | null } | null } | null;
};

/**
 * Whether a section on the page draws the page's main heading (its `h1`).
 * A Page heading draws its title; a Page banner and a Home hero draw their
 * title over their photo. When none does, the page template draws the page title as a
 * visually hidden `h1`, so every page has exactly one.
 */
export function blocksDrawPageTitle(blocks: readonly TitleBlock[]): boolean {
  return blocks.some((block) => {
    if (!stegaClean(block.title)?.trim()) return false;
    if (block._type === "pageHeading") return true;
    if (block._type === "pageBanner" || block._type === "homeHero") {
      return Boolean(block.image?.asset?.url);
    }
    return false;
  });
}
