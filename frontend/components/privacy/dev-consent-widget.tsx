"use client";

// The consent widget for `next dev` only. The widget marks the images, links
// and scripts of the page (data-cmp-*). React's development build compares
// those attributes while it hydrates and reports every one as a hydration
// mismatch; the production build does not compare them. So in development the
// widget loads once the page has loaded and React has had time to finish.
// Production keeps the widget ahead of every other script (root layout).
import { useEffect } from "react";
import { IUBENDA_WIDGET_SRC } from "@/lib/privacy/iubenda";

const AFTER_LOAD_MS = 3000;

export function DevConsentWidget() {
  useEffect(() => {
    let timer: number | undefined;
    const start = () => {
      timer = window.setTimeout(() => {
        const script = document.createElement("script");
        script.src = IUBENDA_WIDGET_SRC;
        script.async = true;
        document.body.appendChild(script);
      }, AFTER_LOAD_MS);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      window.clearTimeout(timer);
    };
  }, []);
  return null;
}
