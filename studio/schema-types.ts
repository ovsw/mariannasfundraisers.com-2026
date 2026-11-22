// documents
import page from "./schemas/documents/page";
import post from "./schemas/documents/post";
import author from "./schemas/documents/author";
import faq from "./schemas/documents/faq";
import testimonial from "./schemas/documents/testimonial";
import navigation, {
  navigationSchemaTypes,
} from "./schemas/documents/navigation";
import settings, { settingsSchemaTypes } from "./schemas/documents/settings";
import teamMember from "./schemas/documents/team-member";
import blogIndex from "./schemas/documents/blog-index";
import blogPostSettings from "./schemas/documents/blog-post-settings";
import homePage from "./schemas/documents/home-page";
import footer, { footerSchemaTypes } from "./schemas/documents/footer";
import redirect from "./schemas/documents/redirect";
import product, {
  nutritionFacts,
  productMenuCard,
} from "./schemas/documents/product";
import productPageSettings, {
  productCallToAction,
  productHandmadeBlock,
  productKindLinks,
} from "./schemas/documents/product-page-settings";

// Schema UI shared objects
import blockContent from "./schemas/blocks/shared/block-content";
import link from "./schemas/blocks/shared/link";
import { colorVariant } from "./schemas/blocks/shared/color-variant";
import sectionPadding from "./schemas/blocks/shared/section-padding";
import customUrl from "./schemas/blocks/shared/custom-url";
import customLink from "./schemas/blocks/shared/custom-link";
import button from "./schemas/blocks/shared/button";
import buttonLink from "./schemas/blocks/shared/button-link";
import richTextContent from "./schemas/blocks/shared/rich-text-content";
import simpleRichText from "./schemas/blocks/shared/simple-rich-text";
import { iconListItem } from "./schemas/blocks/shared/image-and-text";
import {
  blogPostSidebar,
  blogPostSidebarAction,
} from "./schemas/blocks/shared/blog-post-sidebar";
// Schema UI objects
import richTextBlock from "./schemas/blocks/rich-text-block";
import scaffold from "./schemas/blocks/scaffold";
import pageBanner from "./schemas/blocks/page-banner";
import pageHeading from "./schemas/blocks/page-heading";
import photoLeftAndText from "./schemas/blocks/photo-left-and-text";
import photoRightAndText from "./schemas/blocks/photo-right-and-text";
import boxedPhotoLeftAndText from "./schemas/blocks/boxed-photo-left-and-text";
import boxedPhotoRightAndText from "./schemas/blocks/boxed-photo-right-and-text";
import cutoutLeftAndText from "./schemas/blocks/cutout-left-and-text";
import cutoutRightAndText from "./schemas/blocks/cutout-right-and-text";
import badgeAndText from "./schemas/blocks/badge-and-text";
import videoLeftAndText from "./schemas/blocks/video-left-and-text";
import videoRightAndText from "./schemas/blocks/video-right-and-text";
import boxedVideoLeftAndText from "./schemas/blocks/boxed-video-left-and-text";
import boxedVideoRightAndText from "./schemas/blocks/boxed-video-right-and-text";
import imageAndIconList from "./schemas/blocks/image-and-icon-list";
import latestNews from "./schemas/blocks/latest-news";
import contactForm from "./schemas/blocks/contact-form";
import tastingForm from "./schemas/blocks/tasting-form";
import findASaleForm from "./schemas/blocks/find-a-sale-form";
import faqList from "./schemas/blocks/faq-list";
import twoTextColumns from "./schemas/blocks/two-text-columns";
import hoagieMenu from "./schemas/blocks/hoagie-menu";
import pizzaMenu from "./schemas/blocks/pizza-menu";
import salsaMenu from "./schemas/blocks/salsa-menu";
import homeHero from "./schemas/blocks/home-hero";
import steps, { stepItem } from "./schemas/blocks/steps";
import menuTeaser, { menuTeaserItem } from "./schemas/blocks/menu-teaser";
import callToActionWithImage from "./schemas/blocks/call-to-action-with-image";
import testimonials from "./schemas/blocks/testimonials";
// page-builder-generator:block-imports

export const schemaTypes = [
  // documents
  page,
  post,
  author,
  faq,
  testimonial,
  navigation,
  ...navigationSchemaTypes,
  settings,
  ...settingsSchemaTypes,
  teamMember,
  blogIndex,
  blogPostSettings,
  homePage,
  footer,
  redirect,
  ...footerSchemaTypes,
  product,
  nutritionFacts,
  productMenuCard,
  productPageSettings,
  productHandmadeBlock,
  productCallToAction,
  productKindLinks,
  // shared objects
  blockContent,
  link,
  colorVariant,
  sectionPadding,
  customUrl,
  customLink,
  button,
  buttonLink,
  richTextContent,
  simpleRichText,
  iconListItem,
  stepItem,
  menuTeaserItem,
  blogPostSidebarAction,
  blogPostSidebar,
  // blocks
  richTextBlock,
  scaffold,
  pageBanner,
  pageHeading,
  photoLeftAndText,
  photoRightAndText,
  boxedPhotoLeftAndText,
  boxedPhotoRightAndText,
  cutoutLeftAndText,
  cutoutRightAndText,
  badgeAndText,
  videoLeftAndText,
  videoRightAndText,
  boxedVideoLeftAndText,
  boxedVideoRightAndText,
  imageAndIconList,
  latestNews,
  contactForm,
  tastingForm,
  findASaleForm,
  faqList,
  twoTextColumns,
  hoagieMenu,
  pizzaMenu,
  salsaMenu,
  homeHero,
  steps,
  menuTeaser,
  callToActionWithImage,
  testimonials,
  // page-builder-generator:block-types
];
