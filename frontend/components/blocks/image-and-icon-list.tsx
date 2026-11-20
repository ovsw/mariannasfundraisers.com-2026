import {
  ImageAndText,
  hasImageAndTextContent,
  type ImageAndTextProps,
} from "./image-and-text";

type ImageAndIconListProps = ImageAndTextProps<"imageAndIconList">;

// The Page Builder excludes sections without content from visible adjacency.
// The rule is shared by the image-and-text family; see image-and-text.tsx.
export function hasImageAndIconListContent(block: ImageAndIconListProps) {
  return hasImageAndTextContent(block);
}

export default function ImageAndIconList(props: ImageAndIconListProps) {
  return <ImageAndText block={props} design={{ media: "cutout", side: "left" }} />;
}
