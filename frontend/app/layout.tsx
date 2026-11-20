import "./globals.css";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-url";
import { siteName } from "@/lib/site-name";
import { Toaster } from "@/components/ui/sonner";

const isProduction = process.env.NEXT_PUBLIC_SITE_ENV === "production";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: `%s | ${siteName}`,
    default: siteName,
  },
  openGraph: {
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/og/default`,
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: !isProduction ? "noindex, nofollow" : "index, follow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* The Adobe Fonts kit of the old site: Acumin Pro and its condensed
            cuts (--font-* in globals.css). */}
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="" />
        <link rel="stylesheet" href="https://use.typekit.net/ops4vzn.css" />
      </head>
      <link rel="icon" href="/brand/mark.svg" type="image/svg+xml" />
      <body>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
