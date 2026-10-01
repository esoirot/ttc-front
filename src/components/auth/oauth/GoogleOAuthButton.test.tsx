import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { redirectTo } = vi.hoisted(() => ({ redirectTo: vi.fn() }));
vi.mock("@/lib/navigation", () => ({ redirectTo }));
import { createIntlWrapper } from "@/test/intlWrapper";
import { GoogleOAuthButton } from "./GoogleOAuthButton";

const wrapper = createIntlWrapper();

describe("GoogleOAuthButton", () => {
  beforeEach(() => {
    redirectTo.mockClear();
  });

  it("stores the oauth_from destination and redirects to the google auth endpoint", () => {
    render(<GoogleOAuthButton from="/dashboard" />, { wrapper });

    fireEvent.click(screen.getByText("Continue with Google"));

    const stored = JSON.parse(sessionStorage.getItem("oauth_from") ?? "{}");
    expect(stored.dest).toBe("/dashboard");
    expect(typeof stored.ts).toBe("number");
    expect(redirectTo).toHaveBeenCalledWith(
      "http://localhost:3000/auth/google",
    );
  });

  it("defaults the destination to '/' when no from prop is given", () => {
    render(<GoogleOAuthButton />, { wrapper });

    fireEvent.click(screen.getByText("Continue with Google"));

    const stored = JSON.parse(sessionStorage.getItem("oauth_from") ?? "{}");
    expect(stored.dest).toBe("/");
  });
});
