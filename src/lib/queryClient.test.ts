import { beforeEach, describe, expect, it, vi } from "vitest";

const { toastError, replaceLocation, currentPathname } = vi.hoisted(() => ({
  toastError: vi.fn(),
  replaceLocation: vi.fn(),
  currentPathname: vi.fn(() => "/"),
}));
vi.mock("sonner", () => ({ toast: { error: toastError } }));
vi.mock("@/lib/navigation", () => ({ replaceLocation, currentPathname }));

import { ApiError } from "./api";
import { createAppQueryClient } from "./queryClient";

describe("createAppQueryClient", () => {
  beforeEach(() => {
    toastError.mockReset();
  });

  it("shows a failed mutation's error message in a toast instead of failing silently", async () => {
    const qc = createAppQueryClient();
    const mutation = qc.getMutationCache().build(qc, {
      mutationFn: () => Promise.reject(new Error("Field 'x' is not defined")),
    });

    await mutation.execute(undefined).catch(() => {});

    expect(toastError).toHaveBeenCalledWith("Field 'x' is not defined");
  });

  it("skips the toast for mutations whose form already shows the error inline", async () => {
    const qc = createAppQueryClient();
    const mutation = qc.getMutationCache().build(qc, {
      mutationFn: () => Promise.reject(new Error("Invalid credentials")),
      meta: { inlineError: true },
    });

    await mutation.execute(undefined).catch(() => {});

    expect(toastError).not.toHaveBeenCalled();
  });
});

describe("createAppQueryClient auth handling", () => {
  function setPath(pathname: string) {
    currentPathname.mockReturnValue(pathname);
  }

  async function failQuery(queryKey: unknown[], error: Error) {
    const qc = createAppQueryClient();
    await qc
      .fetchQuery({
        queryKey,
        queryFn: () => Promise.reject(error),
        retry: false,
      })
      .catch(() => {});
  }

  beforeEach(() => replaceLocation.mockClear());

  it("sends the user to /login when a protected query gets a 401", async () => {
    setPath("/clients");
    await failQuery(["clients"], new ApiError(401, "Unauthorized"));
    expect(replaceLocation).toHaveBeenCalledWith("/login");
  });

  it("does not redirect for the me query, which is how logged-out state is detected", async () => {
    setPath("/clients");
    await failQuery(["me"], new ApiError(401, "Unauthorized"));
    expect(replaceLocation).not.toHaveBeenCalled();
  });

  it.each([
    "/login",
    "/register",
    "/2fa/verify",
    "/forgot-password",
    "/reset-password",
  ])("does not redirect while already on the public page %s", async (path) => {
    setPath(path);
    await failQuery(["clients"], new ApiError(401, "Unauthorized"));
    expect(replaceLocation).not.toHaveBeenCalled();
  });

  it("does not redirect for non-401 errors", async () => {
    setPath("/clients");
    await failQuery(["clients"], new ApiError(500, "Boom"));
    expect(replaceLocation).not.toHaveBeenCalled();
  });

  it("never retries 401/403, retries other failures up to twice", () => {
    const retry = createAppQueryClient().getDefaultOptions().queries?.retry as (
      count: number,
      error: Error,
    ) => boolean;

    expect(retry(0, new ApiError(401, "x"))).toBe(false);
    expect(retry(0, new ApiError(403, "x"))).toBe(false);
    expect(retry(0, new ApiError(500, "x"))).toBe(true);
    expect(retry(1, new Error("network"))).toBe(true);
    expect(retry(2, new Error("network"))).toBe(false);
  });
});
