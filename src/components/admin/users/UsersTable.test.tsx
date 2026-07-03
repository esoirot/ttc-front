import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { User } from "@/types/users.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));
vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

const useCurrentUserMock = vi.fn();
const useAdminDisableTwoFactorMock = vi.fn();
vi.mock("@/hooks/auth/useAuth", () => ({
  useCurrentUser: () => useCurrentUserMock(),
  useAdminDisableTwoFactor: () => useAdminDisableTwoFactorMock(),
}));

import { UsersTable } from "./UsersTable";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    email: "jane@example.com",
    name: "Jane Doe",
    role: "USER",
    twoFactorEnabled: false,
    adminPermissions: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function renderTable() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <UsersTable />
    </QueryClientProvider>,
  );
}

describe("UsersTable", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    useCurrentUserMock.mockReset();
    useAdminDisableTwoFactorMock.mockReset();
    useCurrentUserMock.mockReturnValue({
      user: makeUser({ id: 99 }),
      loading: false,
    });
    useAdminDisableTwoFactorMock.mockReturnValue({
      adminDisableTwoFactor: vi.fn().mockResolvedValue(undefined),
      loading: false,
    });
  });

  it("shows loading skeletons while loading", () => {
    gqlFetch.mockReturnValue(new Promise(() => {}));
    renderTable();
    expect(screen.queryByText("Email")).not.toBeInTheDocument();
  });

  it("shows 'No users' when the list is empty", async () => {
    gqlFetch.mockResolvedValueOnce({ users: [] });
    renderTable();
    expect(await screen.findByText("No users")).toBeInTheDocument();
  });

  it("renders a row per user with email, name, and creation date", async () => {
    gqlFetch.mockResolvedValueOnce({
      users: [makeUser({ name: null, createdAt: "2026-03-15T00:00:00.000Z" })],
    });
    renderTable();
    expect(await screen.findByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByText("2026-03-15")).toBeInTheDocument();
  });

  it("shows 2FA Enabled/Disabled badge", async () => {
    gqlFetch.mockResolvedValueOnce({
      users: [makeUser({ twoFactorEnabled: true })],
    });
    renderTable();
    expect(await screen.findByText("Enabled")).toBeInTheDocument();
  });

  it("shows the role select value for each user", async () => {
    gqlFetch.mockResolvedValueOnce({
      users: [makeUser({ role: "MANAGER" })],
    });
    renderTable();
    expect(await screen.findByText("MANAGER")).toBeInTheDocument();
  });

  it("only shows a Disable 2FA button when the user has 2FA enabled", async () => {
    gqlFetch.mockResolvedValueOnce({
      users: [makeUser({ twoFactorEnabled: false })],
    });
    renderTable();
    await screen.findByText("jane@example.com");
    expect(
      screen.queryByRole("button", { name: "Disable 2FA" }),
    ).not.toBeInTheDocument();
  });

  it("disables 2FA for a user after confirming", async () => {
    const adminDisableTwoFactor = vi.fn().mockResolvedValue(undefined);
    useAdminDisableTwoFactorMock.mockReturnValue({
      adminDisableTwoFactor,
      loading: false,
    });
    gqlFetch.mockResolvedValueOnce({
      users: [makeUser({ id: 5, twoFactorEnabled: true })],
    });
    renderTable();
    await screen.findByText("jane@example.com");

    fireEvent.click(screen.getByRole("button", { name: "Disable 2FA" }));
    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Disable 2FA" }),
    );

    await waitFor(() => expect(adminDisableTwoFactor).toHaveBeenCalledWith(5));
  });

  it("disables the Delete button for the currently logged-in user", async () => {
    useCurrentUserMock.mockReturnValue({
      user: makeUser({ id: 1 }),
      loading: false,
    });
    gqlFetch.mockResolvedValueOnce({ users: [makeUser({ id: 1 })] });
    renderTable();
    await screen.findByText("jane@example.com");
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
  });

  it("deletes a user after confirming in the alert dialog", async () => {
    gqlFetch.mockResolvedValueOnce({ users: [makeUser({ id: 6 })] });
    gqlMutate.mockResolvedValueOnce({ removeUser: { id: 6 } });
    renderTable();
    await screen.findByText("jane@example.com");

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({ id: 6 }),
    );
  });
});
