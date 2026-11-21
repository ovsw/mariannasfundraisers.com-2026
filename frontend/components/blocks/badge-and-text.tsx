import {
  ImageAndText,
  hasImageAndTextContent,
  type ImageAndTextProps,
} from "./image-and-text";

type BadgeAndTextProps = ImageAndTextProps<"badgeAndText">;

// The Page Builder excludes sections without content from visible adjacency.
// The rule is shared by the image-and-text family; see image-and-text.tsx.
export function hasBadgeAndTextContent(block: BadgeAndTextProps) {
  return hasImageAndTextContent(block);
}

export default function BadgeAndText(props: BadgeAndTextProps) {
  return <ImageAndText block={props} design={{ media: "badge", side: "right" }} />;
}
