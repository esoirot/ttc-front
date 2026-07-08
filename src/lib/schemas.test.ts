import { describe, expect, it } from "vitest";
import {
  isValidEmail,
  isValidHttpUrl,
  isValidHttpsUrl,
  isValidOptionalEmail,
  toSafeHref,
  toSafeHttpsSrc,
} from "./schemas";

describe("isValidEmail", () => {
  it("accepts a well-formed email", () => {
    expect(isValidEmail("a@b.com")).toBe(true);
  });

  it("rejects missing @", () => {
    expect(isValidEmail("ab.com")).toBe(false);
  });

  it("rejects missing domain dot", () => {
    expect(isValidEmail("a@bcom")).toBe(false);
  });

  it("rejects whitespace", () => {
    expect(isValidEmail("a b@c.com")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });
});

describe("isValidOptionalEmail", () => {
  it("accepts empty string (optional field)", () => {
    expect(isValidOptionalEmail("")).toBe(true);
  });

  it("accepts a well-formed email", () => {
    expect(isValidOptionalEmail("a@b.com")).toBe(true);
  });

  it("rejects a malformed non-empty email", () => {
    expect(isValidOptionalEmail("not-an-email")).toBe(false);
  });
});

describe("isValidHttpUrl", () => {
  it("accepts empty string (optional field)", () => {
    expect(isValidHttpUrl("")).toBe(true);
  });

  it("accepts http:// and https://", () => {
    expect(isValidHttpUrl("http://example.com")).toBe(true);
    expect(isValidHttpUrl("https://example.com")).toBe(true);
  });

  it("accepts a bare domain and coerces to https", () => {
    expect(isValidHttpUrl("example.com")).toBe(true);
  });

  it("rejects javascript: URIs", () => {
    expect(isValidHttpUrl("javascript:alert(1)")).toBe(false);
  });

  it("rejects data: URIs", () => {
    expect(isValidHttpUrl("data:text/html,<script>alert(1)</script>")).toBe(
      false,
    );
  });
});

describe("isValidHttpsUrl", () => {
  it("accepts empty string (optional field)", () => {
    expect(isValidHttpsUrl("")).toBe(true);
  });

  it("accepts https://", () => {
    expect(isValidHttpsUrl("https://example.com")).toBe(true);
  });

  it("rejects http:// (https-only field)", () => {
    expect(isValidHttpsUrl("http://example.com")).toBe(false);
  });

  it("accepts a bare domain and coerces to https", () => {
    expect(isValidHttpsUrl("example.com")).toBe(true);
  });

  it("rejects javascript: URIs", () => {
    expect(isValidHttpsUrl("javascript:alert(1)")).toBe(false);
  });

  it("does not let an http:// prefix sneak through as a coerced bare domain", () => {
    // regression guard: naive prefixing (`https://${v}`) on an already-schemed
    // value would turn this into "https://http://example.com", which some URL
    // parsers accept — must be rejected outright instead.
    expect(isValidHttpsUrl("http://example.com")).toBe(false);
  });
});

describe("toSafeHref", () => {
  it("returns null for nullish input", () => {
    expect(toSafeHref(null)).toBeNull();
    expect(toSafeHref(undefined)).toBeNull();
    expect(toSafeHref("")).toBeNull();
  });

  it("returns the URL unchanged for valid http(s) input", () => {
    expect(toSafeHref("https://example.com")).toBe("https://example.com");
  });

  it("coerces a bare domain to https", () => {
    expect(toSafeHref("example.com")).toBe("https://example.com");
  });

  it("returns null for javascript: URIs", () => {
    expect(toSafeHref("javascript:alert(document.cookie)")).toBeNull();
  });

  it("returns null for data: URIs", () => {
    expect(toSafeHref("data:text/html,x")).toBeNull();
  });
});

describe("toSafeHttpsSrc", () => {
  it("returns null for nullish input", () => {
    expect(toSafeHttpsSrc(null)).toBeNull();
    expect(toSafeHttpsSrc(undefined)).toBeNull();
    expect(toSafeHttpsSrc("")).toBeNull();
  });

  it("returns the URL unchanged for valid https input", () => {
    expect(toSafeHttpsSrc("https://example.com/logo.png")).toBe(
      "https://example.com/logo.png",
    );
  });

  it("returns null for http:// (https-only sink)", () => {
    expect(toSafeHttpsSrc("http://example.com/logo.png")).toBeNull();
  });

  it("returns null for javascript: URIs", () => {
    expect(toSafeHttpsSrc("javascript:alert(1)")).toBeNull();
  });
});
