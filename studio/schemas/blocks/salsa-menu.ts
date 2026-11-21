import { Soup } from "lucide-react";
import { defineProductMenuSection } from "./shared/product-menu";

export default defineProductMenuSection({
  name: "salsaMenu",
  title: "Salsa menu",
  kind: "salsa",
  plural: "salsas",
  icon: Soup,
});
