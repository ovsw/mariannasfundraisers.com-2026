import { z } from "zod";
import {
  EMAIL_FROM,
  emailField,
  type EntryMeta,
  type FormDefinition,
  formatUsPhone,
  fullName,
  metaFields,
  nameFields,
  optionalPhone,
  orEmpty,
  requiredText,
} from "./fields";

/** The find a sale form (old Cognito form 173, on find-a-sale). */

export const FIND_A_SALE_THANKS =
  "Thank you for contacting us! Someone from Marianna's Fundraisers will respond to you shortly with information about current and upcoming fundraisers.";

export const findASaleSchema = z.object({
  ...nameFields,
  email: emailField,
  phone: optionalPhone,
  hometown: requiredText("Enter your hometown."),
});

export type FindASaleValues = z.infer<typeof findASaleSchema>;

export function findASalePayload(values: FindASaleValues, meta: EntryMeta) {
  const name = fullName(values);
  return {
    name,
    first_name: values.firstName.trim(),
    email: values.email,
    phone: values.phone ? formatUsPhone(values.phone) : orEmpty(values.phone),
    hometown: values.hometown,
    ...metaFields(meta),
    _email: {
      subject: `Find a sale: ${name}, ${values.hometown}`,
      from: EMAIL_FROM,
    },
  };
}

export const findASaleForm: FormDefinition<FindASaleValues> = {
  name: "Find a sale form",
  schema: findASaleSchema,
  payload: findASalePayload,
};
