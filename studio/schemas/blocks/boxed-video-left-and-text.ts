import { MonitorPlayIcon } from "lucide-react";
import { defineImageAndTextSection, youTubeUrlField } from "./shared/image-and-text";

export default defineImageAndTextSection({
  name: "boxedVideoLeftAndText",
  title: "Video left and text (inside margins)",
  description:
    "A YouTube video on the left, shown as its poster image with a play button and kept inside the page margins with rounded corners, beside a heading, text and buttons.",
  icon: MonitorPlayIcon,
  imageTitle: "Poster image",
  imageDescription:
    "Shown with a play button over it; fills its frame and is cropped to fit. Set the hotspot on the part that must stay in view.",
  extraFields: [youTubeUrlField],
});
