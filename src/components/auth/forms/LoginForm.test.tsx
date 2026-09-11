import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { createQueryClient } from "@/test/queryClientWrapper";
import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/useLocale";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigateMock };
});

import { LoginForm } from "./LoginForm";

function makeWrapper(locale: Locale = "en") {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={createQueryClient()}>
        <IntlProvider
          locale={locale}
          defaultLocale="en"
          messages={messages[locale]}
        >
          <MemoryRouter>{children}</MemoryRouter>
        </IntlProvider>
      </QueryClientProvider>
    );
  };
}

const wrapper = makeWrapper();

describe("LoginForm", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    navigateMock.mockReset();
    gqlFetch.mockResolvedValue({ me: null });
  });

  it("shows an email validation error after blurring an invalid address", () => {
    render(<LoginForm />, { wrapper });

    const emailInput = screen.getByLabelText("Email");
    fireEvent.change(emailInput, { target: { value: "not-an-email" } });
    fireEvent.blur(emailInput);

    expect(
      screen.getByText("Enter a valid email address."),
    ).toBeInTheDocument();
  });

  it("navigates to 'from' on a normal successful login", async () => {
    gqlMutate.mockResolvedValueOnce({
      login: {
        user: { id: 1, email: "a@b.com" },
        requiresTwoFactor: false,
        tempToken: null,
      },
    });

    render(<LoginForm />, { wrapper });

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith("/", { replace: true }),
    );
  });

  it("navigates to the 2FA verify page when the login requires it", async () => {
    gqlMutate.mockResolvedValueOnce({
      login: {
        user: { id: 1, email: "a@b.com" },
        requiresTwoFactor: true,
        tempToken: "temp-123",
      },
    });

    render(<LoginForm />, { wrapper });

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith("/2fa/verify", {
        state: { tempToken: "temp-123", from: "/" },
      }),
    );
  });

  it("shows the mutation error message on failed login", async () => {
    gqlMutate.mockRejectedValueOnce(new Error("Invalid credentials"));

    render(<LoginForm />, { wrapper });

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });

  it("renders French copy when locale is fr", () => {
    render(<LoginForm />, { wrapper: makeWrapper("fr") });

    expect(screen.getByText("Connexion")).toBeInTheDocument();
    expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Se connecter" }),
    ).toBeInTheDocument();
  });
});
