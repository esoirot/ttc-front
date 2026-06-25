import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { ForgotPasswordForm } from "./ForgotPasswordForm";

function renderForm() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter>
        <ForgotPasswordForm />
      </MemoryRouter>
    </QueryClientProvider>,
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
});
