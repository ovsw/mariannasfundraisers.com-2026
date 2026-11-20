import {
  ImageAndText,
  hasImageAndTextContent,
  type ImageAndTextProps,
} from "./image-and-text";

type VideoLeftAndTextProps = ImageAndTextProps<"videoLeftAndText">;

// The Page Builder excludes sections without content from visible adjacency.
// The rule is shared by the image-and-text family; see image-and-text.tsx.
export function hasVideoLeftAndTextContent(block: VideoLeftAndTextProps) {
  return hasImageAndTextContent(block);
}

export default function VideoLeftAndText(props: VideoLeftAndTextProps) {
  return <ImageAndText block={props} design={{ media: "video", side: "left" }} />;
}
