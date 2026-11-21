import {
  ImageAndText,
  hasImageAndTextContent,
  type ImageAndTextProps,
} from "./image-and-text";

type BoxedVideoLeftAndTextProps = ImageAndTextProps<"boxedVideoLeftAndText">;

// The Page Builder excludes sections without content from visible adjacency.
// The rule is shared by the image-and-text family; see image-and-text.tsx.
export function hasBoxedVideoLeftAndTextContent(block: BoxedVideoLeftAndTextProps) {
  return hasImageAndTextContent(block);
}

export default function BoxedVideoLeftAndText(props: BoxedVideoLeftAndTextProps) {
  return <ImageAndText block={props} design={{ media: "boxedVideo", side: "left" }} />;
}
