import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUser } from "@/types/auth.types";

const useCurrentUserMock = vi.fn();
vi.mock("@/hooks/auth/useAuth", () => ({
  useCurrentUser: () => useCurrentUserMock(),
}));

import { AdminSidebar } from "./AdminSidebar";

function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: "1",
    email: "jane@example.com",
    name: "Jane Doe",
    role: "ADMIN",
    twoFactorEnabled: false,
    logoUrl: null,
    defaultCurrency: "EUR",
    adminPermissions: [],
    ...overrides,
  };
}

function renderSidebar() {
  return render(
    <MemoryRouter>
      <AdminSidebar />
    </MemoryRouter>,
  );
}

describe("AdminSidebar", () => {
  beforeEach(() => {
    useCurrentUserMock.mockReset();
  });

  it("shows all resource links for a superadmin (empty permissions)", () => {
    useCurrentUserMock.mockReturnValue({
      user: makeUser({ adminPermissions: [] }),
    });
    renderSidebar();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Clients")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Invoices")).toBeInTheDocument();
    expect(screen.getByText("Time Entries")).toBeInTheDocument();
    expect(screen.getByText("Rates")).toBeInTheDocument();
  });

  it("shows the system links regardless of permissions", () => {
    useCurrentUserMock.mockReturnValue({
      user: makeUser({ adminPermissions: [] }),
    });
    renderSidebar();
    expect(screen.getByText("Audit Log")).toBeInTheDocument();
    expect(screen.getByText("HubSpot")).toBeInTheDocument();
    expect(screen.getByText("Activity Log")).toBeInTheDocument();
  });

  it("filters resource links to only the user's granted permissions", () => {
    useCurrentUserMock.mockReturnValue({
      user: makeUser({ adminPermissions: ["MANAGE_USERS"] }),
    });
    renderSidebar();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.queryByText("Clients")).not.toBeInTheDocument();
    expect(screen.queryByText("Projects")).not.toBeInTheDocument();
  });

  it("shows the Dashboard link in the Overview group", () => {
    useCurrentUserMock.mockReturnValue({ user: makeUser() });
    renderSidebar();
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("shows the user's email and role in the footer when logged in", () => {
    useCurrentUserMock.mockReturnValue({
      user: makeUser({ email: "admin@example.com", role: "ADMIN" }),
    });
    renderSidebar();
    expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    expect(screen.getByText("ADMIN")).toBeInTheDocument();
  });

  it("does not show the footer when there is no user", () => {
    useCurrentUserMock.mockReturnValue({ user: null });
    renderSidebar();
    expect(screen.queryByText(/@/)).not.toBeInTheDocument();
  });

  it("shows the Admin header and a link back to the app", () => {
    useCurrentUserMock.mockReturnValue({ user: makeUser() });
    renderSidebar();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("← Back to app")).toBeInTheDocument();
  });
});
