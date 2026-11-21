import { Button } from "@/components/ui/button";
import Link from "next/link";

/** The 404 page in the site's look: the Shaded ground, a red eyebrow, a green heading and the red button. */
export default function Custom404() {
  return (
    <section className="section-scene-shaded bg-background">
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-6 py-24 text-center md:py-32">
        <p className="font-condensed text-lg font-bold tracking-wide text-link uppercase italic">
          Error 404
        </p>
        <h1 className="max-w-3xl text-4xl font-extrabold text-pretty text-emphasis md:text-6xl">
          Page not found
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
          This page may have moved, or the address may be incorrect.
        </p>
        <Button asChild className="mt-4" size="cta" variant="primary">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </section>
  );
}
