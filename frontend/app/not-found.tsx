import Custom404 from "@/components/404";
import { CachedFooter } from "@/components/footer";
import { CachedHeader } from "@/components/header";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
};

/**
 * A URL no route matches. It renders outside the (main) layout, so it draws
 * the published header and footer itself.
 */
export default function NotFoundPage() {
  return (
    <>
      <CachedHeader perspective="published" stega={false} />
      <main id="main-content" tabIndex={-1}>
        <Custom404 />
      </main>
      <CachedFooter perspective="published" stega={false} />
    </>
  );
}
