import {
  ImageAndText,
  hasImageAndTextContent,
  type ImageAndTextProps,
} from "./image-and-text";

type BoxedPhotoLeftAndTextProps = ImageAndTextProps<"boxedPhotoLeftAndText">;

// The Page Builder excludes sections without content from visible adjacency.
// The rule is shared by the image-and-text family; see image-and-text.tsx.
export function hasBoxedPhotoLeftAndTextContent(block: BoxedPhotoLeftAndTextProps) {
  return hasImageAndTextContent(block);
}

export default function BoxedPhotoLeftAndText(props: BoxedPhotoLeftAndTextProps) {
  return <ImageAndText block={props} design={{ media: "boxedPhoto", side: "left" }} />;
}
