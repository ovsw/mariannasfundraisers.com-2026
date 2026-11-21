import { fetchSanitySettings } from "@/sanity/lib/fetch";
import { cleanMeasurementId } from "@/lib/privacy/analytics";
import { Analytics } from "./analytics";

/** Google Analytics with the measurement ID from the published settings, when one is set. */
export async function SiteAnalytics() {
  const settings = await fetchSanitySettings({ perspective: "published", stega: false });
  const measurementId = cleanMeasurementId(settings?.googleAnalyticsMeasurementId);
  return measurementId ? <Analytics measurementId={measurementId} /> : null;
}
