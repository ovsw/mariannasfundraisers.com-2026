import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createFormsparkClient,
  createSubmitLimiter,
  type FormsparkClient,
  pagePath,
  submitForm,
} from "./form-delivery";
import { findASaleForm } from "./forms/find-a-sale";
import { HONEYPOT_FIELD } from "./forms/fields";

const values = { firstName: "Joe", lastName: "Smith", email: "joe@example.com", phone: "", hometown: "Erie, PA" };
const now = () => new Date("2026-11-05T15:30:00.000Z");

function deps(formspark: FormsparkClient = vi.fn(async () => {})) {
  return { formspark, allow: createSubmitLimiter({ limit: 5, windowMs: 10 * 60 * 1000 }), now };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("submitForm", () => {
  it("posts a valid entry to Formspark with the page it came from", async () => {
    const formspark = vi.fn(async () => {});
    const result = await submitForm(findASaleForm, values, { page: "/find-a-sale" }, "1.2.3.4", deps(formspark));
    expect(result).toEqual({ status: "sent" });
    expect(formspark).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Joe Smith", page: "/find-a-sale", sent_at: "Nov 5, 2026, 10:30 AM ET" }),
    );
  });

  it("does not reach Formspark when the honeypot is filled", async () => {
    const formspark = vi.fn(async () => {});
    const result = await submitForm(findASaleForm, values, { [HONEYPOT_FIELD]: "spam" }, "1.2.3.4", deps(formspark));
    expect(result).toEqual({ status: "failed" });
    expect(formspark).not.toHaveBeenCalled();
  });

  it("returns the errors of an invalid entry by field and does not post it", async () => {
    const formspark = vi.fn(async () => {});
    const result = await submitForm(findASaleForm, { ...values, email: "joe", hometown: "" }, {}, "1.2.3.4", deps(formspark));
    expect(result).toEqual({
      status: "invalid",
      errors: {
        email: "Enter a valid email address, like name@example.com.",
        hometown: "Enter your hometown.",
      },
    });
    expect(formspark).not.toHaveBeenCalled();
  });

  it("stops the sixth send from one visitor in ten minutes", async () => {
    const formspark = vi.fn(async () => {});
    const shared = deps(formspark);
    for (let send = 0; send < 5; send++) {
      expect(await submitForm(findASaleForm, values, {}, "1.2.3.4", shared)).toEqual({ status: "sent" });
    }
    expect(await submitForm(findASaleForm, values, {}, "1.2.3.4", shared)).toEqual({ status: "failed" });
    expect(formspark).toHaveBeenCalledTimes(5);
    // Another visitor still gets through.
    expect(await submitForm(findASaleForm, values, {}, "5.6.7.8", shared)).toEqual({ status: "sent" });
  });

  it("fails, and logs only the HTTP status, when Formspark answers an error", async () => {
    const fetch = vi.fn(async () => new Response("{}", { status: 500 }));
    vi.stubGlobal("fetch", fetch);
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await submitForm(findASaleForm, values, {}, "1.2.3.4", deps(createFormsparkClient("abc123")));
    expect(result).toEqual({ status: "failed" });
    expect(fetch).toHaveBeenCalledWith("https://submit-form.com/abc123", expect.objectContaining({ method: "POST" }));
    expect(log).toHaveBeenCalledWith("Find a sale form did not reach Formspark: Formspark answered HTTP 500");
    expect(JSON.stringify(log.mock.calls)).not.toContain("joe@example.com");
  });

  it("fails when Formspark does not answer in time", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
      }),
    );
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await submitForm(findASaleForm, values, {}, "1.2.3.4", deps(createFormsparkClient("abc123")));
    expect(result).toEqual({ status: "failed" });
    expect(log).toHaveBeenCalledWith("Find a sale form did not reach Formspark: no answer in 10 seconds");
  });

  it("fails without posting when the form ID is not set", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await submitForm(findASaleForm, values, {}, "1.2.3.4", deps(createFormsparkClient(undefined)));
    expect(result).toEqual({ status: "failed" });
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("Formspark client", () => {
  it("posts JSON with a 10 second timeout", async () => {
    const fetch = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    await createFormsparkClient("echo")({ name: "Joe" });
    const [, init] = fetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.body).toBe('{"name":"Joe"}');
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });
});

describe("pagePath", () => {
  it("keeps a site path and refuses anything else", () => {
    expect(pagePath("/contact-us")).toBe("/contact-us");
    for (const value of ["//evil.example", "https://evil.example", 42, "/a b", undefined]) {
      expect(pagePath(value)).toBe("unknown");
    }
  });
});
