// The product page template (spec decision 8): one design in code for every
// product. Hero with the two buttons of the product's kind, ingredients, the
// optional note, nutrition facts, then the two blocks that are the same on
// every product page (Product Page Settings). It is not a Page Builder page,
// so it resolves its own section joins and brushed edges with the same rules.
import type { PortableTextProps } from "@portabletext/react";
import { createDataAttribute, stegaClean } from "next-sanity";
import Image from "next/image";
import type { ReactNode } from "react";
import BreadcrumbJsonLd from "@/components/breadcrumb-json-ld";
import { ImageAndText, type ImageAndTextProps } from "@/components/blocks/image-and-text";
import {
  resolveSectionBoundaries,
  sectionSceneClassName,
  type ResolvedSectionBoundary,
  type SectionTheme,
} from "@/components/blocks/section-boundaries";
import { resolveSectionBrushes, SectionBrush } from "@/components/blocks/section-brush";
import RichTextContent from "@/components/rich-text-content";
import { SiteButton, hasSiteButtonContent } from "@/components/site-button";
import { siteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";
import { dataset, projectId } from "@/sanity/lib/env";
import { urlFor } from "@/sanity/lib/image";
import { hasVisibleRichText, ingredientsListHref, kindLinks, type Product } from "./model";
import { NutritionLabel } from "./nutrition-label";

type DataAttribute = (path: string) => string | undefined;

function dataAttributeFor(stega: boolean, id: string | undefined, type: string): DataAttribute {
  return (path) =>
    stega && id
      ? createDataAttribute({
          baseUrl: process.env.NEXT_PUBLIC_STUDIO_URL || "http://localhost:3333",
          dataset,
          id,
          path,
          projectId,
          type,
        }).toString()
      : undefined;
}

type Section = {
  key: string;
  /** Null for the hero, which joins every neighbour at an edge. */
  theme: SectionTheme | null;
  render: (boundary: ResolvedSectionBoundary) => ReactNode;
};

const richText = (value: unknown) => value as PortableTextProps["value"];

function ProductHero({ product, edit }: { product: Product; edit: DataAttribute }) {
  const { heroButtons } = kindLinks(product.settings, product.kind);
  const buttons = heroButtons.filter(hasSiteButtonContent);
  const asset = product.heroImage?.asset;
  return (
    <section className="product-hero section-scene-muslin relative isolate overflow-hidden text-foreground">
      <div className="container grid items-center gap-10 py-12 md:py-16 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:py-0">
        <div className="max-w-xl space-y-8 lg:py-20">
          <h1
            className="text-4xl leading-tight font-extrabold tracking-tight text-emphasis sm:text-5xl md:text-6xl"
            data-sanity={edit("heroTitle")}
          >
            {product.heroTitle}
          </h1>
          {hasVisibleRichText(product.heroText) ? (
            <RichTextContent
              className="prose-lg md:prose-xl"
              dataSanity={edit("heroText")}
              value={richText(product.heroText)}
            />
          ) : null}
          {buttons.length ? (
            <div className="flex flex-wrap gap-4">
              {buttons.map((button) => (
                <SiteButton button={button} className="max-w-full whitespace-normal" key={button._key} />
              ))}
            </div>
          ) : null}
        </div>
        {asset?.url ? (
          <div className="relative aspect-[16/9] w-full lg:aspect-auto lg:h-[min(40rem,45vw)]">
            <Image
              alt={stegaClean(product.heroImage?.alt)?.trim() || ""}
              blurDataURL={asset.metadata?.lqip || undefined}
              className="object-contain lg:object-right"
              data-sanity={edit("heroImage")}
              fill
              placeholder={asset.metadata?.lqip ? "blur" : undefined}
              preload
              sizes="(min-width: 1024px) 60vw, 100vw"
              src={urlFor({ asset }).width(1800).fit("max").url()}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function NoteSection({
  boundary,
  product,
  edit,
}: {
  boundary: ResolvedSectionBoundary;
  product: Product;
  edit: DataAttribute;
}) {
  return (
    <section className={sectionSceneClassName("light", boundary.top, boundary.bottom)}>
      <div className="container">
        <RichTextContent
          className="prose-lg mx-auto max-w-3xl"
          dataSanity={edit("note")}
          value={richText(product.note)}
        />
      </div>
    </section>
  );
}

function NutritionSection({
  boundary,
  product,
  edit,
}: {
  boundary: ResolvedSectionBoundary;
  product: Product;
  edit: DataAttribute;
}) {
  const facts = product.nutritionFacts;
  if (!facts) return null;
  const headingId = "nutrition-facts-title";
  return (
    <section
      aria-labelledby={headingId}
      className={sectionSceneClassName("shaded", boundary.top, boundary.bottom)}
    >
      <div className="container grid items-start gap-split lg:grid-cols-2">
        <div className="mx-auto w-full max-w-prose space-y-8 lg:mx-0 lg:max-w-lg">
          <h2 className="text-emphasis" id={headingId}>
            <span
              className="block font-condensed text-[2.25rem] leading-none font-bold text-link italic md:text-[2.625rem]"
              data-sanity={edit("name")}
            >
              {product.name}
            </span>
            <span className="block text-[2.875rem] leading-none font-bold md:text-[3.8125rem]">
              Nutrition Facts
            </span>
          </h2>
          {hasVisibleRichText(facts.servingText) ? (
            <RichTextContent
              className="prose-lg"
              dataSanity={edit("nutritionFacts.servingText")}
              value={richText(facts.servingText)}
            />
          ) : null}
        </div>
        <div className="lg:pt-8">
          <NutritionLabel dataSanity={edit("nutritionFacts")} values={facts} />
        </div>
      </div>
    </section>
  );
}

function CallToAction({
  boundary,
  block,
  edit,
}: {
  boundary: ResolvedSectionBoundary;
  block: NonNullable<NonNullable<Product["settings"]>["callToAction"]>;
  edit: DataAttribute;
}) {
  const buttons = (block.buttons ?? []).filter(hasSiteButtonContent);
  const asset = block.image?.asset;
  const headingId = "product-call-to-action-title";
  return (
    <section
      aria-labelledby={headingId}
      className={cn(sectionSceneClassName("muslin", boundary.top, boundary.bottom), "overflow-hidden")}
    >
      <div className="container grid items-center gap-10 lg:grid-cols-2">
        <div className="max-w-xl space-y-6">
          <h2
            className="text-4xl leading-tight font-bold text-emphasis md:text-5xl"
            data-sanity={edit("callToAction.title")}
            id={headingId}
          >
            {block.title}
          </h2>
          {hasVisibleRichText(block.richText) ? (
            <RichTextContent
              className="prose-lg"
              dataSanity={edit("callToAction.richText")}
              value={richText(block.richText)}
            />
          ) : null}
          {buttons.length ? (
            <div className="flex flex-wrap gap-4 pt-2" data-sanity={edit("callToAction.buttons")}>
              {buttons.map((button) => (
                <SiteButton button={button} className="max-w-full whitespace-normal" key={button._key} />
              ))}
            </div>
          ) : null}
        </div>
        {asset?.url ? (
          <div className="relative mx-auto aspect-square w-full max-w-md lg:mr-0">
            <Image
              alt={stegaClean(block.image?.alt)?.trim() || ""}
              className="object-contain object-bottom"
              data-sanity={edit("callToAction.image")}
              fill
              sizes="(min-width: 1024px) 28rem, 100vw"
              src={urlFor({ asset }).width(900).fit("max").url()}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** The image-and-text renderer, fed by product fields under the names it reads. */
function imageAndTextBlock(
  block: Record<string, unknown>,
  boundary: ResolvedSectionBoundary,
  dataAttribute: DataAttribute,
) {
  return { ...block, ...boundary, dataAttribute } as unknown as ImageAndTextProps<
    "badgeAndText" | "photoLeftAndText"
  >;
}

export function ProductPage({ product, stega }: { product: Product; stega: boolean }) {
  const settings = product.settings;
  const editProduct = dataAttributeFor(stega, product._id, "product");
  const editSettings = dataAttributeFor(stega, settings?._id, "productPageSettings");
  const { ingredientsListButton } = kindLinks(settings, product.kind);
  const ingredientsButton = ingredientsListButton
    ? { ...ingredientsListButton, href: ingredientsListHref(ingredientsListButton.href, product.name) }
    : null;
  const ingredientsPaths: Record<string, string> = {
    eyebrow: "ingredientsLabel",
    richText: "ingredientsText",
    image: "ingredientsImage",
  };
  const handmade = settings?.handmade;
  const callToAction = settings?.callToAction;

  const sections: Section[] = [
    { key: "hero", theme: null, render: () => <ProductHero edit={editProduct} product={product} /> },
    {
      key: "ingredients",
      theme: "light",
      render: (boundary) => (
        <ImageAndText
          block={imageAndTextBlock(
            {
              _key: "ingredients",
              _type: "badgeAndText",
              theme: "light",
              eyebrow: product.ingredientsLabel,
              title: "Ingredients",
              anchorId: null,
              richText: product.ingredientsText,
              buttons: ingredientsButton ? [ingredientsButton] : [],
              image: product.ingredientsImage,
            },
            boundary,
            (path) => (ingredientsPaths[path] ? editProduct(ingredientsPaths[path]) : undefined),
          )}
          design={{ media: "badge", side: "right" }}
        />
      ),
    },
  ];
  if (hasVisibleRichText(product.note)) {
    sections.push({
      key: "note",
      theme: "light",
      render: (boundary) => <NoteSection boundary={boundary} edit={editProduct} product={product} />,
    });
  }
  if (product.nutritionFacts) {
    sections.push({
      key: "nutrition",
      theme: "shaded",
      render: (boundary) => <NutritionSection boundary={boundary} edit={editProduct} product={product} />,
    });
  }
  if (handmade?.image?.asset?.url && stegaClean(handmade.title)?.trim()) {
    sections.push({
      key: "handmade",
      theme: "light",
      render: (boundary) => (
        <ImageAndText
          block={imageAndTextBlock(
            { _key: "handmade", _type: "photoLeftAndText", theme: "light", anchorId: null, ...handmade },
            boundary,
            (path) => (path === "theme" ? undefined : editSettings(`handmade.${path}`)),
          )}
          design={{ media: "photo", side: "left" }}
        />
      ),
    });
  }
  if (callToAction && stegaClean(callToAction.title)?.trim()) {
    sections.push({
      key: "callToAction",
      theme: "muslin",
      render: (boundary) => <CallToAction block={callToAction} boundary={boundary} edit={editSettings} />,
    });
  }

  const boundaries = resolveSectionBoundaries(sections);
  const brushes = resolveSectionBrushes(sections);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: product.name || product.heroTitle || "Product", path: product.path || "/" },
        ]}
        siteUrl={siteUrl}
      />
      {sections.map((section, index) => {
        const boundary = boundaries[index];
        const brush = brushes[index];
        const brushTheme = boundary.theme;
        return (
          <div className={brushTheme && (brush.top || brush.bottom) ? "relative" : undefined} key={section.key}>
            {section.render(boundary)}
            {brushTheme && brush.top ? <SectionBrush edge="top" theme={brushTheme} /> : null}
            {brushTheme && brush.bottom ? <SectionBrush edge="bottom" theme={brushTheme} /> : null}
          </div>
        );
      })}
    </>
  );
}
