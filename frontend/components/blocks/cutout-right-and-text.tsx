import {
  ImageAndText,
  hasImageAndTextContent,
  type ImageAndTextProps,
} from "./image-and-text";

type CutoutRightAndTextProps = ImageAndTextProps<"cutoutRightAndText">;

// The Page Builder excludes sections without content from visible adjacency.
// The rule is shared by the image-and-text family; see image-and-text.tsx.
export function hasCutoutRightAndTextContent(block: CutoutRightAndTextProps) {
  return hasImageAndTextContent(block);
}

export default function CutoutRightAndText(props: CutoutRightAndTextProps) {
  return <ImageAndText block={props} design={{ media: "cutout", side: "right" }} />;
}
