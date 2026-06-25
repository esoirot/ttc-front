import { fireEvent, render, screen } from "@testing-library/react";
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
const { apiGet, apiPost, apiPatch, apiDelete } = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPatch: vi.fn(),
  apiDelete: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({
  gqlFetch,
  gqlMutate,
  apolloClient: { clearStore: vi.fn() },
}));
vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return { ...actual, apiGet, apiPost, apiPatch, apiDelete };
});

import { EditProfileTabs } from "./EditProfileTabs";

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

function renderTabs() {
  const queryClient = createQueryClient();
  queryClient.setQueryData(["me"], makeUser());
  return render(<EditProfileTabs />, {
    wrapper: createQueryWrapper(queryClient),
  });
}

describe("EditProfileTabs", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    apiGet.mockReset();
    apiPost.mockReset();
    apiPatch.mockReset();
    apiDelete.mockReset();
    apiGet.mockResolvedValue({ connected: false });
  });

  it("shows the Profile tab by default", () => {
    renderTabs();

    expect(screen.getByLabelText("First name")).toBeInTheDocument();
  });

  it("switches to the Security tab", () => {
    renderTabs();

    fireEvent.focus(screen.getByRole("tab", { name: "Security" }));

    expect(screen.getByText("Two-factor authentication")).toBeInTheDocument();
    expect(screen.queryByLabelText("First name")).not.toBeInTheDocument();
  });

  it("switches to the Clockify tab", async () => {
    renderTabs();

    fireEvent.focus(screen.getByRole("tab", { name: "Clockify" }));

    expect(
      await screen.findByText(
        "Connect your Clockify account to enable time tracking.",
      ),
    ).toBeInTheDocument();
  });

  it("switches to the HubSpot tab", async () => {
    renderTabs();

    fireEvent.focus(screen.getByRole("tab", { name: "HubSpot" }));

    expect(
      await screen.findByText(
        "Connect your HubSpot account to sync contacts, companies, and deals.",
      ),
    ).toBeInTheDocument();
  });
});
