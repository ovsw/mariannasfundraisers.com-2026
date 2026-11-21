import {
  ImageAndText,
  hasImageAndTextContent,
  type ImageAndTextProps,
} from "./image-and-text";

type BoxedVideoRightAndTextProps = ImageAndTextProps<"boxedVideoRightAndText">;

// The Page Builder excludes sections without content from visible adjacency.
// The rule is shared by the image-and-text family; see image-and-text.tsx.
export function hasBoxedVideoRightAndTextContent(block: BoxedVideoRightAndTextProps) {
  return hasImageAndTextContent(block);
}

export default function BoxedVideoRightAndText(props: BoxedVideoRightAndTextProps) {
  return <ImageAndText block={props} design={{ media: "boxedVideo", side: "right" }} />;
}
