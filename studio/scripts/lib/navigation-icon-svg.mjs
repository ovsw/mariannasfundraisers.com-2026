import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { dynamicIconImports } from "lucide-react/dynamic.mjs";

/**
 * The SVG markup of Lucide icons by name, rendered the way the Studio's
 * navigation icon picker stores it (schemas/inputs/navigation-icon-input.tsx),
 * so an imported icon matches a picked one.
 */
export async function renderNavigationIconSvgs(names) {
  const svgs = new Map();
  for (const name of names) {
    const loadIcon = dynamicIconImports[name];
    if (!loadIcon) throw new Error(`${name} is not a Lucide icon`);
    const iconModule = await loadIcon();
    svgs.set(name, renderToStaticMarkup(createElement(iconModule.default, { "aria-hidden": true })));
  }
  return svgs;
}
