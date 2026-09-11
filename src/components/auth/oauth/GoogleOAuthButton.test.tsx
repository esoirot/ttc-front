import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createIntlWrapper } from "@/test/intlWrapper";
import { GoogleOAuthButton } from "./GoogleOAuthButton";

const wrapper = createIntlWrapper();

describe("GoogleOAuthButton", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, href: "" },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("stores the oauth_from destination and redirects to the google auth endpoint", () => {
    render(<GoogleOAuthButton from="/dashboard" />, { wrapper });

    fireEvent.click(screen.getByText("Continue with Google"));

    const stored = JSON.parse(sessionStorage.getItem("oauth_from") ?? "{}");
    expect(stored.dest).toBe("/dashboard");
    expect(typeof stored.ts).toBe("number");
    expect(window.location.href).toBe("http://localhost:3000/auth/google");
  });

  it("defaults the destination to '/' when no from prop is given", () => {
    render(<GoogleOAuthButton />, { wrapper });

    fireEvent.click(screen.getByText("Continue with Google"));

    const stored = JSON.parse(sessionStorage.getItem("oauth_from") ?? "{}");
    expect(stored.dest).toBe("/");
  });
});
