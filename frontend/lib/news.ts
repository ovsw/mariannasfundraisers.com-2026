// The words a news post's byline shows, as the old site wrote them:
// "Oct 31, 2025" and "1 min read" (spec decision 9).

/** A publish date as "Oct 31, 2025", in UTC (the date the editor picked). */
export function formatNewsDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);
}

/** A reading time in minutes as "2 min read"; nothing without a valid time. */
export function readingTimeLabel(minutes: number | null | undefined) {
  return typeof minutes === "number" && Number.isFinite(minutes) && minutes > 0
    ? `${Math.round(minutes)} min read`
    : null;
}
