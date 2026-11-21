import "./globals.css";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-url";
import { siteName } from "@/lib/site-name";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import { IUBENDA_WIDGET_SRC } from "@/lib/privacy/iubenda";
import { DevConsentWidget } from "@/components/privacy/dev-consent-widget";

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
  // The old site's favicons and web manifest, at their old paths.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#00764f" }],
  },
  manifest: "/site.webmanifest",
  other: { "msapplication-config": "/browserconfig.xml" },
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
      <body>
        {/* The consent widget (spec decision 17). The bootstrap hooks the
            widget's callbacks, so it runs first; analytics waits for both.
            In development the widget loads late, so its marks on the page are
            not reported as hydration mismatches (see DevConsentWidget). */}
        <Script src="/privacy-controls.js" strategy="beforeInteractive" />
        {process.env.NODE_ENV === "development" ? (
          <DevConsentWidget />
        ) : (
          <Script src={IUBENDA_WIDGET_SRC} strategy="beforeInteractive" />
        )}
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
