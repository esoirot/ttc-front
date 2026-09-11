import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/useLocale";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { ForgotPasswordForm } from "./ForgotPasswordForm";

function renderForm(locale: Locale = "en") {
  return render(
    <IntlProvider locale={locale} messages={messages[locale]}>
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter>
          <ForgotPasswordForm />
        </MemoryRouter>
      </QueryClientProvider>
    </IntlProvider>,
  );
}

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("shows the check-your-email confirmation after submitting, without revealing if the account exists", async () => {
    gqlMutate.mockResolvedValueOnce({ requestPasswordReset: true });

    renderForm();

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "a@b.com" },
    });
    fireEvent.click(screen.getByText("Send reset link"));

    expect(await screen.findByText("Check your email")).toBeInTheDocument();
    expect(screen.getByText("a@b.com")).toBeInTheDocument();
  });

  it("shows a generic error message when the request fails", async () => {
    gqlMutate.mockRejectedValueOnce(new Error("network down"));

    renderForm();

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "a@b.com" },
    });
    fireEvent.click(screen.getByText("Send reset link"));

    expect(
      await screen.findByText("Something went wrong. Please try again."),
    ).toBeInTheDocument();
  });

  it("renders French copy when locale is fr", () => {
    renderForm("fr");

    expect(screen.getByText("Mot de passe oublié")).toBeInTheDocument();
  });
});
