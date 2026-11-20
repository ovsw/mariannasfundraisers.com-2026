// The Cognito forms of the site (spec decision 15). An editor adds a form by
// typing its form ID; the account key is fixed here, so no field ever holds
// embed code. The Studio validates the ID with it, the importer reads the old
// IDs with it, and the Website builds the form's address from it.

/** The Cognito account the site's forms live in (the old site's iframe key). */
export const COGNITO_ACCOUNT_KEY = "xPoircp7HEGoNo_tpFEirg";

/** Cognito's iframe script: it sizes each form's iframe to its content. */
export const COGNITO_IFRAME_SCRIPT_SRC = "https://www.cognitoforms.com/f/iframe.js";

const FORM_ID = /^[1-9][0-9]{0,5}$/;

/** The form ID as stored (digits only), or null when the text is not one. */
export function cognitoFormId(value: string | number | null | undefined): string | null {
  const text = String(value ?? "").trim();
  return FORM_ID.test(text) ? text : null;
}

/** The address of a form's iframe. */
export function cognitoFormUrl(formId: string): string {
  return `https://www.cognitoforms.com/f/${COGNITO_ACCOUNT_KEY}/${encodeURIComponent(formId)}`;
}
