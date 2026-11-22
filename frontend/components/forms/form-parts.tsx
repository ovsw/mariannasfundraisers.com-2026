"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useOfficeContact } from "@/components/forms/office-contact";
import type { FormMeta } from "@/lib/form-delivery";
import {
  HEARD_ABOUT_OPTIONS,
  HONEYPOT_FIELD,
  NEWSLETTER_LABEL,
  NEWSLETTER_OPTION,
  type FormResult,
} from "@/lib/forms/fields";
import {
  type FormEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

/**
 * The parts the Website's forms are built from: labelled fields wired to
 * react-hook-form through components/ui/form.tsx, the honeypot, and the
 * thank-you and failure messages.
 */

type FieldProps<Values extends FieldValues> = {
  form: UseFormReturn<Values>;
  name: Path<Values>;
  label: string;
  required?: boolean;
  description?: string;
};

function LabelText({ label, required }: { label: string; required?: boolean }) {
  return (
    <>
      {label}
      {required ? (
        // The control's required attribute tells screen readers; the star is for the eye.
        <span aria-hidden="true" className="text-destructive">
          {" "}*
        </span>
      ) : null}
    </>
  );
}

const labelClass = "text-sm font-semibold leading-snug";
const partLabelClass = "text-xs font-normal leading-snug text-muted-foreground";

export function TextField<Values extends FieldValues>({
  autoComplete,
  description,
  form,
  inputMode,
  label,
  multiline,
  name,
  part,
  required,
  type = "text",
}: FieldProps<Values> & {
  autoComplete?: string;
  inputMode?: "numeric" | "tel" | "email" | "text";
  multiline?: boolean;
  /** One part of a grouped field (a name or an address): a smaller label without the star, which the group's legend shows. */
  part?: boolean;
  type?: "email" | "tel" | "text";
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        // content-start keeps the input under its label when a neighbour in the row shows an error.
        <FormItem className="content-start">
          <FormLabel className={part ? partLabelClass : labelClass}>
            <LabelText label={label} required={required && !part} />
          </FormLabel>
          <FormControl>
            {multiline ? (
              <Textarea
                {...field}
                aria-required={required || undefined}
                className="min-h-28 bg-popover text-popover-foreground"
                value={field.value ?? ""}
              />
            ) : (
              <Input
                {...field}
                aria-required={required || undefined}
                autoComplete={autoComplete}
                className="bg-popover text-popover-foreground"
                inputMode={inputMode}
                type={type}
                value={field.value ?? ""}
              />
            )}
          </FormControl>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function NameFields<Values extends FieldValues>({
  form,
  label = "Name",
}: {
  form: UseFormReturn<Values>;
  label?: string;
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className={`${labelClass} mb-2`}>
        <LabelText label={label} required />
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          part
          autoComplete="given-name"
          form={form}
          label="First"
          name={"firstName" as Path<Values>}
          required
        />
        <TextField
          part
          autoComplete="family-name"
          form={form}
          label="Last"
          name={"lastName" as Path<Values>}
          required
        />
      </div>
    </fieldset>
  );
}

/** A full US address, or only its city and state. */
export function AddressFields<Values extends FieldValues>({
  cityAndStateOnly,
  description,
  form,
  label,
  required,
}: {
  cityAndStateOnly?: boolean;
  description?: string;
  form: UseFormReturn<Values>;
  label: string;
  required?: boolean;
}) {
  const field = (name: string) => name as Path<Values>;
  return (
    <fieldset className="grid gap-2">
      <legend className={`${labelClass} mb-2`}>
        <LabelText label={label} required={required} />
      </legend>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      <div className="grid gap-3 sm:grid-cols-6">
        {cityAndStateOnly ? null : (
          <>
            <div className="sm:col-span-6">
              <TextField
                part
                autoComplete="address-line1"
                form={form}
                label="Address line 1"
                name={field("addressLine1")}
                required={required}
              />
            </div>
            <div className="sm:col-span-6">
              <TextField
                part
                autoComplete="address-line2"
                form={form}
                label="Address line 2"
                name={field("addressLine2")}
              />
            </div>
          </>
        )}
        <div className={cityAndStateOnly ? "sm:col-span-3" : "sm:col-span-2"}>
          <TextField
            part
            autoComplete="address-level2"
            form={form}
            label="City"
            name={field("city")}
            required={required}
          />
        </div>
        <div className={cityAndStateOnly ? "sm:col-span-3" : "sm:col-span-2"}>
          <TextField
            part
            autoComplete="address-level1"
            form={form}
            label="State"
            name={field("state")}
            required={required}
          />
        </div>
        {cityAndStateOnly ? null : (
          <div className="sm:col-span-2">
            <TextField
              part
              autoComplete="postal-code"
              form={form}
              inputMode="numeric"
              label="Zip code"
              name={field("zip")}
              required={required}
            />
          </div>
        )}
      </div>
    </fieldset>
  );
}

export function RadioField<Values extends FieldValues>({
  description,
  form,
  label,
  name,
  options,
  required,
}: FieldProps<Values> & { options: readonly string[] }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <fieldset className="grid gap-3">
          <legend className={`${labelClass} mb-2`}>
            <LabelText label={label} required={required} />
          </legend>
          {description ? <FormDescription>{description}</FormDescription> : null}
          <FormControl>
            <RadioGroup
              aria-required={required || undefined}
              className="gap-3"
              name={field.name}
              onValueChange={field.onChange}
              ref={field.ref}
              value={field.value ?? ""}
            >
              {options.map((option) => (
                <label className="flex cursor-pointer items-center gap-3 text-sm" key={option}>
                  <RadioGroupItem className="bg-popover" value={option} />
                  {option}
                </label>
              ))}
            </RadioGroup>
          </FormControl>
          </fieldset>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/** "How did you hear about us?": a checkbox list, stored as an array of the ticked answers. */
export function HeardAboutField<Values extends FieldValues>({ form }: { form: UseFormReturn<Values> }) {
  return (
    <CheckboxListField
      form={form}
      label="How did you hear about us?"
      name={"heardAbout" as Path<Values>}
      options={HEARD_ABOUT_OPTIONS}
    />
  );
}

export function CheckboxListField<Values extends FieldValues>({
  form,
  label,
  name,
  options,
}: FieldProps<Values> & { options: readonly string[] }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const ticked: string[] = Array.isArray(field.value) ? field.value : [];
        return (
          <FormItem>
            <fieldset className="grid gap-3">
              <legend className={`${labelClass} mb-2`}>{label}</legend>
              {options.map((option) => (
                <label className="flex cursor-pointer items-center gap-3 text-sm" key={option}>
                  <Checkbox
                    checked={ticked.includes(option)}
                    className="bg-popover"
                    onCheckedChange={(checked) =>
                      field.onChange(
                        checked
                          ? options.filter((item) => item === option || ticked.includes(item))
                          : ticked.filter((item) => item !== option),
                      )
                    }
                  />
                  {option}
                </label>
              ))}
            </fieldset>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

/** The newsletter box: one checkbox, unticked by default. */
export function NewsletterField<Values extends FieldValues>({ form }: { form: UseFormReturn<Values> }) {
  return (
    <FormField
      control={form.control}
      name={"newsletter" as Path<Values>}
      render={({ field }) => (
        <FormItem>
          <fieldset className="grid gap-3">
            <legend className={`${labelClass} mb-2`}>{NEWSLETTER_LABEL}</legend>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <Checkbox
                checked={field.value === true}
                className="mt-1 bg-popover"
                onCheckedChange={(checked) => field.onChange(checked === true)}
                ref={field.ref}
              />
              {NEWSLETTER_OPTION}
            </label>
          </fieldset>
        </FormItem>
      )}
    />
  );
}

/** Only a bot fills this in; people never see or reach it. */
export function Honeypot({ inputRef }: { inputRef: RefObject<HTMLInputElement | null> }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
      <label>
        Fax
        <input autoComplete="off" name={HONEYPOT_FIELD} ref={inputRef} tabIndex={-1} type="text" />
      </label>
    </div>
  );
}

type Sender<Values> = (values: Values, meta: FormMeta) => Promise<FormResult>;

/**
 * Sends the answers through the form's server action and keeps its result.
 * Errors the server finds land on their fields, as the browser's own do.
 */
export function useFormSender<Values extends FieldValues>(
  form: UseFormReturn<Values>,
  send: Sender<Values>,
) {
  const [result, setResult] = useState<FormResult>({ status: "idle" });
  // Counts sends, so a second failure remounts the message and moves focus again.
  const [attempt, setAttempt] = useState(0);
  const [pending, startTransition] = useTransition();
  const honeypotRef = useRef<HTMLInputElement>(null);

  async function deliver(values: Values) {
    let answer: FormResult;
    try {
      answer = await send(values, {
        page: window.location.pathname,
        [HONEYPOT_FIELD]: honeypotRef.current?.value ?? "",
      });
    } catch {
      answer = { status: "failed" };
    }
    if (answer.status === "invalid") {
      const names = Object.keys(answer.errors);
      for (const name of names) {
        form.setError(name as Path<Values>, { message: answer.errors[name] });
      }
      if (names[0]) form.setFocus(names[0] as Path<Values>);
    }
    setAttempt((count) => count + 1);
    setResult(answer);
  }

  // handleSubmit is built when the form is sent, so render reads no ref.
  const onSubmit = (event: FormEvent<HTMLFormElement>) =>
    form.handleSubmit((values) => startTransition(() => deliver(values)))(event);

  return { attempt, honeypotRef, onSubmit, pending, result };
}

/** The thank-you message that replaces the form once it is sent. */
export function FormThanks({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div
      className="rounded-card border border-border bg-card p-6 text-card-foreground outline-none sm:p-10"
      ref={ref}
      role="status"
      tabIndex={-1}
    >
      <p className="text-pretty text-lg/[1.6] font-medium">{children}</p>
    </div>
  );
}

/** Shown when the entry did not reach the office: try again, or reach the office directly. */
export function FormFailed() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.focus(), []);
  const { phone, email } = useOfficeContact();
  const link = "text-link underline underline-offset-4 hover:text-link-hover";
  return (
    <div
      className="grid gap-2 rounded-control border border-destructive/40 bg-destructive/5 p-4 text-pretty outline-none"
      ref={ref}
      role="alert"
      tabIndex={-1}
    >
      <p className="font-semibold">Sorry, your message did not reach us.</p>
      <p>Please try again in a few minutes{phone || email ? ", or contact us directly" : ""}.</p>
      {phone ? (
        <p>
          Call{" "}
          <a className={link} href={`tel:${phone.replace(/[^+\d]/g, "")}`}>
            {phone}
          </a>
        </p>
      ) : null}
      {email ? (
        <p>
          Email{" "}
          <a className={link} href={`mailto:${email}`}>
            {email}
          </a>
        </p>
      ) : null}
    </div>
  );
}

export function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button className="w-full sm:w-auto sm:self-start" disabled={pending} size="lg" type="submit">
      {pending ? "Sending…" : "Submit"}
    </Button>
  );
}

/** The form's own layout: fields stacked on the section's background, as the old Cognito forms were. */
export const formPanelClass = "relative flex flex-col gap-6";
