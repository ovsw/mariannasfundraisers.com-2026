import Custom404 from "@/components/404";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
};

/** A page that is not found inside the site, drawn between its header and footer. */
export default function MainNotFoundPage() {
  return <Custom404 />;
}
