"use server";

import { headers } from "next/headers";
import {
  createFormsparkClient,
  createSubmitLimiter,
  type FormMeta,
  submitForm,
} from "@/lib/form-delivery";
import { contactForm } from "@/lib/forms/contact";
import type { FormResult, OfficeContact } from "@/lib/forms/fields";
import { findASaleForm } from "@/lib/forms/find-a-sale";
import { tastingForm } from "@/lib/forms/tasting";

// Five sends in ten minutes, across the three forms, is more than one
// visitor needs.
const allow = createSubmitLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

async function visitorKey() {
  const requestHeaders = await headers();
  return (
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown"
  );
}

/** The office phone number and email address from the site settings, or none when they cannot be read. */
async function officeContact(): Promise<OfficeContact> {
  try {
    // Loaded only when a send fails, so the forms' client code never pulls in the Sanity client.
    const { fetchSanitySettings } = await import("@/sanity/lib/fetch");
    const settings = await fetchSanitySettings({ perspective: "published", stega: false });
    return {
      phone: settings?.contact?.phone?.trim() || undefined,
      email: settings?.contact?.email?.trim() || undefined,
    };
  } catch {
    return {};
  }
}

/** A failed send also tells the visitor how to reach the office directly. */
async function withContact(result: FormResult): Promise<FormResult> {
  return result.status === "failed" ? { status: "failed", contact: await officeContact() } : result;
}

export async function sendContactForm(values: unknown, meta: FormMeta): Promise<FormResult> {
  return withContact(await submitForm(contactForm, values, meta, await visitorKey(), {
    formspark: createFormsparkClient(process.env.FORMSPARK_CONTACT_FORM_ID),
    allow,
  }));
}

export async function sendTastingForm(values: unknown, meta: FormMeta): Promise<FormResult> {
  return withContact(await submitForm(tastingForm, values, meta, await visitorKey(), {
    formspark: createFormsparkClient(process.env.FORMSPARK_TASTING_FORM_ID),
    allow,
  }));
}

export async function sendFindASaleForm(values: unknown, meta: FormMeta): Promise<FormResult> {
  return withContact(await submitForm(findASaleForm, values, meta, await visitorKey(), {
    formspark: createFormsparkClient(process.env.FORMSPARK_FIND_A_SALE_FORM_ID),
    allow,
  }));
}
