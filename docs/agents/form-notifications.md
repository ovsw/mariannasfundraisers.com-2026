# Website forms and their emails

The Website has three forms, each a Page Builder section: the **Contact form**
(`contactForm`), the **Free tasting form** (`tastingForm`) and the **Find a
sale form** (`findASaleForm`). They replaced the old Cognito forms (114, 168
and 173) in issue #35.

Each entry goes from the Website's server to the form's own Formspark form in
the DelGrosso workspace. The visitor's browser never talks to Formspark.
Formspark then sends two emails:

- The **office notification** goes to the form's notification recipients. It
  says what happened, what the office does next, and what the visitor sent.
  Its Reply-To is the visitor, so the office answers by replying.
- The **reply email** goes to the visitor right after they send the form. It
  says what happens next, in the form's own thank-you words, and repeats what
  they sent.

Both are code in `frontend/emails/`, and `pnpm form-emails` writes them to
Formspark through its template API.

## The one rule

Never edit these templates in Formspark's visual editor or in Postcraft. The
next push overwrites the change, and a code template cannot be opened in the
visual editor. Change the code here and push it.

## Where things are

- `frontend/lib/forms/`: one file per form with its zod schema (the rules the
  browser and the server share), its thank-you message, and the Formspark
  payload its answers become; `fields.ts` holds the shared pieces. The
  contact form's topic rules are `contactSections` in `contact.ts`: which
  fields show, which are required, and which the payload sends.
- `frontend/lib/form-delivery.ts`: `submitForm`, the one function every form
  sends through: the honeypot, the send limit (5 in 10 minutes per visitor,
  in memory), the server-side check, and a JSON `POST` to
  `https://submit-form.com/<form ID>` with a 10 second timeout. It logs only
  why a post failed (the HTTP status), never the entry.
- `frontend/app/actions/forms.ts`: one server action per form.
- `frontend/components/forms/`: the browser side (react-hook-form with
  `components/ui/form.tsx`), and the failure message that offers the phone
  number and email address from the site settings.
- `frontend/components/blocks/contact-form.tsx`, `tasting-form.tsx`,
  `find-a-sale-form.tsx`: the sections.
- `frontend/emails/layout.ts`: the shared theme (Marianna's cream page, ink
  text, green button, a system font, no images, at most 600px wide) and the
  two layouts.
- `frontend/emails/<form>.ts`: one file per form: its office notification,
  its reply email with the subject, and example entries for the preview (the
  contact form has one per topic).
- `frontend/emails/index.ts`: the list of forms the script handles.
- `frontend/scripts/form-emails.ts`: the script.

## The payload

Flat, snake_case, with human-readable values, because the office reads
entries in Formspark too. `name` is "First Last" and `first_name` is sent too;
`email` is the visitor's address (Formspark uses it for Reply-To and as the
reply email's recipient). Checkbox lists are joined with ", ", an address is
one line, the newsletter box is `newsletter: "Yes"` or `"No"`, and an empty
optional field is "—". Every entry also carries `page` (the path it was sent
from), `sent_at` (Eastern time, ready to show, for example "Nov 5, 2026, 10:30
AM ET"), and `_email.subject` and `_email.from` ("Marianna's Fundraisers
website"). The contact form leaves out the fields of the topics the visitor
did not choose.

## The templates

The placeholders are Handlebars, and the entry is under `data`, so a payload
field `phone` is `{{data.phone}}`. The field names are the ones
`frontend/lib/forms/` sends; a renamed payload field needs the template
changed with it (`frontend/emails/emails.test.ts` checks the examples against
the payloads). An optional answer row sets `onlyWhenGiven`, so it shows only
when the entry holds the field and it is not "—"; that is also how the
contact notification shows only the rows of the chosen topic. Formspark's
helpers are `capitalize`, `nl2br`, `pluralize`, `sanitizeUrl`, `stringify`,
`switch`/`case`/`default` and `titleCase`; it has no `eq`. Style only with
inline `style` attributes: Formspark sends no stylesheet.

The office notification has the same order for every form:

1. A heading that says what happened.
2. One line on what to do next.
3. The answers in form order, with the form's labels; optional rows only when
   given. The newsletter row is always shown: staff add people who ticked it
   to the mailing list by hand.
4. Small print: the page and the sent time, then "View in Formspark" when
   Formspark gives the link (`viewLink`).

The office notification sets no subject: the `_email.subject` the Website
sends wins, so the subjects live in `frontend/lib/forms/` ("Contact form:
{topic}, {group name}", "Free tasting request: {group name}", "Find a sale:
{name}, {hometown}").

The reply email greets the visitor by first name, says what happens next with
the form's thank-you message, repeats what they sent, and is signed
"Marianna's Fundraisers". Its subject is in its form's file.

## What Formspark fixes

Do not try to work around these:

- The sender address is Formspark's; only the sender name can be set.
- A reply to the reply email goes to the form's first notification recipient.
- The reply email ends with a Formspark footer and an unsubscribe link.
- Reply emails are for confirmations only. A template that Formspark's
  content check pauses sends nothing, so `push` stops and says so.
- A code template cannot be opened in the visual editor afterwards.

## Form IDs and recipients

The form IDs are `FORMSPARK_CONTACT_FORM_ID`, `FORMSPARK_TASTING_FORM_ID` and
`FORMSPARK_FIND_A_SALE_FORM_ID`, set in Vercel (Production and Preview) and in
`frontend/.env.local`. Never write an ID or the token into the repository, an
issue or a PR. `frontend/.env.local.example` sets each to `echo`, Formspark's
test form, which accepts entries and emails nobody; a production build fails
while one is missing or still `echo` (`frontend/scripts/check-production-env.mjs`).
To try the forms locally without sending real emails, start the dev server
with the three variables set to `echo` in its environment, which wins over
`.env.local`.

Until launch each form's notification recipient is Ovi only. At go-live the
office inbox becomes the recipient of all three, set in Formspark, followed by
one test entry per form (`docs/migration/go-live.md`, step 4).

## Running the script

The script reads `FORMSPARK_TEMPLATE_TOKEN` (a Formspark token with
`forms:read` and `forms:write`) and the three form IDs from
`~/.config/mariannas/formspark.env` (outside git, mode 600). The token lives
only on Ovi's machine, never in Vercel, and the script never prints it.

```sh
pnpm form-emails push                   # write all six templates to Formspark
pnpm form-emails preview                # render every stored template; sends nothing
pnpm form-emails push "Contact form"    # one form only
```

- `push` writes each template. When Formspark answers `template_invalid`, the
  script stops and names the template; Formspark keeps the old one. It also
  stops when Formspark pauses a template.
- `preview` renders each template against each of its example entries and
  prints the subject and the text. Formspark previews only the template it
  stores, so preview after a push; it says when the stored template differs
  from the code.

After a push, send one real test entry per form and read both emails.
