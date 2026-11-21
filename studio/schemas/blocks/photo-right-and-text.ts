import { PanelRightIcon } from "lucide-react";
import { defineImageAndTextSection } from "./shared/image-and-text";

export default defineImageAndTextSection({
  name: "photoRightAndText",
  title: "Photo right and text (to page edge)",
  description:
    "A heading, text and buttons beside a photo on the right, running out to the page edge and cropped to fill its frame.",
  icon: PanelRightIcon,
  imageTitle: "Photo",
  imageDescription:
    "Fills its frame and is cropped to fit. Set the hotspot on the part that must stay in view.",
});
