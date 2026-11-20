import {
  ImageAndText,
  hasImageAndTextContent,
  type ImageAndTextProps,
} from "./image-and-text";

type CutoutLeftAndTextProps = ImageAndTextProps<"cutoutLeftAndText">;

// The Page Builder excludes sections without content from visible adjacency.
// The rule is shared by the image-and-text family; see image-and-text.tsx.
export function hasCutoutLeftAndTextContent(block: CutoutLeftAndTextProps) {
  return hasImageAndTextContent(block);
}

export default function CutoutLeftAndText(props: CutoutLeftAndTextProps) {
  return <ImageAndText block={props} design={{ media: "cutout", side: "left" }} />;
}
