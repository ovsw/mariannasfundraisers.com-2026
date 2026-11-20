import { ProductPage } from "@/components/product/product-page";
import { RootContentView } from "@/components/root-content";
import {
  isReservedPagePath,
  isRouteSlug,
  pagePath,
  productRoute,
} from "@/lib/routes";
import {
  fetchSanityPageBySlug,
  fetchSanityProduct,
  PAGES_SLUGS_QUERY,
  PRODUCTS_SLUGS_QUERY,
} from "@/sanity/lib/fetch";
import {
  getDynamicFetchOptions,
  sanityFetchMetadata,
  sanityFetchStaticParams,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { generatePageMetadata } from "@/sanity/lib/metadata";
import { PAGE_QUERY } from "@/sanity/queries/page";
import { PRODUCT_QUERY } from "@/sanity/queries/product";
import type {
  PAGE_QUERY_RESULT,
  PAGES_SLUGS_QUERY_RESULT,
  PRODUCT_QUERY_RESULT,
  PRODUCTS_SLUGS_QUERY_RESULT,
} from "@/sanity.types";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

export const instant = false;

function readPageSlug(segments: string[]) {
  if (!segments.length || !segments.every(isRouteSlug)) return null;
  const slug = segments.join("/");
  const path = pagePath(slug);
  return path && !isReservedPagePath(path) ? slug : null;
}

export async function generateStaticParams() {
  const [{ data: pages }, { data: products }] = (await Promise.all([
    sanityFetchStaticParams({ query: PAGES_SLUGS_QUERY }),
    sanityFetchStaticParams({ query: PRODUCTS_SLUGS_QUERY }),
  ])) as [{ data: PAGES_SLUGS_QUERY_RESULT }, { data: PRODUCTS_SLUGS_QUERY_RESULT }];

  const pageParams = pages.flatMap((page) => {
    const slug = page.slug?.current?.replace(/^\/+|\/+$/g, "");
    const segments = slug?.split("/") ?? [];
    return slug && readPageSlug(segments) ? [{ slug: segments }] : [];
  });
  // Products live under /products and /flavored-salsas (spec decision 8). The
  // slug rule keeps a product and a page from sharing an address.
  const productParams = products.flatMap((product) => {
    const segments = product.path?.split("/").filter(Boolean) ?? [];
    return productRoute(product.path) && readPageSlug(segments) ? [{ slug: segments }] : [];
  });
  return [...pageParams, ...productParams];
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug: segments } = await props.params;
  const slug = readPageSlug(segments);
  if (!slug) return {};
  const path = pagePath(slug);
  if (!path) return {};

  const { data: page } = (await sanityFetchMetadata({
    query: PAGE_QUERY,
    params: { slug },
    perspective: "published",
  })) as { data: PAGE_QUERY_RESULT };
  // The page renderer owns 404s. Metadata only sees published content, so a
  // 404 here would prevent draft-only routes from reaching Presentation.
  if (page) return generatePageMetadata({ page, path });

  const route = productRoute(path);
  if (!route) return {};
  const { data: product } = (await sanityFetchMetadata({
    query: PRODUCT_QUERY,
    params: { kinds: [...route.kinds], slug: route.slug },
    perspective: "published",
  })) as { data: PRODUCT_QUERY_RESULT };
  return product ? generatePageMetadata({ page: product, path }) : {};
}

export default async function PageRoute(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const { isEnabled: isDraftMode } = await draftMode();
  if (isDraftMode) return <DynamicPage params={props.params} />;

  const { slug: segments } = await props.params;
  const slug = readPageSlug(segments);
  if (!slug) notFound();
  return <CachedPage slug={slug} perspective="published" stega={false} />;
}

async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const [{ slug: segments }, options] = await Promise.all([
    params,
    getDynamicFetchOptions(),
  ]);
  const slug = readPageSlug(segments);
  if (!slug) notFound();
  return <CachedPage slug={slug} {...options} />;
}

async function CachedPage({
  slug,
  perspective,
  stega,
}: { slug: string } & DynamicFetchOptions) {
  const page = await fetchSanityPageBySlug({ slug, perspective, stega });
  if (page) {
    return (
      <RootContentView
        content={page}
        perspective={perspective}
        stega={stega}
      />
    );
  }

  // A page owns its address first; otherwise /products/<slug> and
  // /flavored-salsas/<slug> can be a product.
  const route = productRoute(`/${slug}`);
  if (!route) notFound();
  const product = await fetchSanityProduct({ ...route, perspective, stega });
  if (!product) notFound();
  return <ProductPage product={product} stega={stega} />;
}
