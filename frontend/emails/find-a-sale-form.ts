import { type Answer, type FormEmails, field, officeNotification, replyEmail, text } from "./layout.ts";

/** The find a sale form's emails. Field names follow `findASalePayload` (frontend/lib/forms/find-a-sale.ts). */

const answers: Answer[] = [
  { label: "Name", value: field("name") },
  { label: "Email", value: field("email") },
  { label: "Phone", value: field("phone"), onlyWhenGiven: "phone" },
  { label: "Hometown", value: field("hometown") },
];

export const findASaleFormEmails: FormEmails = {
  form: "Find a sale form",
  formIdVariable: "FORMSPARK_FIND_A_SALE_FORM_ID",
  notification: officeNotification({
    heading: `${field("name")} ${text("from")} ${field("hometown")} ${text("asked where to find a sale.")}`,
    nextStep: `${text("Reply to this email with the current and upcoming fundraisers near")} ${field("hometown")}.`,
    answers,
  }),
  reply: {
    subject: "We got your request",
    code: replyEmail({
      greeting: `${text("Hi")} ${field("first_name")},`,
      paragraphs: [
        text(
          "Thank you for contacting us! Someone from Marianna's Fundraisers will respond to you shortly with information about current and upcoming fundraisers.",
        ),
      ],
      answers,
    }),
  },
  examples: [
    {
      name: "Joe Smith",
      first_name: "Joe",
      email: "joe@example.com",
      phone: "—",
      hometown: "Erie, PA",
      page: "/find-a-sale",
      sent_at: "Nov 5, 2026, 10:30 AM ET",
      _email: { subject: "Find a sale: Joe Smith, Erie, PA", from: "Marianna's Fundraisers website" },
    },
  ],
};
