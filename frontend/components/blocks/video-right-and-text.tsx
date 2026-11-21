import {
  ImageAndText,
  hasImageAndTextContent,
  type ImageAndTextProps,
} from "./image-and-text";

type VideoRightAndTextProps = ImageAndTextProps<"videoRightAndText">;

// The Page Builder excludes sections without content from visible adjacency.
// The rule is shared by the image-and-text family; see image-and-text.tsx.
export function hasVideoRightAndTextContent(block: VideoRightAndTextProps) {
  return hasImageAndTextContent(block);
}

export default function VideoRightAndText(props: VideoRightAndTextProps) {
  return <ImageAndText block={props} design={{ media: "video", side: "right" }} />;
}
