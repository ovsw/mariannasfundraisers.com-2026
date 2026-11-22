import { type Answer, type FormEmails, field, officeNotification, replyEmail, text } from "./layout.ts";

/**
 * The contact form's emails. Field names follow `contactPayload`
 * (frontend/lib/forms/contact.ts). The Website leaves out the fields of the
 * topics the visitor did not choose, so each topic's rows hide themselves.
 */

/** The answers in form order, with the form's labels. "How did you hear about us?" belongs to two topics. */
const answers: Answer[] = [
  { label: "Topic", value: field("topic") },
  { label: "Name", value: field("name") },
  { label: "Email", value: field("email") },
  { label: "Phone Number", value: field("phone"), onlyWhenGiven: "phone" },
  { label: "Group Name", value: field("group_name") },
  // Book a Fundraiser
  { label: "Are you a new or returning customer?", value: field("customer_type"), onlyWhenGiven: "customer_type" },
  { label: "Delivery Timeline", value: field("delivery_timeline"), onlyWhenGiven: "delivery_timeline" },
  { label: "Number of Order Forms Needed", value: field("order_forms"), onlyWhenGiven: "order_forms" },
  { label: "Delivery Address", value: field("delivery_address"), onlyWhenGiven: "delivery_address" },
  // General Info and Submit Testimonial
  { label: "Address", value: field("address"), onlyWhenGiven: "address" },
  // Both
  { label: "How did you hear about us?", value: field("heard_about"), onlyWhenGiven: "heard_about" },
  { label: "Additional comments", value: field("comments"), onlyWhenGiven: "comments" },
  { label: "What do you want to discuss", value: field("discuss"), onlyWhenGiven: "discuss" },
  { label: "Newsletter", value: field("newsletter") },
];

const sent = { page: "/contact-us", sent_at: "Nov 5, 2026, 10:30 AM ET" };

export const contactFormEmails: FormEmails = {
  form: "Contact form",
  formIdVariable: "FORMSPARK_CONTACT_FORM_ID",
  notification: officeNotification({
    heading: `${field("name")} ${text("of")} ${field("group_name")} ${text("sent the contact form:")} ${field("topic")}`,
    nextStep: `${text("Reply to this email to answer; your reply goes to")} ${field("email")}.`,
    answers,
  }),
  reply: {
    subject: "We got your message",
    code: replyEmail({
      greeting: `${text("Hi")} ${field("first_name")},`,
      paragraphs: [
        text("Thank you for contacting us! Someone from Marianna's Fundraisers will respond to you shortly."),
      ],
      answers,
    }),
  },
  examples: [
    {
      topic: "Book a Fundraiser",
      name: "Maria Rossi",
      first_name: "Maria",
      email: "maria@example.com",
      phone: "(610) 555-0147",
      group_name: "St. Anne's Youth Group",
      customer_type: "New Customer",
      delivery_timeline: "Any Saturday in March, mornings",
      order_forms: "40",
      delivery_address: "12 Main St, Pittsburgh, PA 15201",
      heard_about: "Friend, Social Media",
      comments: "—",
      newsletter: "Yes",
      ...sent,
      _email: { subject: "Contact form: Book a Fundraiser, St. Anne's Youth Group", from: "Marianna's Fundraisers website" },
    },
    {
      topic: "General Info",
      name: "Joe Smith",
      first_name: "Joe",
      email: "joe@example.com",
      phone: "—",
      group_name: "Lincoln Fire Company",
      address: "Erie, PA",
      heard_about: "—",
      discuss: "How does the order form work?",
      newsletter: "No",
      ...sent,
      _email: { subject: "Contact form: General Info, Lincoln Fire Company", from: "Marianna's Fundraisers website" },
    },
    {
      topic: "Submit Testimonial",
      name: "Ann Lee",
      first_name: "Ann",
      email: "ann@example.com",
      phone: "(412) 555-0100",
      group_name: "Hilltop Band Boosters",
      address: "—",
      heard_about: "Mailer",
      discuss: "Our sale raised more than we hoped. Thank you!",
      newsletter: "No",
      ...sent,
      _email: { subject: "Contact form: Submit Testimonial, Hilltop Band Boosters", from: "Marianna's Fundraisers website" },
    },
  ],
};
