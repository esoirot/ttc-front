import { render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { AuthUser } from "@/types/auth.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { TwoFactorSetupCard } from "./TwoFactorSetupCard";

function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 1,
    email: "a@b.com",
    role: "USER",
    twoFactorEnabled: false,
    ...overrides,
  } as AuthUser;
}

function renderCard() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <TwoFactorSetupCard />
    </QueryClientProvider>,
  );
}

describe("TwoFactorSetupCard", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("shows the setup flow when 2FA is not yet enabled", async () => {
    gqlFetch.mockResolvedValue({ me: makeUser({ twoFactorEnabled: false }) });

    renderCard();

    expect(await screen.findByText("Set up 2FA")).toBeInTheDocument();
  });

  it("shows the enabled view when 2FA is already enabled", async () => {
    gqlFetch.mockResolvedValue({
      me: makeUser({ twoFactorEnabled: true }),
      backupCodeCount: 3,
    });

    renderCard();

    await waitFor(() =>
      expect(
        screen.getByText("Your account is protected with TOTP-based 2FA."),
      ).toBeInTheDocument(),
    );
  });
});
