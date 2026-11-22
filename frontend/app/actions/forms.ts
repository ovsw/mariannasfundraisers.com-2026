"use server";

import { headers } from "next/headers";
import {
  createFormsparkClient,
  createSubmitLimiter,
  type FormMeta,
  submitForm,
} from "@/lib/form-delivery";
import { contactForm } from "@/lib/forms/contact";
import type { FormResult } from "@/lib/forms/fields";
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

export async function sendContactForm(values: unknown, meta: FormMeta): Promise<FormResult> {
  return submitForm(contactForm, values, meta, await visitorKey(), {
    formspark: createFormsparkClient(process.env.FORMSPARK_CONTACT_FORM_ID),
    allow,
  });
}

export async function sendTastingForm(values: unknown, meta: FormMeta): Promise<FormResult> {
  return submitForm(tastingForm, values, meta, await visitorKey(), {
    formspark: createFormsparkClient(process.env.FORMSPARK_TASTING_FORM_ID),
    allow,
  });
}

export async function sendFindASaleForm(values: unknown, meta: FormMeta): Promise<FormResult> {
  return submitForm(findASaleForm, values, meta, await visitorKey(), {
    formspark: createFormsparkClient(process.env.FORMSPARK_FIND_A_SALE_FORM_ID),
    allow,
  });
}
