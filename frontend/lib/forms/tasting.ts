import { z } from "zod";
import {
  addressFields,
  addressLine,
  EMAIL_FROM,
  emailField,
  type EntryMeta,
  type FormDefinition,
  formatUsPhone,
  fullName,
  metaFields,
  nameFields,
  requiredPhone,
  requiredText,
  zipField,
} from "./fields";

/** The free tasting form (old Cognito form 168, on schedule-a-free-tasting). */

export const TASTING_THANKS =
  "Thank you for contacting us with your Free Tasting request! We'll be in touch ASAP to discuss the date and time.";

export const tastingSchema = z.object({
  ...nameFields,
  email: emailField,
  phone: requiredPhone,
  groupName: requiredText("Enter your group name."),
  attendees: requiredText("Enter the number of attendees.", 6).refine(
    (value) => /^\d+$/.test(value) && Number(value) >= 1,
    "Enter a whole number, 1 or more.",
  ),
  ...addressFields,
  zip: zipField,
  newsletter: z.boolean(),
});

export type TastingValues = z.infer<typeof tastingSchema>;

export function tastingPayload(values: TastingValues, meta: EntryMeta) {
  return {
    name: fullName(values),
    first_name: values.firstName.trim(),
    email: values.email,
    phone: formatUsPhone(values.phone),
    group_name: values.groupName,
    attendees: String(Number(values.attendees)),
    address: addressLine(values),
    newsletter: values.newsletter ? "Yes" : "No",
    ...metaFields(meta),
    _email: {
      subject: `Free tasting request: ${values.groupName}`,
      from: EMAIL_FROM,
    },
  };
}

export const tastingForm: FormDefinition<TastingValues> = {
  name: "Free tasting form",
  schema: tastingSchema,
  payload: tastingPayload,
};
