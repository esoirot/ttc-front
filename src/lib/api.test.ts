import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiDelete, apiGet, apiPatch, apiPost, ApiError } from "./api";

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("api request helpers", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("apiGet resolves with parsed JSON on success", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { id: 1 }));

    const result = await apiGet<{ id: number }>("/clients");

    expect(result).toEqual({ id: 1 });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:3000/clients");
    expect(init.credentials).toBe("include");
    expect(init.headers["Content-Type"]).toBeUndefined();
  });

  it("apiPost sends a JSON body with Content-Type header", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    await apiPost("/clients", { name: "Acme" });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.body).toBe(JSON.stringify({ name: "Acme" }));
  });

  it("apiPatch sends PATCH with body", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    await apiPatch("/clients/1", { name: "New" });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("PATCH");
    expect(init.body).toBe(JSON.stringify({ name: "New" }));
  });

  it("apiDelete returns undefined on 204", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

    const result = await apiDelete("/clients/1");

    expect(result).toBeUndefined();
  });

  it("throws ApiError with server message on non-ok, non-401 response", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(400, { message: "Bad input" }),
    );

    await expect(apiGet("/clients")).rejects.toMatchObject({
      name: "ApiError",
      status: 400,
      message: "Bad input",
    });
  });

  it("falls back to statusText when error body has no message", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response("not json", { status: 500, statusText: "Server Error" }),
    );

    await expect(apiGet("/clients")).rejects.toMatchObject({
      status: 500,
      message: "Server Error",
    });
  });

  it("on 401, attempts refresh and retries once on success", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { message: "Unauthorized" }))
      .mockResolvedValueOnce(
        jsonResponse(200, { data: { refreshToken: true } }),
      )
      .mockResolvedValueOnce(jsonResponse(200, { id: 1 }));

    const result = await apiGet<{ id: number }>("/clients");

    expect(result).toEqual({ id: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("on 401, throws ApiError when refresh fails", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { message: "Unauthorized" }))
      .mockResolvedValueOnce(
        jsonResponse(200, { data: { refreshToken: false } }),
      );

    await expect(apiGet("/clients")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws ApiError when the refresh request itself is non-ok", async () => {
    fetchMock.mockResolvedValue(jsonResponse(401, { message: "Unauthorized" }));

    await expect(apiGet("/clients")).rejects.toBeInstanceOf(ApiError);
  });
});
