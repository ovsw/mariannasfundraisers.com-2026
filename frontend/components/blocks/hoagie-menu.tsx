import { ProductMenu, hasProductMenuContent, type ProductMenuProps } from "./product-menu";

type HoagieMenuProps = Extract<ProductMenuProps, { _type: "hoagieMenu" }>;

export function hasHoagieMenuContent(block: Pick<HoagieMenuProps, "products">) {
  return hasProductMenuContent(block);
}

export default function HoagieMenu(props: HoagieMenuProps) {
  return <ProductMenu block={props} />;
}
