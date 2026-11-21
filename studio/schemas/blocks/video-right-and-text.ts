import { SquarePlayIcon } from "lucide-react";
import { defineImageAndTextSection, youTubeUrlField } from "./shared/image-and-text";

export default defineImageAndTextSection({
  name: "videoRightAndText",
  title: "Video right and text (to page edge)",
  description:
    "A heading, text and buttons beside a YouTube video on the right, shown as its poster image with a play button and running out to the page edge.",
  icon: SquarePlayIcon,
  imageTitle: "Poster image",
  imageDescription:
    "Shown with a play button over it; fills its frame and is cropped to fit. Set the hotspot on the part that must stay in view.",
  extraFields: [youTubeUrlField],
});
