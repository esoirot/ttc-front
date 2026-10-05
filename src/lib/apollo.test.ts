import { gql } from "@apollo/client/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { tryRefresh, replaceLocation, currentPathname } = vi.hoisted(() => ({
  tryRefresh: vi.fn(),
  replaceLocation: vi.fn(),
  currentPathname: vi.fn(() => "/"),
}));
vi.mock("./api", () => ({ tryRefresh }));
vi.mock("./navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./navigation")>()),
  replaceLocation,
  currentPathname,
}));

import { gqlFetch, gqlMutate } from "./apollo";

const TEST_QUERY = gql`
  query TestQuery($id: Int) {
    test(id: $id)
  }
`;

const TEST_MUTATION = gql`
  mutation TestMutation($value: String!) {
    setTest(value: $value)
  }
`;

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("gqlFetch / gqlMutate", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("gqlFetch resolves with the data payload on success", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { data: { test: "ok" } }),
    );

    const result = await gqlFetch<{ test: string }>(TEST_QUERY);

    expect(result).toEqual({ test: "ok" });
  });

  it("gqlFetch posts to the configured API URL with credentials included", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { data: { test: "ok" } }),
    );

    await gqlFetch(TEST_QUERY);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:3000/graphql");
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("include");
  });

  it("gqlFetch passes variables through in the request body", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { data: { test: "ok" } }),
    );

    await gqlFetch(TEST_QUERY, { id: 5 });

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body as string);
    expect(body.variables).toEqual({ id: 5 });
  });

  it("gqlFetch rejects when the server returns GraphQL errors", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, {
        data: null,
        errors: [{ message: "Not found" }],
      }),
    );

    await expect(gqlFetch(TEST_QUERY)).rejects.toThrow();
  });

  it("gqlMutate resolves with the mutation result on success", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(200, { data: { setTest: true } }),
    );

    const result = await gqlMutate<{ setTest: boolean }>(TEST_MUTATION, {
      value: "x",
    });

    expect(result).toEqual({ setTest: true });
  });
});

describe("expired session handling", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, {
        data: null,
        errors: [
          { message: "Unauthorized", extensions: { code: "UNAUTHENTICATED" } },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    tryRefresh.mockReset().mockResolvedValue(false);
    replaceLocation.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("tries a token refresh on a protected page, then sends the user to /login when it fails", async () => {
    currentPathname.mockReturnValue("/clients");

    await gqlFetch(TEST_QUERY).catch(() => {});

    await vi.waitFor(() =>
      expect(replaceLocation).toHaveBeenCalledWith("/login"),
    );
    expect(tryRefresh).toHaveBeenCalled();
  });

  it.each(["/forgot-password", "/reset-password"])(
    "does not refresh or redirect while on the public page %s",
    async (path) => {
      currentPathname.mockReturnValue(path);

      await gqlFetch(TEST_QUERY).catch(() => {});

      expect(tryRefresh).not.toHaveBeenCalled();
      expect(replaceLocation).not.toHaveBeenCalled();
    },
  );
});
