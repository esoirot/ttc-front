import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";

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

import { ResetPasswordForm } from "./ResetPasswordForm";

function renderForm(path = "/reset-password?token=abc123") {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={[path]}>
        <ResetPasswordForm />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    navigateMock.mockReset();
  });

  it("shows an invalid-link message when there is no token", () => {
    renderForm("/reset-password");

    expect(screen.getByText("Invalid link")).toBeInTheDocument();
  });

  it("shows a mismatch error after blurring a non-matching confirm field", () => {
    renderForm();

    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "password123" },
    });
    const confirm = screen.getByLabelText("Confirm password");
    fireEvent.change(confirm, { target: { value: "different" } });
    fireEvent.blur(confirm);

    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
  });

  it("disables submit until both fields are valid and matching", () => {
    renderForm();

    expect(screen.getByText("Set new password")).toBeDisabled();

    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "password123" },
    });

    expect(screen.getByText("Set new password")).not.toBeDisabled();
  });

  it("navigates to /login with a success message after resetting", async () => {
    gqlMutate.mockResolvedValueOnce({ resetPassword: true });

    renderForm();

    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("Set new password"));

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith("/login", {
        state: {
          message: "Password updated. Sign in with your new password.",
        },
        replace: true,
      }),
    );
  });

  it("shows an expired-link message when the server reports an invalid/expired token", async () => {
    gqlMutate.mockRejectedValueOnce(new Error("Token is invalid or expired"));

    renderForm();

    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("Set new password"));

    expect(
      await screen.findByText("This link is invalid or has expired."),
    ).toBeInTheDocument();
  });

  it("shows a generic error for other failures", async () => {
    gqlMutate.mockRejectedValueOnce(new Error("network down"));

    renderForm();

    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("Set new password"));

    expect(
      await screen.findByText("Something went wrong. Please try again."),
    ).toBeInTheDocument();
  });
});
