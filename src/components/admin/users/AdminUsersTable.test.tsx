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

vi.mock("../audits/ResourceAuditHistory", () => ({
  ResourceAuditHistory: ({
    resourceName,
    onClose,
  }: {
    resourceName: string;
    onClose: () => void;
  }) => (
    <div>
      <p>History — {resourceName}</p>
      <button onClick={onClose}>close-history</button>
    </div>
  ),
}));

import { AdminUsersTable } from "./AdminUsersTable";

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
      <AdminUsersTable />
    </QueryClientProvider>,
  );
}

describe("AdminUsersTable", () => {
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

  it("shows the total user count", async () => {
    gqlFetch.mockResolvedValueOnce({
      users: [makeUser(), makeUser({ id: 2 })],
    });
    renderTable();
    expect(await screen.findByText("2 total")).toBeInTheDocument();
  });

  it("shows 'No users found.' when the filtered list is empty", async () => {
    gqlFetch.mockResolvedValueOnce({ users: [] });
    renderTable();
    expect(await screen.findByText("No users found.")).toBeInTheDocument();
  });

  it("filters rows by the search input", async () => {
    gqlFetch.mockResolvedValueOnce({
      users: [
        makeUser({ id: 1, email: "jane@example.com", name: "Jane" }),
        makeUser({ id: 2, email: "bob@example.com", name: "Bob" }),
      ],
    });
    renderTable();
    await screen.findByText("jane@example.com");

    fireEvent.change(screen.getByPlaceholderText("Search email or name..."), {
      target: { value: "jane" },
    });

    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.queryByText("bob@example.com")).not.toBeInTheDocument();
  });

  it("shows permission count or 'All' per row", async () => {
    gqlFetch.mockResolvedValueOnce({
      users: [
        makeUser({
          id: 1,
          email: "jane@example.com",
          adminPermissions: ["MANAGE_USERS"],
        }),
        makeUser({ id: 2, email: "bob@example.com", adminPermissions: [] }),
      ],
    });
    renderTable();
    await screen.findByText("jane@example.com");
    expect(screen.getByText("1 perms")).toBeInTheDocument();
    expect(screen.getByText("All")).toBeInTheDocument();
  });

  it("selects all rows via the header checkbox and deselects via a second click", async () => {
    gqlFetch.mockResolvedValueOnce({
      users: [
        makeUser({ id: 1, email: "jane@example.com" }),
        makeUser({ id: 2, email: "bob@example.com" }),
      ],
    });
    renderTable();
    await screen.findByText("jane@example.com");

    const [headerCheckbox] = screen.getAllByRole("checkbox");
    fireEvent.click(headerCheckbox);
    expect(screen.getByText("2 selected")).toBeInTheDocument();

    fireEvent.click(headerCheckbox);
    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
  });

  it("bulk-deletes selected users, skipping the current user", async () => {
    gqlFetch.mockResolvedValueOnce({
      users: [makeUser({ id: 7 })],
    });
    gqlMutate.mockResolvedValueOnce({ removeUser: { id: 7 } });
    renderTable();
    await screen.findByText("jane@example.com");

    fireEvent.click(screen.getAllByRole("checkbox")[1]!);
    fireEvent.click(screen.getByText("Delete selected (1)"));
    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({ id: 7 }),
    );
  });

  it("opens the edit dialog pre-filled, edits role and permissions, and saves", async () => {
    gqlFetch.mockResolvedValueOnce({
      users: [makeUser({ id: 3, role: "USER", adminPermissions: [] })],
    });
    gqlMutate.mockResolvedValueOnce({
      updateUser: {
        id: 3,
        role: "MANAGER",
        adminPermissions: ["MANAGE_USERS"],
      },
    });
    renderTable();
    await screen.findByText("jane@example.com");

    fireEvent.click(screen.getByRole("button", { name: "Edit user" }));
    expect(screen.getByText("Edit User")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("checkbox")[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({
        updateUserInput: expect.objectContaining({
          id: 3,
          adminPermissions: ["MANAGE_USERS"],
        }),
      }),
    );
  });

  it("cancels the edit dialog without saving", async () => {
    gqlFetch.mockResolvedValueOnce({ users: [makeUser({ id: 3 })] });
    renderTable();
    await screen.findByText("jane@example.com");

    fireEvent.click(screen.getByRole("button", { name: "Edit user" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByText("Edit User")).not.toBeInTheDocument();
    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("opens and closes the resource history dialog for a row", async () => {
    gqlFetch.mockResolvedValueOnce({ users: [makeUser({ id: 3 })] });
    renderTable();
    await screen.findByText("jane@example.com");

    fireEvent.click(screen.getByRole("button", { name: "View history" }));
    expect(screen.getByText(/History — jane@example\.com/)).toBeInTheDocument();

    fireEvent.click(screen.getByText("close-history"));
    expect(
      screen.queryByText(/History — jane@example\.com/),
    ).not.toBeInTheDocument();
  });

  it("shows a Disable 2FA button in the row only when 2FA is enabled", async () => {
    gqlFetch.mockResolvedValueOnce({
      users: [makeUser({ id: 3, twoFactorEnabled: true })],
    });
    renderTable();
    await screen.findByText("jane@example.com");
    expect(screen.getByRole("button", { name: "2FA" })).toBeInTheDocument();
  });

  it("disables 2FA for a row after confirming", async () => {
    const adminDisableTwoFactor = vi.fn().mockResolvedValue(undefined);
    useAdminDisableTwoFactorMock.mockReturnValue({
      adminDisableTwoFactor,
      loading: false,
    });
    gqlFetch.mockResolvedValueOnce({
      users: [makeUser({ id: 8, twoFactorEnabled: true })],
    });
    renderTable();
    await screen.findByText("jane@example.com");

    fireEvent.click(screen.getByRole("button", { name: "2FA" }));
    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Disable 2FA" }),
    );

    await waitFor(() => expect(adminDisableTwoFactor).toHaveBeenCalledWith(8));
  });

  it("deletes a single row via its own confirm dialog", async () => {
    gqlFetch.mockResolvedValueOnce({ users: [makeUser({ id: 4 })] });
    gqlMutate.mockResolvedValueOnce({ removeUser: { id: 4 } });
    renderTable();
    await screen.findByText("jane@example.com");

    fireEvent.click(screen.getByRole("button", { name: "Delete user" }));
    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(gqlMutate.mock.calls[0][1]).toMatchObject({ id: 4 }),
    );
  });
});
