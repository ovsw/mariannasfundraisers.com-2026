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
import CallToActionWithImage, {
  hasCallToActionWithImageContent,
  type CallToActionWithImageProps,
} from "@/components/blocks/call-to-action-with-image";
import { ImageAndText, savedCrop, type ImageAndTextProps } from "@/components/blocks/image-and-text";
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

// A section's resolved edges without its `key`: renderers spread this into
// their props, and React takes a key only when it is written on the element.
type SceneBoundary = Omit<ResolvedSectionBoundary, "key">;

type Section = {
  key: string;
  /** Null for the hero, which joins every neighbour at an edge. */
  theme: SectionTheme | null;
  straightTop?: boolean;
  straightBottom?: boolean;
  /** Margin below the section (page background), as the old site spaced its product sections. */
  spaceAfter?: string;
  render: (boundary: SceneBoundary) => ReactNode;
};

const richText = (value: unknown) => value as PortableTextProps["value"];

function ProductHero({ product, edit }: { product: Product; edit: DataAttribute }) {
  const { heroButtons } = kindLinks(product.settings, product.kind);
  const buttons = heroButtons.filter(hasSiteButtonContent);
  const asset = product.heroImage?.asset;
  const crop = savedCrop(product.heroImage?.crop);
  // The photo keeps its own proportions; a saved crop changes them.
  const dimensions = asset?.metadata?.dimensions;
  const naturalWidth = dimensions?.width ?? 2407;
  const naturalHeight = dimensions?.height ?? 1080;
  const photoWidth = Math.round(naturalWidth * (crop ? 1 - crop.left - crop.right : 1));
  const photoHeight = Math.round(naturalHeight * (crop ? 1 - crop.top - crop.bottom : 1));
  return (
    // The old site's design: a black band with the dark table photo behind the
    // text. From the lg breakpoint the text sits in a column at the page's
    // left edge (5rem in, 4rem from xl), centred top to bottom, and the
    // product photo fills the other 69% of the width at 1400px wide (1800px
    // from xl), running off the right edge, so the photo's height sets the
    // band's height. When the window is too narrow for both, the text column
    // keeps the width of its button row and the photo is cut on the right.
    // Below lg the text comes first, on black with the table photo at its
    // foot, and the photo follows at full width; on phones the buttons fill
    // the width.
    <section className="product-hero section-scene-muslin relative isolate overflow-hidden text-foreground max-lg:bg-none! lg:flex">
      <div className="relative z-10 bg-(image:--product-hero-image) bg-size-[100%_auto] bg-bottom bg-no-repeat pb-8 sm:pb-16 md:pb-20 lg:flex lg:items-center lg:bg-cover lg:bg-right-bottom lg:pb-0">
        <div className="mx-auto mt-10 max-w-xl px-4 sm:mt-12 sm:px-6 sm:text-center md:mt-16 lg:mt-0 lg:pr-0 lg:pl-20 lg:text-left xl:pl-16">
          <h1
            className="text-4xl font-extrabold tracking-tight text-emphasis sm:text-5xl md:text-6xl"
            data-sanity={edit("heroTitle")}
          >
            {product.heroTitle}
          </h1>
          {hasVisibleRichText(product.heroText) ? (
            <RichTextContent
              className="mt-8 text-base! sm:mx-auto sm:mt-5 sm:text-lg! md:mt-10 md:text-xl! lg:mx-0"
              dataSanity={edit("heroText")}
              value={richText(product.heroText)}
            />
          ) : null}
          {buttons.length ? (
            <div className="mt-8 flex flex-col gap-4 sm:mt-10 sm:flex-row sm:justify-center sm:gap-5 lg:justify-start">
              {buttons.map((button) => (
                <SiteButton
                  button={button}
                  className="max-w-full justify-center whitespace-normal sm:whitespace-nowrap"
                  key={button._key}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {asset?.url ? (
        <div className="relative z-20 lg:w-[69%] lg:shrink-0">
          <Image
            alt={stegaClean(product.heroImage?.alt)?.trim() || ""}
            blurDataURL={asset.metadata?.lqip || undefined}
            className="h-auto w-full max-w-none lg:w-[1400px] xl:w-[1800px]"
            data-sanity={edit("heroImage")}
            height={photoHeight}
            placeholder={asset.metadata?.lqip ? "blur" : undefined}
            preload
            sizes="(min-width: 1280px) 1800px, (min-width: 1024px) 1400px, 100vw"
            src={urlFor({ asset, crop }).width(1800).fit("max").url()}
            width={photoWidth}
          />
        </div>
      ) : null}
    </section>
  );
}

function NoteSection({
  boundary,
  product,
  edit,
}: {
  boundary: SceneBoundary;
  product: Product;
  edit: DataAttribute;
}) {
  return (
    // The old site showed the note under the ingredients, in their section:
    // one centred column of 65 characters, its text at 20px from xl.
    <section
      className={cn(
        sectionSceneClassName("light", boundary.top, boundary.bottom),
        boundary.bottom !== "seam" && "sm:pb-36!",
      )}
    >
      <div className="container">
        <RichTextContent
          className="prose-base mx-auto max-w-[65ch] xl:prose-xl"
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
  boundary: SceneBoundary;
  product: Product;
  edit: DataAttribute;
}) {
  const facts = product.nutritionFacts;
  if (!facts) return null;
  const headingId = "nutrition-facts-title";
  return (
    // The old site's design: 9rem above and below (2.5rem and 5rem on phones),
    // two equal columns 3.5rem apart from md, the text at 20px from xl and the
    // label centred in its column.
    <section
      aria-labelledby={headingId}
      className={cn(
        sectionSceneClassName("shaded", boundary.top, boundary.bottom),
        boundary.top !== "seam" && "pt-10! sm:pt-36!",
        boundary.bottom !== "seam" && "pb-20! sm:pb-36!",
      )}
    >
      <div className="container flex flex-col gap-6 md:flex-row md:gap-14">
        <div className="w-full space-y-10 md:w-1/2">
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
              className="prose-base xl:prose-xl"
              dataSanity={edit("nutritionFacts.servingText")}
              value={richText(facts.servingText)}
            />
          ) : null}
        </div>
        <div className="w-full md:w-1/2 lg:pt-8">
          <NutritionLabel dataSanity={edit("nutritionFacts")} values={facts} />
        </div>
      </div>
    </section>
  );
}

/** The image-and-text renderer, fed by product fields under the names it reads. */
function imageAndTextBlock(
  block: Record<string, unknown>,
  boundary: SceneBoundary,
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
  if (callToAction && hasCallToActionWithImageContent(callToAction)) {
    sections.push({
      key: "callToAction",
      theme: "muslin",
      straightTop: true,
      straightBottom: true,
      render: (boundary) => (
        <CallToActionWithImage
          {...({
            _key: "callToAction",
            _type: "callToActionWithImage",
            ...callToAction,
            ...boundary,
            theme: "muslin",
            dataAttribute: (path: string) =>
              path === "theme" ? undefined : editSettings(`callToAction.${path}`),
          } as unknown as CallToActionWithImageProps)}
        />
      ),
    });
  }

  // The old site's white space above the nutrition facts: the ingredients
  // section padded 5rem below (2.5rem on phones) and left 5rem (2.5rem) of
  // page background under it, 10rem (5rem) in all. The image-and-text section
  // already pads 9rem (5rem) below, so 1rem (none) is added. The note ends
  // with its own 9rem, so it takes the full 5rem (2.5rem). Below the nutrition
  // facts the old site left 1rem before the next section.
  const nutritionIndex = sections.findIndex((section) => section.key === "nutrition");
  if (nutritionIndex > 0) {
    sections[nutritionIndex - 1].spaceAfter =
      sections[nutritionIndex - 1].key === "note" ? "mb-10 sm:mb-20" : "sm:mb-4";
    if (nutritionIndex < sections.length - 1) sections[nutritionIndex].spaceAfter = "mb-4";
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
        const { theme, top, bottom } = boundaries[index];
        const boundary: SceneBoundary = { theme, top, bottom };
        const brush = brushes[index];
        const brushTheme = boundary.theme;
        return (
          <div
            className={cn(brushTheme && (brush.top || brush.bottom) && "relative", section.spaceAfter) || undefined}
            key={section.key}
          >
            {section.render(boundary)}
            {brushTheme && brush.top ? <SectionBrush edge="top" theme={brushTheme} /> : null}
            {brushTheme && brush.bottom ? <SectionBrush edge="bottom" theme={brushTheme} /> : null}
          </div>
        );
      })}
    </>
  );
}
