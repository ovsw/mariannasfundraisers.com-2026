import assert from "node:assert/strict";
import test from "node:test";
import { cognitoFormId, cognitoFormUrl } from "./cognito.ts";

test("a form ID is the digits Cognito numbers its forms with", () => {
  assert.equal(cognitoFormId("114"), "114");
  assert.equal(cognitoFormId(" 168 "), "168");
  assert.equal(cognitoFormId(173), "173");
});

test("anything else is not a form ID, so embed code never passes", () => {
  for (const value of [
    null,
    undefined,
    "",
    "  ",
    "0",
    "01",
    "12a",
    "1234567",
    '<script src="https://www.cognitoforms.com/f/seamless.js" data-form="1"></script>',
    "https://www.cognitoforms.com/f/key/114",
  ]) {
    assert.equal(cognitoFormId(value), null, String(value));
  }
});

test("the form address uses the site's fixed account key", () => {
  assert.equal(cognitoFormUrl("114"), "https://www.cognitoforms.com/f/xPoircp7HEGoNo_tpFEirg/114");
});
