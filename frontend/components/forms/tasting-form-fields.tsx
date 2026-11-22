"use client";

import { sendTastingForm } from "@/app/actions/forms";
import { Form } from "@/components/ui/form";
import { TASTING_THANKS, type TastingValues, tastingSchema } from "@/lib/forms/tasting";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  AddressFields,
  FormFailed,
  formPanelClass,
  FormThanks,
  Honeypot,
  NameFields,
  NewsletterField,
  SubmitButton,
  TextField,
  useFormSender,
} from "./form-parts";

const defaultValues: TastingValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  groupName: "",
  attendees: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zip: "",
  newsletter: false,
};

/** The free tasting form; the server checks the same rules (lib/forms/tasting.ts). */
export function TastingFormFields() {
  const form = useForm<TastingValues>({ resolver: zodResolver(tastingSchema), defaultValues });
  const { attempt, honeypotRef, onSubmit, pending, result } = useFormSender(form, sendTastingForm);

  if (result.status === "sent") return <FormThanks>{TASTING_THANKS}</FormThanks>;

  return (
    <Form {...form}>
      <form aria-label="Free tasting form" className={formPanelClass} noValidate onSubmit={onSubmit}>
        <NameFields form={form} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField autoComplete="email" form={form} label="Email" name="email" required type="email" />
          <TextField autoComplete="tel" form={form} label="Phone" name="phone" required type="tel" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField autoComplete="organization" form={form} label="Group Name" name="groupName" required />
          <TextField form={form} inputMode="numeric" label="No. of attendees" name="attendees" required />
        </div>
        <AddressFields form={form} label="Address (we'll come to you)" />
        <NewsletterField form={form} />
        <Honeypot inputRef={honeypotRef} />
        {result.status === "failed" ? <FormFailed key={attempt} /> : null}
        <SubmitButton pending={pending} />
      </form>
    </Form>
  );
}
