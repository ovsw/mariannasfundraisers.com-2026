import { describe, expect, it } from "vitest";
import { formatNewsDate, readingTimeLabel } from "./news";

describe("formatNewsDate", () => {
  it("writes the date the editor picked, whatever the server's time zone", () => {
    expect(formatNewsDate("2025-10-31T00:00:00.000Z")).toBe("Oct 31, 2025");
    expect(formatNewsDate("2024-11-07T00:00:00.000Z")).toBe("Nov 7, 2024");
  });

  it("draws nothing without a valid date", () => {
    expect(formatNewsDate(null)).toBeNull();
    expect(formatNewsDate("")).toBeNull();
    expect(formatNewsDate("not a date")).toBeNull();
  });
});

describe("readingTimeLabel", () => {
  it("writes whole minutes", () => {
    expect(readingTimeLabel(1)).toBe("1 min read");
    expect(readingTimeLabel(3)).toBe("3 min read");
  });

  it("draws nothing without a positive reading time", () => {
    expect(readingTimeLabel(null)).toBeNull();
    expect(readingTimeLabel(0)).toBeNull();
    expect(readingTimeLabel(Number.NaN)).toBeNull();
  });
});
