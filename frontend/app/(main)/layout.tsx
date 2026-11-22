import { CachedHeader, DynamicHeader } from "@/components/header";
import { CachedFooter, DynamicFooter } from "@/components/footer";
import { DisableDraftMode } from "@/components/disable-draft-mode";
import { VisualEditing } from "next-sanity/visual-editing";
import { draftMode } from "next/headers";
import { SanityLive } from "@/sanity/lib/live";
import { SiteAnalytics } from "@/components/privacy/site-analytics";
import { Suspense } from "react";
import { OfficeContactProvider } from "@/components/forms/office-contact";
import { fetchSanitySettings } from "@/sanity/lib/fetch";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isEnabled: isDraftMode } = await draftMode();
  // For the forms' failure message (components/forms/office-contact.tsx).
  const settings = await fetchSanitySettings({ perspective: "published", stega: false });
  const officeContact = {
    phone: settings?.contact?.phone?.trim() || undefined,
    email: settings?.contact?.email?.trim() || undefined,
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-background focus:p-4 focus:text-foreground"
      >
        Skip to content
      </a>
      {isDraftMode ? (
        <DynamicHeader />
      ) : (
        <CachedHeader perspective="published" stega={false} />
      )}
      <main id="main-content" tabIndex={-1}>
        <OfficeContactProvider contact={officeContact}>{children}</OfficeContactProvider>
      </main>
      {/* In production, the Sanity Function in studio/functions/invalidate-tags
          expires changed content on publish. Open pages wait for it, so they
          never reload the old version. */}
      <SanityLive
        includeDrafts={isDraftMode}
        waitFor={process.env.VERCEL_ENV === "production" ? "function" : undefined}
      />
      {isDraftMode && (
        <>
          <DisableDraftMode />
          <VisualEditing />
        </>
      )}
      {/* Google Analytics, only while the visitor's privacy choice allows
          it. Editors previewing drafts are not counted. */}
      {!isDraftMode && (
        <Suspense fallback={null}>
          <SiteAnalytics />
        </Suspense>
      )}
      {isDraftMode ? (
        <DynamicFooter />
      ) : (
        <CachedFooter perspective="published" stega={false} />
      )}
    </>
  );
}
