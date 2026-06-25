import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createQueryClient,
  createQueryWrapper,
} from "@/test/queryClientWrapper";
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

import { useProfileForm } from "./useProfileForm";

function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 1,
    email: "alice@example.com",
    role: "USER",
    name: "Alice Smith",
    firstName: "Alice",
    lastName: "Smith",
    twoFactorEnabled: false,
    defaultCurrency: "EUR",
    logoUrl: null,
    mobilePhone: "+1234",
    jobTitle: "Translator",
    interfaceLanguage: "en",
    dateFormat: "DD/MM/YYYY",
    hourFormat: "24h",
    numberFormat: "1,234.56",
    ...overrides,
  } as AuthUser;
}

function setupWithUser(user: AuthUser) {
  const queryClient = createQueryClient();
  queryClient.setQueryData(["me"], user);
  return renderHook(() => useProfileForm(), {
    wrapper: createQueryWrapper(queryClient),
  });
}

describe("useProfileForm", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes fields from the current user", () => {
    const user = makeUser();
    const { result } = setupWithUser(user);

    expect(result.current.firstName).toBe("Alice");
    expect(result.current.lastName).toBe("Smith");
    expect(result.current.email).toBe("alice@example.com");
    expect(result.current.mobilePhone).toBe("+1234");
    expect(result.current.jobTitle).toBe("Translator");
    expect(result.current.defaultCurrency).toBe("EUR");
    expect(result.current.interfaceLanguage).toBe("en");
    expect(result.current.dateFormat).toBe("DD/MM/YYYY");
    expect(result.current.hourFormat).toBe("24h");
    expect(result.current.numberFormat).toBe("1,234.56");
    expect(result.current.saved).toBe(false);
  });

  it("falls back to defaults when fields are null/missing", () => {
    const user = makeUser({
      firstName: null,
      lastName: null,
      mobilePhone: null,
      jobTitle: null,
      logoUrl: null,
      interfaceLanguage: null,
      dateFormat: null,
      hourFormat: null,
      numberFormat: null,
    });
    const { result } = setupWithUser(user);

    expect(result.current.firstName).toBe("");
    expect(result.current.lastName).toBe("");
    expect(result.current.mobilePhone).toBe("");
    expect(result.current.jobTitle).toBe("");
    expect(result.current.logoUrl).toBe("");
    expect(result.current.interfaceLanguage).toBe("en");
    expect(result.current.dateFormat).toBe("DD/MM/YYYY");
    expect(result.current.hourFormat).toBe("24h");
    expect(result.current.numberFormat).toBe("1,234.56");
  });

  it("setters update each field independently", () => {
    const { result } = setupWithUser(makeUser());

    act(() => {
      result.current.setFirstName("Bob");
      result.current.setLastName("Jones");
      result.current.setEmail("bob@example.com");
      result.current.setDefaultCurrency("USD");
    });

    expect(result.current.firstName).toBe("Bob");
    expect(result.current.lastName).toBe("Jones");
    expect(result.current.email).toBe("bob@example.com");
    expect(result.current.defaultCurrency).toBe("USD");
  });

  it("handleSaveProfile joins first/last into name and trims fields", async () => {
    gqlMutate.mockResolvedValueOnce({ updateMe: makeUser() });
    const { result } = setupWithUser(makeUser());

    act(() => {
      result.current.setFirstName("  Bob  ");
      result.current.setLastName("  Jones  ");
      result.current.setEmail("  bob@example.com  ");
      result.current.setMobilePhone("  555  ");
      result.current.setJobTitle("  Dev  ");
    });
    await act(async () => {
      await result.current.handleSaveProfile({
        preventDefault: () => {},
      } as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), {
      input: expect.objectContaining({
        name: "Bob Jones",
        email: "bob@example.com",
        firstName: "Bob",
        lastName: "Jones",
        mobilePhone: "555",
        jobTitle: "Dev",
      }),
    });
  });

  it("handleSaveProfile sends undefined name when first and last are both blank", async () => {
    gqlMutate.mockResolvedValueOnce({ updateMe: makeUser() });
    const { result } = setupWithUser(makeUser());

    act(() => {
      result.current.setFirstName("   ");
      result.current.setLastName("   ");
    });
    await act(async () => {
      await result.current.handleSaveProfile({
        preventDefault: () => {},
      } as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), {
      input: expect.objectContaining({
        name: undefined,
        firstName: null,
        lastName: null,
      }),
    });
  });

  it("handleSaveProfile sets saved true, then false after 3s", async () => {
    vi.useFakeTimers();
    gqlMutate.mockResolvedValueOnce({ updateMe: makeUser() });
    const { result } = setupWithUser(makeUser());

    await act(async () => {
      await result.current.handleSaveProfile({
        preventDefault: () => {},
      } as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.saved).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.saved).toBe(false);
  });

  it("handleSaveProfile prevents the default form submission", async () => {
    gqlMutate.mockResolvedValueOnce({ updateMe: makeUser() });
    const { result } = setupWithUser(makeUser());
    const preventDefault = vi.fn();

    await act(async () => {
      await result.current.handleSaveProfile({
        preventDefault,
      } as unknown as React.FormEvent<HTMLFormElement>);
    });

    expect(preventDefault).toHaveBeenCalled();
  });
});
