import { PanelLeftDashedIcon } from "lucide-react";
import { defineImageAndTextSection } from "./shared/image-and-text";

export default defineImageAndTextSection({
  name: "boxedPhotoLeftAndText",
  title: "Photo left and text (inside margins)",
  description:
    "A photo on the left, kept inside the page margins with rounded corners and cropped to fill its frame, beside a heading, text and buttons.",
  icon: PanelLeftDashedIcon,
  imageTitle: "Photo",
  imageDescription:
    "Fills its frame and is cropped to fit. Set the hotspot on the part that must stay in view.",
});
