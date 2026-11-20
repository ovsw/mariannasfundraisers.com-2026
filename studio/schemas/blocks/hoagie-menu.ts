import { Sandwich } from "lucide-react";
import { defineProductMenuSection } from "./shared/product-menu";

export default defineProductMenuSection({
  name: "hoagieMenu",
  title: "Hoagie menu",
  kind: "hoagie",
  plural: "hoagies",
  icon: Sandwich,
});
