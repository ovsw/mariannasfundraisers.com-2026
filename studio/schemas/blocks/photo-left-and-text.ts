import { PanelLeftIcon } from "lucide-react";
import { defineImageAndTextSection } from "./shared/image-and-text";

export default defineImageAndTextSection({
  name: "photoLeftAndText",
  title: "Photo left and text (to page edge)",
  description:
    "A photo on the left, running out to the page edge and cropped to fill its frame, beside a heading, text and buttons.",
  icon: PanelLeftIcon,
  imageTitle: "Photo",
  imageDescription:
    "Fills its frame and is cropped to fit. Set the hotspot on the part that must stay in view.",
});
