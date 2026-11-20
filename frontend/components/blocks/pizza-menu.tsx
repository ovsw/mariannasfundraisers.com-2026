import { ProductMenu, hasProductMenuContent, type ProductMenuProps } from "./product-menu";

type PizzaMenuProps = Extract<ProductMenuProps, { _type: "pizzaMenu" }>;

export function hasPizzaMenuContent(block: Pick<PizzaMenuProps, "products">) {
  return hasProductMenuContent(block);
}

export default function PizzaMenu(props: PizzaMenuProps) {
  return <ProductMenu block={props} />;
}
