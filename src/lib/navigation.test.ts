import { describe, expect, it } from "vitest";
import { isPublicPath } from "./navigation";

describe("isPublicPath", () => {
  it.each([
    "/login",
    "/register",
    "/2fa/verify",
    "/forgot-password",
    "/reset-password",
  ])("treats %s as a public page", (path) => {
    expect(isPublicPath(path)).toBe(true);
  });

  it.each(["/", "/clients", "/projects/3"])(
    "treats %s as a protected page",
    (path) => {
      expect(isPublicPath(path)).toBe(false);
    },
  );
});
