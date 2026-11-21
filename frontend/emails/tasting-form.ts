import { type Answer, type FormEmails, field, officeNotification, replyEmail, text } from "./layout.ts";

/** The free tasting form's emails. Field names follow `tastingPayload` (frontend/lib/forms/tasting.ts). */

const answers: Answer[] = [
  { label: "Name", value: field("name") },
  { label: "Email", value: field("email") },
  { label: "Phone", value: field("phone") },
  { label: "Group Name", value: field("group_name") },
  { label: "No. of attendees", value: field("attendees") },
  { label: "Address (we'll come to you)", value: field("address"), onlyWhenGiven: "address" },
  { label: "Newsletter", value: field("newsletter") },
];

export const tastingFormEmails: FormEmails = {
  form: "Free tasting form",
  formIdVariable: "FORMSPARK_TASTING_FORM_ID",
  notification: officeNotification({
    heading: `${field("name")} ${text("of")} ${field("group_name")} ${text("asked for a free tasting.")}`,
    nextStep: `${text("Reply to this email or call")} ${field("phone")} ${text("to set the date and time.")}`,
    answers,
  }),
  reply: {
    subject: "We got your free tasting request",
    code: replyEmail({
      greeting: `${text("Hi")} ${field("first_name")},`,
      paragraphs: [
        text(
          "Thank you for contacting us with your Free Tasting request! We'll be in touch ASAP to discuss the date and time.",
        ),
      ],
      answers,
    }),
  },
  examples: [
    {
      name: "Maria Rossi",
      first_name: "Maria",
      email: "maria@example.com",
      phone: "(610) 555-0147",
      group_name: "St. Anne's Youth Group",
      attendees: "12",
      address: "12 Main St, Apt 4, Pittsburgh, PA 15201",
      newsletter: "Yes",
      page: "/schedule-a-free-tasting",
      sent_at: "Nov 5, 2026, 10:30 AM ET",
      _email: { subject: "Free tasting request: St. Anne's Youth Group", from: "Marianna's Fundraisers website" },
    },
  ],
};
