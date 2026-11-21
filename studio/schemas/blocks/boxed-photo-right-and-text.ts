import { PanelRightDashedIcon } from "lucide-react";
import { defineImageAndTextSection } from "./shared/image-and-text";

export default defineImageAndTextSection({
  name: "boxedPhotoRightAndText",
  title: "Photo right and text (inside margins)",
  description:
    "A heading, text and buttons beside a photo on the right, kept inside the page margins with rounded corners and cropped to fill its frame.",
  icon: PanelRightDashedIcon,
  imageTitle: "Photo",
  imageDescription:
    "Fills its frame and is cropped to fit. Set the hotspot on the part that must stay in view.",
});
