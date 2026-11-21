import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";

import { config } from "@/proxy";

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }));

vi.mock("@/sanity/lib/client", () => ({
  client: { fetch: fetchMock },
}));

describe("news post count cache", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  test("does not query Sanity for the main news route", async () => {
    const { proxy: freshProxy } = await import("@/proxy");

    const response = await freshProxy(
      new NextRequest("https://www.example.com/news"),
    );

    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("passes post routes through without treating their slug as pagination", async () => {
    const { proxy: freshProxy } = await import("@/proxy");

    const response = await freshProxy(
      new NextRequest("https://www.example.com/news/first-post"),
    );

    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(config.matcher).toEqual(["/((?!_next|api|.*\\..*).*)"]);
  });

  test("does not query Sanity for validated draft-mode pagination", async () => {
    vi.stubEnv("__NEXT_PREVIEW_MODE_ID", "preview-id");
    const { proxy: freshProxy } = await import("@/proxy");

    const response = await freshProxy(
      new NextRequest("https://www.example.com/news/2/", {
        headers: { cookie: "__prerender_bypass=preview-id" },
      }),
    );

    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("returns 404 when a pagination route is out of range", async () => {
    fetchMock.mockResolvedValueOnce(1);
    const { proxy: freshProxy } = await import("@/proxy");

    const response = await freshProxy(
      new NextRequest("https://www.example.com/news/2/"),
    );

    expect(response.status).toBe(404);
    expect(await response.text()).toBe("Not Found");
  });

  test("shares one Sanity request across concurrent cache misses", async () => {
    let resolveFetch!: (value: number) => void;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<number>((resolve) => {
          resolveFetch = resolve;
        }),
    );
    const { proxy: freshProxy } = await import("@/proxy");
    const requests = [1, 2, 3].map(() =>
      freshProxy(new NextRequest("https://www.example.com/news/2/")),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolveFetch(30);

    const responses = await Promise.all(requests);
    expect(responses.map((response) => response.status)).toEqual([200, 200, 200]);
  });

  test("fetches a fresh count after the cache expires", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    fetchMock.mockResolvedValueOnce(30).mockResolvedValueOnce(30);
    const { proxy: freshProxy } = await import("@/proxy");
    const request = () =>
      freshProxy(new NextRequest("https://www.example.com/news/2/"));

    await request();
    vi.advanceTimersByTime(59_999);
    await request();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1);
    await request();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("fails open and clears a rejected post count refresh", async () => {
    fetchMock
      .mockRejectedValueOnce(new Error("Sanity unavailable"))
      .mockResolvedValueOnce(30);
    const { proxy: freshProxy } = await import("@/proxy");
    const request = () =>
      freshProxy(new NextRequest("https://www.example.com/news/2/"));

    await expect(request()).resolves.toMatchObject({ status: 200 });
    await expect(request()).resolves.toMatchObject({ status: 200 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test.each(["/news/category/old-category", "/news/2/extra"])(
    "rejects nested news route %s",
    async (pathname) => {
      const { proxy: freshProxy } = await import("@/proxy");

      const response = await freshProxy(
        new NextRequest(`https://www.example.com${pathname}`),
      );

      expect(response.status).toBe(404);
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );
});
