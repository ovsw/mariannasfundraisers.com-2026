import { contactFormEmails } from "./contact-form.ts";
import { findASaleFormEmails } from "./find-a-sale-form.ts";
import type { FormEmails } from "./layout.ts";
import { tastingFormEmails } from "./tasting-form.ts";

/** Every form's emails, in the order `pnpm form-emails` previews and pushes them. */
export const formEmails: FormEmails[] = [contactFormEmails, tastingFormEmails, findASaleFormEmails];

export type { FormEmails } from "./layout.ts";
