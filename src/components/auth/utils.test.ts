import { describe, expect, it } from "vitest";
import { isValidEmail } from "./utils";

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
