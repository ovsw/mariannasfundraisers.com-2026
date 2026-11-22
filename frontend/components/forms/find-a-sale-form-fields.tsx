"use client";

import { sendFindASaleForm } from "@/app/actions/forms";
import { Form } from "@/components/ui/form";
import { FIND_A_SALE_THANKS, type FindASaleValues, findASaleSchema } from "@/lib/forms/find-a-sale";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  FormFailed,
  formPanelClass,
  FormThanks,
  Honeypot,
  NameFields,
  SubmitButton,
  TextField,
  useFormSender,
} from "./form-parts";

const defaultValues: FindASaleValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  hometown: "",
};

/** The find a sale form; the server checks the same rules (lib/forms/find-a-sale.ts). */
export function FindASaleFormFields() {
  const form = useForm<FindASaleValues>({ resolver: zodResolver(findASaleSchema), defaultValues });
  const { attempt, honeypotRef, onSubmit, pending, result } = useFormSender(form, sendFindASaleForm);

  if (result.status === "sent") return <FormThanks>{FIND_A_SALE_THANKS}</FormThanks>;

  return (
    <Form {...form}>
      <form aria-label="Find a sale form" className={formPanelClass} noValidate onSubmit={onSubmit}>
        <NameFields form={form} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField autoComplete="email" form={form} label="Email" name="email" required type="email" />
          <TextField autoComplete="tel" form={form} label="Phone" name="phone" type="tel" />
        </div>
        <TextField autoComplete="address-level2" form={form} label="Hometown" name="hometown" required />
        <Honeypot inputRef={honeypotRef} />
        {result.status === "failed" ? <FormFailed key={attempt} /> : null}
        <SubmitButton pending={pending} />
      </form>
    </Form>
  );
}
