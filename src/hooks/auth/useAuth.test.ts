import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/test/queryClientWrapper";
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

import { useCurrentUser, useLogin } from "./useAuth";

function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 1,
    email: "a@b.com",
    role: "USER",
    name: "Alice",
    firstName: "Alice",
    lastName: null,
    twoFactorEnabled: false,
    defaultCurrency: "EUR",
    logoUrl: null,
    mobilePhone: null,
    jobTitle: null,
    interfaceLanguage: "en",
    dateFormat: "DD/MM/YYYY",
    hourFormat: "24h",
    numberFormat: "1,234.56",
    ...overrides,
  } as AuthUser;
}

describe("useCurrentUser", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("returns the user once the query resolves", async () => {
    const user = makeUser();
    gqlFetch.mockResolvedValueOnce({ me: user });

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toEqual(user);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("treats a null me response as unauthenticated", async () => {
    gqlFetch.mockResolvedValueOnce({ me: null });

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("swallows query errors and reports unauthenticated", async () => {
    gqlFetch.mockRejectedValueOnce(new Error("network down"));

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});

describe("useLogin", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs in and writes the user into the 'me' cache when 2FA is not required", async () => {
    const user = makeUser();
    gqlMutate.mockResolvedValueOnce({
      login: { user, requiresTwoFactor: false, tempToken: null },
    });

    const { result } = renderHook(
      () => ({ login: useLogin(), me: useCurrentUser() }),
      { wrapper: createQueryWrapper() },
    );

    const loginResult = await result.current.login.login("a@b.com", "password");

    expect(loginResult).toEqual({
      user,
      requiresTwoFactor: false,
      tempToken: null,
    });
    await waitFor(() => expect(result.current.me.user).toEqual(user));
  });

  it("does not seed the 'me' cache when 2FA is required", async () => {
    const user = makeUser();
    gqlMutate.mockResolvedValueOnce({
      login: { user, requiresTwoFactor: true, tempToken: "temp-123" },
    });
    gqlFetch.mockResolvedValue({ me: null });

    const { result } = renderHook(
      () => ({ login: useLogin(), me: useCurrentUser() }),
      { wrapper: createQueryWrapper() },
    );

    await result.current.login.login("a@b.com", "password");

    await waitFor(() => expect(result.current.me.loading).toBe(false));
    expect(result.current.me.user).toBeNull();
  });

  it("exposes the mutation error on failure", async () => {
    gqlMutate.mockRejectedValueOnce(new Error("invalid credentials"));

    const { result } = renderHook(() => useLogin(), {
      wrapper: createQueryWrapper(),
    });

    await expect(result.current.login("a@b.com", "wrong")).rejects.toThrow(
      "invalid credentials",
    );
  });
});
