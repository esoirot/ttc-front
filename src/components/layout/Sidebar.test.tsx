import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { createQueryClient } from "@/test/queryClientWrapper";
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

import { Sidebar } from "./Sidebar";

function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 1,
    email: "a@b.com",
    role: "USER",
    name: "Alice",
    ...overrides,
  } as AuthUser;
}

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe("Sidebar", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("hides the Admin nav item for non-admin users", async () => {
    gqlFetch.mockResolvedValue({ me: makeUser({ role: "USER" }) });

    render(<Sidebar />, { wrapper });

    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });

  it("shows the Admin nav item for admin users", async () => {
    gqlFetch.mockResolvedValue({ me: makeUser({ role: "ADMIN" }) });

    render(<Sidebar />, { wrapper });

    expect(await screen.findByText("Admin")).toBeInTheDocument();
  });

  it("falls back to email when the user has no name", async () => {
    gqlFetch.mockResolvedValue({ me: makeUser({ name: null }) });

    render(<Sidebar />, { wrapper });

    expect(await screen.findByText("a@b.com")).toBeInTheDocument();
  });

  it("shows the role badge", async () => {
    gqlFetch.mockResolvedValue({ me: makeUser({ role: "MANAGER" }) });

    render(<Sidebar />, { wrapper });

    expect(await screen.findByText("MANAGER")).toBeInTheDocument();
  });

  it("calls logout and shows the signing-out state when the sign-out button is clicked", async () => {
    gqlFetch.mockResolvedValue({ me: makeUser() });
    gqlMutate.mockImplementation(() => new Promise(() => {}));

    render(<Sidebar />, { wrapper });

    await screen.findByText("Alice");
    fireEvent.click(screen.getByText("Sign out"));

    await waitFor(() => expect(gqlMutate).toHaveBeenCalled());
    expect(await screen.findByText("Signing out…")).toBeInTheDocument();
  });

  it("renders all main nav links", async () => {
    gqlFetch.mockResolvedValue({ me: makeUser() });

    render(<Sidebar />, { wrapper });

    await screen.findByText("Alice");
    for (const label of [
      "Dashboard",
      "Clients",
      "Projects",
      "Time",
      "My Activity",
      "Invoices",
      "Rates",
      "HubSpot",
      "Clockify",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });
});
