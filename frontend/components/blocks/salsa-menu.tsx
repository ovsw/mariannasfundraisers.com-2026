import { ProductMenu, hasProductMenuContent, type ProductMenuProps } from "./product-menu";

type SalsaMenuProps = Extract<ProductMenuProps, { _type: "salsaMenu" }>;

export function hasSalsaMenuContent(block: Pick<SalsaMenuProps, "products">) {
  return hasProductMenuContent(block);
}

export default function SalsaMenu(props: SalsaMenuProps) {
  return <ProductMenu block={props} />;
}
