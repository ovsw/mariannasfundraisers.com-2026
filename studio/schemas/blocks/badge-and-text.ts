import { BadgeIcon } from "lucide-react";
import { defineImageAndTextSection } from "./shared/image-and-text";

export default defineImageAndTextSection({
  name: "badgeAndText",
  title: "Badge and text",
  description:
    "A heading, text and buttons beside a smaller image on the right, such as a logo or a product badge, shown whole.",
  icon: BadgeIcon,
  imageTitle: "Badge",
  imageDescription: "Shown whole at a smaller size, never cropped: a logo, a badge or a product line-up.",
});
