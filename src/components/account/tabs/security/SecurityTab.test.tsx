import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createQueryClient,
  createQueryWrapper,
} from "@/test/queryClientWrapper";
import type { AuthUser } from "@/types/auth.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({
  gqlFetch,
  gqlMutate,
  apolloClient: { clearStore: vi.fn() },
}));

import { SecurityTab } from "./SecurityTab";

function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 1,
    email: "alice@example.com",
    role: "USER",
    name: "Alice",
    twoFactorEnabled: false,
    defaultCurrency: "EUR",
    logoUrl: null,
    ...overrides,
  } as AuthUser;
}

function renderTab(user: AuthUser = makeUser()) {
  const queryClient = createQueryClient();
  queryClient.setQueryData(["me"], user);
  return render(<SecurityTab />, { wrapper: createQueryWrapper(queryClient) });
}

describe("SecurityTab — 2FA setup (not yet enabled)", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("shows the 'Set up 2FA' prompt when 2FA is disabled", () => {
    renderTab(makeUser({ twoFactorEnabled: false }));

    expect(
      screen.getByRole("button", { name: "Set up 2FA" }),
    ).toBeInTheDocument();
  });

  it("requests a QR code and shows it once setup resolves", async () => {
    gqlMutate.mockResolvedValueOnce({
      setupTwoFactor: {
        qrCodeUrl: "data:image/png;base64,xyz",
        secret: "ABC123",
      },
    });
    renderTab();

    fireEvent.click(screen.getByRole("button", { name: "Set up 2FA" }));

    expect(await screen.findByAltText("2FA QR code")).toHaveAttribute(
      "src",
      "data:image/png;base64,xyz",
    );
    fireEvent.click(screen.getByText("Can't scan? Enter code manually"));
    expect(screen.getByText("ABC123")).toBeInTheDocument();
  });

  it("disables Enable 2FA until a 6-digit code is entered, then submits it", async () => {
    gqlMutate
      .mockResolvedValueOnce({
        setupTwoFactor: {
          qrCodeUrl: "data:image/png;base64,xyz",
          secret: "ABC123",
        },
      })
      .mockResolvedValueOnce({ enableTwoFactor: { backupCodes: ["a"] } });
    renderTab();

    fireEvent.click(screen.getByRole("button", { name: "Set up 2FA" }));
    await screen.findByAltText("2FA QR code");

    const enableButton = screen.getByRole("button", { name: "Enable 2FA" });
    expect(enableButton).toBeDisabled();

    fireEvent.change(
      screen.getByLabelText("Enter the 6-digit code to confirm"),
      { target: { value: "123456" } },
    );
    expect(enableButton).not.toBeDisabled();

    fireEvent.click(enableButton);

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenLastCalledWith(expect.anything(), {
        code: "123456",
      }),
    );
    expect(await screen.findByText("✓ Enabled")).toBeInTheDocument();
  });

  it("shows the enable error message when the mutation rejects", async () => {
    gqlMutate
      .mockResolvedValueOnce({
        setupTwoFactor: {
          qrCodeUrl: "data:image/png;base64,xyz",
          secret: "ABC123",
        },
      })
      .mockRejectedValueOnce(new Error("Invalid code"));
    renderTab();

    fireEvent.click(screen.getByRole("button", { name: "Set up 2FA" }));
    await screen.findByAltText("2FA QR code");
    fireEvent.change(
      screen.getByLabelText("Enter the 6-digit code to confirm"),
      { target: { value: "111111" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Enable 2FA" }));

    expect(await screen.findByText("Invalid code")).toBeInTheDocument();
  });
});

describe("SecurityTab — 2FA already enabled", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("shows the Enabled badge and a Disable 2FA link", () => {
    renderTab(makeUser({ twoFactorEnabled: true }));

    expect(screen.getByText("✓ Enabled")).toBeInTheDocument();
    expect(screen.getByText("Disable 2FA…")).toBeInTheDocument();
  });

  it("opens the disable form and requires a 6-digit code before submitting", async () => {
    gqlMutate.mockResolvedValueOnce({ disableTwoFactor: true });
    renderTab(makeUser({ twoFactorEnabled: true }));

    fireEvent.click(screen.getByText("Disable 2FA…"));
    const disableButton = screen.getByRole("button", { name: "Disable 2FA" });
    expect(disableButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Authenticator code"), {
      target: { value: "654321" },
    });
    expect(disableButton).not.toBeDisabled();
    fireEvent.click(disableButton);

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), {
        code: "654321",
      }),
    );
  });

  it("Cancel closes the disable form", () => {
    renderTab(makeUser({ twoFactorEnabled: true }));

    fireEvent.click(screen.getByText("Disable 2FA…"));
    fireEvent.click(screen.getByText("Cancel"));

    expect(
      screen.queryByLabelText("Authenticator code"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Disable 2FA…")).toBeInTheDocument();
  });
});

describe("SecurityTab — change password", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("shows a local error and does not submit when passwords don't match", () => {
    renderTab();

    fireEvent.change(screen.getByLabelText("Current password"), {
      target: { value: "current123" },
    });
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "newpassword1" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "different1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    expect(screen.getByText("New passwords do not match.")).toBeInTheDocument();
    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("submits matching passwords and shows the saved confirmation", async () => {
    gqlMutate.mockResolvedValueOnce({ changePassword: true });
    renderTab();

    fireEvent.change(screen.getByLabelText("Current password"), {
      target: { value: "current123" },
    });
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "newpassword1" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "newpassword1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), {
        currentPassword: "current123",
        newPassword: "newpassword1",
      }),
    );
    expect(await screen.findByText("Password updated.")).toBeInTheDocument();
    expect(screen.getByLabelText("Current password")).toHaveValue("");
  });

  it("shows the mutation error message when changePassword rejects", async () => {
    gqlMutate.mockRejectedValueOnce(new Error("Wrong current password"));
    renderTab();

    fireEvent.change(screen.getByLabelText("Current password"), {
      target: { value: "wrong" },
    });
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "newpassword1" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "newpassword1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));

    expect(
      await screen.findByText("Wrong current password"),
    ).toBeInTheDocument();
  });
});

describe("SecurityTab — delete account", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    localStorage.clear();
  });

  it("deletes the account when the confirm dialog is accepted", async () => {
    gqlMutate.mockResolvedValueOnce({ deleteAccount: true });
    renderTab();

    fireEvent.click(screen.getByRole("button", { name: "Delete account" }));
    const confirmButtons = screen.getAllByRole("button", {
      name: "Delete account",
    });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);

    await waitFor(() => expect(gqlMutate).toHaveBeenCalled());
    await waitFor(() =>
      expect(localStorage.getItem("ttc_logout")).not.toBeNull(),
    );
  });

  it("does not delete when the dialog is cancelled", () => {
    renderTab();

    fireEvent.click(screen.getByRole("button", { name: "Delete account" }));
    fireEvent.click(screen.getByText("Cancel"));

    expect(gqlMutate).not.toHaveBeenCalled();
  });
});
