"use client";

import { sendContactForm } from "@/app/actions/forms";
import { Form } from "@/components/ui/form";
import {
  CONTACT_THANKS,
  CONTACT_TOPICS,
  type ContactValues,
  contactSchema,
  contactSections,
  CUSTOMER_TYPES,
  GROUP_NAME_HELP,
} from "@/lib/forms/contact";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  AddressFields,
  FormFailed,
  formPanelClass,
  FormThanks,
  HeardAboutField,
  Honeypot,
  NameFields,
  NewsletterField,
  RadioField,
  SubmitButton,
  TextField,
  useFormSender,
} from "./form-parts";

const defaultValues: Partial<ContactValues> = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  groupName: "",
  newsletter: false,
  deliveryTimeline: "",
  orderForms: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zip: "",
  heardAbout: [],
  comments: "",
  discuss: "",
};

/**
 * The contact form. The fields under the topic follow the chosen topic; the
 * server checks the same rules (lib/forms/contact.ts) and sends only the
 * fields shown for it.
 */
export function ContactFormFields() {
  const form = useForm<ContactValues>({ resolver: zodResolver(contactSchema), defaultValues });
  const { attempt, honeypotRef, onSubmit, pending, result } = useFormSender(form, sendContactForm);
  const topic = useWatch({ control: form.control, name: "topic" });
  const customerType = useWatch({ control: form.control, name: "customerType" });
  const sections = contactSections(topic, customerType);

  if (result.status === "sent") return <FormThanks>{CONTACT_THANKS}</FormThanks>;

  return (
    <Form {...form}>
      <form aria-label="Contact form" className={formPanelClass} noValidate onSubmit={onSubmit}>
        <RadioField form={form} label="Please choose a topic" name="topic" options={CONTACT_TOPICS} required />
        <NameFields form={form} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField autoComplete="email" form={form} label="Email" name="email" required type="email" />
          <TextField autoComplete="tel" form={form} label="Phone Number" name="phone" type="tel" />
        </div>
        <TextField
          autoComplete="organization"
          description={GROUP_NAME_HELP}
          form={form}
          label="Group Name"
          name="groupName"
          required
        />

        {sections.has("booking") ? (
          <>
            <RadioField
              form={form}
              label="Are you a new or returning customer?"
              name="customerType"
              options={CUSTOMER_TYPES}
              required
            />
            <TextField
              description="What Month, Days & Times Work Best for Your Delivery"
              form={form}
              label="Delivery Timeline"
              multiline
              name="deliveryTimeline"
              required
            />
            <TextField form={form} label="Number of Order Forms Needed" name="orderForms" required />
          </>
        ) : null}
        {sections.has("deliveryAddress") ? (
          <>
            <AddressFields
              description="This is where the food will be delivered."
              form={form}
              label="Delivery Address"
              required
            />
            <HeardAboutField form={form} />
          </>
        ) : null}
        {sections.has("booking") ? (
          <TextField form={form} label="Additional comments" multiline name="comments" />
        ) : null}

        {sections.has("general") ? (
          <>
            <AddressFields cityAndStateOnly form={form} label="Address" />
            <HeardAboutField form={form} />
            <TextField form={form} label="What do you want to discuss" multiline name="discuss" />
          </>
        ) : null}

        <NewsletterField form={form} />
        <Honeypot inputRef={honeypotRef} />
        {result.status === "failed" ? <FormFailed contact={result.contact} key={attempt} /> : null}
        <SubmitButton pending={pending} />
      </form>
    </Form>
  );
}
