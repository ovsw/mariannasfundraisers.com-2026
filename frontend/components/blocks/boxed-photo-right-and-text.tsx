import {
  ImageAndText,
  hasImageAndTextContent,
  type ImageAndTextProps,
} from "./image-and-text";

type BoxedPhotoRightAndTextProps = ImageAndTextProps<"boxedPhotoRightAndText">;

// The Page Builder excludes sections without content from visible adjacency.
// The rule is shared by the image-and-text family; see image-and-text.tsx.
export function hasBoxedPhotoRightAndTextContent(block: BoxedPhotoRightAndTextProps) {
  return hasImageAndTextContent(block);
}

export default function BoxedPhotoRightAndText(props: BoxedPhotoRightAndTextProps) {
  return <ImageAndText block={props} design={{ media: "boxedPhoto", side: "right" }} />;
}
