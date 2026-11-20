import { SquarePlayIcon } from "lucide-react";
import { defineImageAndTextSection, youTubeUrlField } from "./shared/image-and-text";

export default defineImageAndTextSection({
  name: "videoLeftAndText",
  title: "Video left and text",
  description:
    "A YouTube video on the left, shown as its poster image with a play button, beside a heading, text and buttons.",
  icon: SquarePlayIcon,
  imageTitle: "Poster image",
  imageDescription:
    "Shown with a play button over it; fills its frame and is cropped to fit. Set the hotspot on the part that must stay in view.",
  extraFields: [youTubeUrlField],
});
