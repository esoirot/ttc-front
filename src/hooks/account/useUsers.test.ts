import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createQueryClient,
  createQueryWrapper,
} from "@/test/queryClientWrapper";
import type { User } from "@/types/users.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { useDeleteUser, useUpdateUser, useUsers } from "./useUsers";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    email: "a@b.com",
    name: "Alice",
    role: "USER",
    twoFactorEnabled: false,
    adminPermissions: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("useUsers", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("returns the fetched users", async () => {
    const user = makeUser();
    gqlFetch.mockResolvedValueOnce({ users: [user] });

    const { result } = renderHook(() => useUsers(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.users).toEqual([user]);
  });
});

describe("useUpdateUser", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("merges the updated fields into the cached users list", async () => {
    gqlMutate.mockResolvedValueOnce({
      updateUser: { id: 2, role: "ADMIN", adminPermissions: [] },
    });
    const queryClient = createQueryClient();
    queryClient.setQueryData(
      ["users"],
      [makeUser({ id: 2, role: "USER", name: "Bob" })],
    );

    const { result } = renderHook(() => useUpdateUser(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.updateUser({ id: 2, role: "ADMIN" });

    const users = queryClient.getQueryData<User[]>(["users"]);
    expect(users?.[0].role).toBe("ADMIN");
    expect(users?.[0].name).toBe("Bob");
  });
});

describe("useDeleteUser", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("removes the deleted user from the cached users list", async () => {
    gqlMutate.mockResolvedValueOnce({ removeUser: { id: 3 } });
    const queryClient = createQueryClient();
    queryClient.setQueryData(
      ["users"],
      [makeUser({ id: 3 }), makeUser({ id: 4 })],
    );

    const { result } = renderHook(() => useDeleteUser(), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.deleteUser(3);

    const users = queryClient.getQueryData<User[]>(["users"]);
    expect(users?.map((u) => u.id)).toEqual([4]);
  });
});
