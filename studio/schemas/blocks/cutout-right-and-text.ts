import { ImageIcon } from "lucide-react";
import { defineImageAndTextSection } from "./shared/image-and-text";

export default defineImageAndTextSection({
  name: "cutoutRightAndText",
  title: "Cutout right and text",
  description:
    "A heading, text and buttons beside an illustration or cutout image on the right, shown whole.",
  icon: ImageIcon,
  imageTitle: "Image",
  imageDescription:
    "Shown whole, never cropped. Best as an illustration or a cutout on a transparent background.",
});
