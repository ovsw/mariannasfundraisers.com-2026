import { Pizza } from "lucide-react";
import { defineProductMenuSection } from "./shared/product-menu";

export default defineProductMenuSection({
  name: "pizzaMenu",
  title: "Pizza menu",
  kind: "pizza",
  plural: "pizzas",
  icon: Pizza,
});
