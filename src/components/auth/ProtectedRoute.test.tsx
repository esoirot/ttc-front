import { render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { AuthUser } from "@/types/auth.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { ProtectedRoute } from "./ProtectedRoute";

function renderAt(path: string) {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<div>Dashboard page</div>} />
            <Route path="/clients" element={<div>Clients page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 1,
    email: "a@b.com",
    role: "USER",
    name: "Alice",
    ...overrides,
  } as AuthUser;
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("shows a loading state before the auth check resolves", () => {
    gqlFetch.mockImplementation(() => new Promise(() => {}));

    renderAt("/");

    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("redirects to /login when unauthenticated", async () => {
    gqlFetch.mockResolvedValueOnce({ me: null });

    renderAt("/clients");

    expect(await screen.findByText("Login page")).toBeInTheDocument();
  });

  it("renders the outlet when authenticated", async () => {
    gqlFetch.mockResolvedValueOnce({ me: makeUser() });

    renderAt("/clients");

    expect(await screen.findByText("Clients page")).toBeInTheDocument();
  });

  it("navigates to a fresh, valid oauth_from destination once authenticated", async () => {
    sessionStorage.setItem(
      "oauth_from",
      JSON.stringify({ dest: "/clients", ts: Date.now() }),
    );
    gqlFetch.mockResolvedValueOnce({ me: makeUser() });

    renderAt("/");

    expect(await screen.findByText("Clients page")).toBeInTheDocument();
    expect(sessionStorage.getItem("oauth_from")).toBeNull();
  });

  it("ignores a stale (60s+) oauth_from destination", async () => {
    sessionStorage.setItem(
      "oauth_from",
      JSON.stringify({ dest: "/clients", ts: Date.now() - 61_000 }),
    );
    gqlFetch.mockResolvedValueOnce({ me: makeUser() });

    renderAt("/");

    expect(await screen.findByText("Dashboard page")).toBeInTheDocument();
    await waitFor(() =>
      expect(sessionStorage.getItem("oauth_from")).toBeNull(),
    );
  });

  it("ignores a malformed oauth_from value without crashing", async () => {
    sessionStorage.setItem("oauth_from", "not-json");
    gqlFetch.mockResolvedValueOnce({ me: makeUser() });

    renderAt("/");

    expect(await screen.findByText("Dashboard page")).toBeInTheDocument();
  });

  it("does not redirect when oauth_from dest matches the current path", async () => {
    sessionStorage.setItem(
      "oauth_from",
      JSON.stringify({ dest: "/", ts: Date.now() }),
    );
    gqlFetch.mockResolvedValueOnce({ me: makeUser() });

    renderAt("/");

    expect(await screen.findByText("Dashboard page")).toBeInTheDocument();
  });
});
