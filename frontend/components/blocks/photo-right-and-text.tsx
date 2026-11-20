import {
  ImageAndText,
  hasImageAndTextContent,
  type ImageAndTextProps,
} from "./image-and-text";

type PhotoRightAndTextProps = ImageAndTextProps<"photoRightAndText">;

// The Page Builder excludes sections without content from visible adjacency.
// The rule is shared by the image-and-text family; see image-and-text.tsx.
export function hasPhotoRightAndTextContent(block: PhotoRightAndTextProps) {
  return hasImageAndTextContent(block);
}

export default function PhotoRightAndText(props: PhotoRightAndTextProps) {
  return <ImageAndText block={props} design={{ media: "photo", side: "right" }} />;
}
