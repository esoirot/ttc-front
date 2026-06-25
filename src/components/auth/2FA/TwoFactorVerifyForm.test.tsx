import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
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

import { TwoFactorVerifyForm } from "./TwoFactorVerifyForm";

function renderForm(state: { tempToken?: string; from?: string } | null) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={[{ pathname: "/2fa/verify", state }]}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route path="/2fa/verify" element={<TwoFactorVerifyForm />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("TwoFactorVerifyForm", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    navigateMock.mockReset();
  });

  it("redirects to /login when there is no tempToken", () => {
    renderForm(null);

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("verifies the TOTP code and navigates to 'from' on success", async () => {
    gqlMutate.mockResolvedValueOnce({
      verifyTwoFactor: { user: { id: 1 } },
    });

    renderForm({ tempToken: "temp-1", from: "/clients" });

    fireEvent.change(screen.getByLabelText("Authenticator code"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify" }));

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith("/clients", { replace: true }),
    );
  });

  it("shows the TOTP error message on failure", async () => {
    gqlMutate.mockRejectedValueOnce(new Error("Invalid code"));

    renderForm({ tempToken: "temp-1" });

    fireEvent.change(screen.getByLabelText("Authenticator code"), {
      target: { value: "000000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify" }));

    expect(await screen.findByText("Invalid code")).toBeInTheDocument();
  });

  it("switches to the backup code form and back", () => {
    renderForm({ tempToken: "temp-1" });

    fireEvent.click(
      screen.getByText("Lost access to authenticator? Use backup code"),
    );
    expect(screen.getByLabelText("Backup code")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Use authenticator code instead"));
    expect(screen.getByLabelText("Authenticator code")).toBeInTheDocument();
  });

  it("verifies a backup code and navigates to 'from' on success", async () => {
    gqlMutate.mockResolvedValueOnce({
      verifyTwoFactorBackup: { user: { id: 1 } },
    });

    renderForm({ tempToken: "temp-1", from: "/dashboard" });

    fireEvent.click(
      screen.getByText("Lost access to authenticator? Use backup code"),
    );
    fireEvent.change(screen.getByLabelText("Backup code"), {
      target: { value: "abc123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verify backup code" }));

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith("/dashboard", {
        replace: true,
      }),
    );
  });
});
