"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { pageview, syncAnalytics } from "@/lib/privacy/analytics";
import { PRIVACY_EVENT } from "@/lib/privacy/consent";

/**
 * Runs Google Analytics while the visitor's privacy choice allows it: checks
 * the choice now and whenever the consent widget reports a change, and
 * records client-side navigations.
 */
export function Analytics({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const update = () => syncAnalytics(measurementId);
    update();
    window.addEventListener(PRIVACY_EVENT, update);
    return () => window.removeEventListener(PRIVACY_EVENT, update);
  }, [measurementId]);

  useEffect(() => {
    const path = window.location.pathname + window.location.search;
    // The first page view is sent when the library loads.
    if (lastPath.current !== null && lastPath.current !== path) {
      pageview(measurementId, path);
    }
    lastPath.current = path;
  }, [measurementId, pathname]);

  return null;
}
