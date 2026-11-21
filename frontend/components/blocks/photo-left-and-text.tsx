import {
  ImageAndText,
  hasImageAndTextContent,
  type ImageAndTextProps,
} from "./image-and-text";

type PhotoLeftAndTextProps = ImageAndTextProps<"photoLeftAndText">;

// The Page Builder excludes sections without content from visible adjacency.
// The rule is shared by the image-and-text family; see image-and-text.tsx.
export function hasPhotoLeftAndTextContent(block: PhotoLeftAndTextProps) {
  return hasImageAndTextContent(block);
}

export default function PhotoLeftAndText(props: PhotoLeftAndTextProps) {
  return <ImageAndText block={props} design={{ media: "photo", side: "left" }} />;
}
