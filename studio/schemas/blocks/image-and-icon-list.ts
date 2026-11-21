import { ListIcon } from "lucide-react";
import { defineImageAndTextSection, iconListItemsField } from "./shared/image-and-text";

export default defineImageAndTextSection({
  name: "imageAndIconList",
  title: "Image and icon list",
  description:
    "An illustration on the left, shown whole, beside up to three items, each an icon, a heading and a few sentences.",
  icon: ListIcon,
  imageTitle: "Image",
  imageDescription:
    "Shown whole, never cropped. Best as an illustration or a cutout on a transparent background.",
  extraFields: [iconListItemsField],
  textOptional: true,
});
