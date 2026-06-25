import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { TwoFactorEnabledView } from "./TwoFactorEnabledView";

function renderView(onCodesRegenerated = vi.fn()) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <TwoFactorEnabledView onCodesRegenerated={onCodesRegenerated} />
    </QueryClientProvider>,
  );
}

describe("TwoFactorEnabledView", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("shows the remaining backup code count", async () => {
    gqlFetch.mockResolvedValueOnce({ backupCodeCount: 5 });

    renderView();

    expect(
      await screen.findByText("5 backup codes remaining"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Low")).not.toBeInTheDocument();
  });

  it("singularizes the count label for exactly 1 code", async () => {
    gqlFetch.mockResolvedValueOnce({ backupCodeCount: 1 });

    renderView();

    expect(
      await screen.findByText("1 backup code remaining"),
    ).toBeInTheDocument();
  });

  it("shows a Low badge when 2 or fewer codes remain", async () => {
    gqlFetch.mockResolvedValueOnce({ backupCodeCount: 2 });

    renderView();

    await screen.findByText("2 backup codes remaining");
    expect(screen.getByText("Low")).toBeInTheDocument();
  });

  it("toggles to the regenerate form and back", async () => {
    gqlFetch.mockResolvedValueOnce({ backupCodeCount: 5 });

    renderView();

    await screen.findByText("5 backup codes remaining");
    fireEvent.click(screen.getByText("Regenerate backup codes"));

    expect(
      screen.getByLabelText(
        "Enter your 6-digit authenticator code to regenerate backup codes",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.getByText("Regenerate backup codes")).toBeInTheDocument();
  });

  it("regenerates codes and calls onCodesRegenerated with the new codes", async () => {
    gqlFetch.mockResolvedValueOnce({ backupCodeCount: 1 });
    gqlMutate.mockResolvedValueOnce({
      regenerateBackupCodes: { backupCodes: ["x1", "x2"] },
    });
    const onCodesRegenerated = vi.fn();

    renderView(onCodesRegenerated);

    await screen.findByText("1 backup code remaining");
    fireEvent.click(screen.getByText("Regenerate backup codes"));

    const input = screen.getByLabelText(
      "Enter your 6-digit authenticator code to regenerate backup codes",
    );
    fireEvent.change(input, { target: { value: "123456" } });
    fireEvent.click(screen.getByText("Regenerate codes"));

    await waitFor(() =>
      expect(onCodesRegenerated).toHaveBeenCalledWith(["x1", "x2"]),
    );
  });

  it("shows the mutation error on a failed regeneration", async () => {
    gqlFetch.mockResolvedValueOnce({ backupCodeCount: 1 });
    gqlMutate.mockRejectedValueOnce(new Error("Invalid code"));

    renderView();

    await screen.findByText("1 backup code remaining");
    fireEvent.click(screen.getByText("Regenerate backup codes"));

    const input = screen.getByLabelText(
      "Enter your 6-digit authenticator code to regenerate backup codes",
    );
    fireEvent.change(input, { target: { value: "123456" } });
    fireEvent.click(screen.getByText("Regenerate codes"));

    expect(await screen.findByText("Invalid code")).toBeInTheDocument();
  });
});
