import AxeBuilder from "@axe-core/playwright";
import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

// The smoke runs against `next start` after `next build`. Routes come from the
// built site's sitemap, so a new page or page type is tested without editing
// this file, and an editor who renames a slug cannot break CI.

const desktop = { height: 720, width: 1280 };
const mobile = { height: 844, width: 390 };

async function sitemapRoutes(request: APIRequestContext) {
  const response = await request.get("/sitemap.xml");
  expect(response.ok(), "sitemap should respond successfully").toBe(true);
  // A site URL with a trailing slash yields `//about`, which the browser
  // would read as a host; collapse leading slashes to one.
  const routes = [
    ...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g),
  ].map((match) => new URL(match[1]).pathname.replace(/^\/+/, "/"));
  expect(routes.length, "sitemap should list at least one route").toBeGreaterThan(0);
  return routes;
}

async function gotoRoute(page: Page, path: string) {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  expect(response?.ok(), `${path} should respond successfully`).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

async function expectAccessibleRoute(page: Page) {
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  // The Starter ships no theme toggle. Match a toggle's whole name, so a
  // button such as "Flight" or "Theme packages" does not count as one.
  await expect(
    page.getByRole("button", {
      name: /^((toggle|switch|change)( to)? )?(the )?(theme|colou?r (mode|scheme)|dark mode|light mode)$/i,
    }),
  ).toHaveCount(0);
  await expect(
    page.locator("[aria-hidden='false'], [aria-hidden='true'][tabindex='0']"),
  ).toHaveCount(0);
  await expect(page.locator("img:not([alt])")).toHaveCount(0);
}

function horizontalOverflow(page: Page) {
  return page
    .locator("html")
    .evaluate((element) => element.scrollWidth - element.clientWidth);
}

function runningAnimations(page: Page) {
  return page.locator("body *").evaluateAll((elements) => {
    const styled = elements.filter((element) => {
      const style = getComputedStyle(element);
      return (
        style.animationName !== "none" || style.transitionDuration !== "0s"
      );
    }).length;
    // Animations started from script with Element.animate() leave no trace in
    // the computed style.
    const scripted = document
      .getAnimations()
      .filter((animation) => animation.playState === "running").length;
    return styled + scripted;
  });
}

/** The first sitemap route that is not the home page or part of the blog. */
function firstPageRoute(routes: string[]) {
  return routes.find((route) => route !== "/" && !/^\/blog(\/|$)/.test(route));
}

test.describe("every sitemap route", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" }, viewport: desktop });

  // A Website's sitemap grows to well over a hundred routes. Walking them in
  // one test is slow, so the walk is split into fixed shards that Playwright
  // runs in parallel workers against the same server.
  const routeShards = 4;

  for (let shard = 0; shard < routeShards; shard += 1) {
    test(`renders with landmarks, alt text, no reduced-motion animation, and no mobile overflow (shard ${shard + 1} of ${routeShards})`, async ({
      page,
      request,
    }) => {
      test.setTimeout(180_000);

      const routes = (await sitemapRoutes(request)).filter(
        (_, index) => index % routeShards === shard,
      );

      for (const route of routes) {
        await test.step(route, async () => {
          await gotoRoute(page, route);
          await expectAccessibleRoute(page);
          expect(
            await runningAnimations(page),
            `${route} animates for reduced-motion visitors`,
          ).toBe(0);

          // The main navigation only shows at desktop widths; overflow only
          // shows at phone widths. Resize in place instead of loading twice.
          await page.setViewportSize(mobile);
          expect(
            await horizontalOverflow(page),
            `${route} overflows at ${mobile.width}px`,
          ).toBe(0);
          await page.setViewportSize(desktop);
        });
      }
    });
  }

  // One route per template. The route walk above covers every document for
  // the cheap checks; axe runs once per template, with colour contrast on, so
  // faded or low-contrast text fails CI.
  test("passes an axe accessibility scan with colour contrast on each template", async ({
    page,
    request,
  }) => {
    const routes = await sitemapRoutes(request);
    const templates = [
      "/",
      firstPageRoute(routes),
      "/blog",
      routes.find((route) => /^\/blog\/(?!category\/)[^/]+$/.test(route)),
      routes.find((route) => /^\/blog\/category\/[^/]+$/.test(route)),
    ];
    expect(
      templates,
      "the sitemap should list a page, a blog post, and a blog category",
    ).not.toContain(undefined);
    const violations: string[] = [];

    for (const route of templates as string[]) {
      await test.step(route, async () => {
        await gotoRoute(page, route);
        const results = await new AxeBuilder({ page })
          .options({ rules: { "color-contrast": { enabled: true } } })
          .analyze();
        for (const violation of results.violations) {
          violations.push(
            `${route}: ${violation.id} (${violation.impact}): ${violation.help}. Nodes: ${violation.nodes
              .map((node) => node.target.join(" "))
              .join(", ")}`,
          );
        }
      });
    }

    expect(violations).toEqual([]);
  });
});

test("supports keyboard access on starter routes", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);

  await page.goto("/");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: /home page/i }).first(),
  ).toBeFocused();
});

test("keeps the home page and a content page free of horizontal overflow at every width", async ({
  page,
  request,
}) => {
  const pageRoute = firstPageRoute(await sitemapRoutes(request));
  expect(pageRoute, "the sitemap should list a page").toBeDefined();

  for (const viewport of [
    mobile,
    { height: 1024, width: 768 },
    { height: 1000, width: 1440 },
  ]) {
    await page.setViewportSize(viewport);
    for (const route of ["/", pageRoute!]) {
      await gotoRoute(page, route);
      expect(
        await horizontalOverflow(page),
        `${route} at ${viewport.width}px`,
      ).toBe(0);
    }
  }
});

test("homepage sections join with seams and edges", async ({ page }) => {
  await page.goto("/");
  const homepage = page.getByRole("heading", {
    level: 2,
    name: "Neutral sample content for a clean project.",
  });
  if (process.env.PLAYWRIGHT_REQUIRE_SEED) await expect(homepage).toBeVisible();
  else
    test.skip(
      !(await homepage.isVisible()),
      "Starter homepage sample content is not seeded",
    );

  const sections = await page
    .locator("main section.section-scene")
    .evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return {
          top: rect.top + window.scrollY,
          bottom: rect.bottom + window.scrollY,
          paddingTop: parseFloat(style.paddingTop),
          paddingBottom: parseFloat(style.paddingBottom),
          background: style.backgroundColor,
          scaffold: element.hasAttribute("data-scaffold"),
        };
      }),
    );
  expect(sections.length).toBeGreaterThanOrEqual(4);

  const joins = sections.slice(1).map((lower, index) => {
    const upper = sections[index];
    return { upper, lower, match: upper.background === lower.background };
  });
  const seam = joins.find((join) => join.match && !join.lower.scaffold);
  const edge = joins.find((join) => !join.match && !join.lower.scaffold);

  // Seam: both sides contribute half padding. Edge: full padding on both sides.
  expect(seam).toBeDefined();
  expect(edge).toBeDefined();
  expect(seam!.upper.paddingBottom).toBeLessThan(edge!.upper.paddingBottom);
  expect(seam!.lower.paddingTop).toBeLessThan(edge!.lower.paddingTop);
  expect(seam!.lower.top).toBeCloseTo(seam!.upper.bottom, 0);
  expect(edge!.lower.top).toBeCloseTo(edge!.upper.bottom, 0);

  // Seam-joined sections share one band; a themeless Scaffold never joins one.
  const bands = await page.locator("main [data-band]").evaluateAll((elements) =>
    elements.map((element) => ({
      theme: element.getAttribute("data-band"),
      sections: element.querySelectorAll("section.section-scene").length,
      scaffolds: element.querySelectorAll("section[data-scaffold]").length,
    })),
  );
  expect(bands.some((band) => band.sections > 1)).toBe(true);
  for (const band of bands) {
    if (band.scaffolds) expect(band.sections).toBe(band.scaffolds);
  }
});

test("a Scaffold renders its marker on the page and nothing from the archive", async ({
  page,
}) => {
  await page.goto("/");
  const scaffold = page.locator("section[data-scaffold]");
  if (process.env.PLAYWRIGHT_REQUIRE_SEED)
    await expect(scaffold).toHaveCount(1);
  else
    test.skip(
      !(await scaffold.count()),
      "Starter homepage sample content is not seeded",
    );

  await expect(scaffold).toHaveCount(1);
  await expect(scaffold).toContainText("Scaffold:");
  await expect(scaffold).toContainText("Reader quotes");
  await expect(scaffold).toContainText("Proposed shape:");

  await page.goto("/about");
  await expect(page.locator("section[data-scaffold]")).toHaveCount(0);
  await expect(page.getByText("About page intro")).toHaveCount(0);
});

if (process.env.PLAYWRIGHT_REQUIRE_SEED) {
  test("keeps the migrated button destination", async ({ page }) => {
    await page.goto("/about");
    await expect(
      page.getByRole("link", { name: "Migration example link" }),
    ).toHaveAttribute("href", "https://example.com/");
  });
}

test("serves the branded sharing fallback and favicon", async ({ request }) => {
  const card = await request.get("/api/og/default");
  expect(card.ok()).toBe(true);
  expect(card.headers()["content-type"]).toBe("image/png");
  expect([...(await card.body()).subarray(0, 8)]).toEqual([
    137, 80, 78, 71, 13, 10, 26, 10,
  ]);
  const mark = await request.get("/brand/mark.svg");
  expect(mark.ok()).toBe(true);
  expect(mark.headers()["content-type"]).toContain("image/svg+xml");
});
