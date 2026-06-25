import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { TwoFactorSetupFlow } from "./TwoFactorSetupFlow";

function renderFlow(onEnabled = vi.fn()) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <TwoFactorSetupFlow onEnabled={onEnabled} />
    </QueryClientProvider>,
  );
}

describe("TwoFactorSetupFlow", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("shows the initial 'Set up 2FA' prompt before a QR code exists", () => {
    renderFlow();

    expect(screen.getByText("Set up 2FA")).toBeInTheDocument();
  });

  it("requests setup and shows the QR code and secret once available", async () => {
    gqlMutate.mockResolvedValueOnce({
      setupTwoFactor: {
        qrCodeUrl: "data:image/png;base64,abc",
        secret: "SECRET123",
      },
    });

    renderFlow();
    fireEvent.click(screen.getByText("Set up 2FA"));

    expect(await screen.findByAltText("2FA QR code")).toHaveAttribute(
      "src",
      "data:image/png;base64,abc",
    );
    fireEvent.click(screen.getByText("Can't scan? Enter code manually"));
    expect(screen.getByText("SECRET123")).toBeInTheDocument();
  });

  it("enables 2FA and passes the backup codes to onEnabled", async () => {
    gqlMutate
      .mockResolvedValueOnce({
        setupTwoFactor: {
          qrCodeUrl: "data:image/png;base64,abc",
          secret: "SECRET123",
        },
      })
      .mockResolvedValueOnce({
        enableTwoFactor: { backupCodes: ["a1", "a2"] },
      });
    const onEnabled = vi.fn();

    renderFlow(onEnabled);
    fireEvent.click(screen.getByText("Set up 2FA"));
    await screen.findByAltText("2FA QR code");

    fireEvent.change(
      screen.getByLabelText("Enter the 6-digit code to confirm"),
      { target: { value: "123456" } },
    );
    fireEvent.click(screen.getByText("Enable 2FA"));

    await waitFor(() => expect(onEnabled).toHaveBeenCalledWith(["a1", "a2"]));
  });

  it("shows the mutation error when enabling fails", async () => {
    gqlMutate
      .mockResolvedValueOnce({
        setupTwoFactor: {
          qrCodeUrl: "data:image/png;base64,abc",
          secret: "SECRET123",
        },
      })
      .mockRejectedValueOnce(new Error("Invalid TOTP code"));

    renderFlow();
    fireEvent.click(screen.getByText("Set up 2FA"));
    await screen.findByAltText("2FA QR code");

    fireEvent.change(
      screen.getByLabelText("Enter the 6-digit code to confirm"),
      { target: { value: "654321" } },
    );
    fireEvent.click(screen.getByText("Enable 2FA"));

    expect(await screen.findByText("Invalid TOTP code")).toBeInTheDocument();
  });
});
