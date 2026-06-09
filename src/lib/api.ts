const GRAPHQL_URL = import.meta.env.VITE_API_URL as string;
const BASE = GRAPHQL_URL.replace("/graphql", "");

class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "mutation { refreshToken }" }),
    });
    if (!res.ok) return false;
    const json = (await res.json()) as { data?: { refreshToken?: boolean } };
    return json.data?.refreshToken === true;
  } catch {
    return false;
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
  isRetry = false,
  responseType: "json" | "blob" = "json",
): Promise<T> {
  const hasBody = init?.body !== undefined;
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    signal: init?.signal ?? AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    if (res.status === 401 && !isRetry) {
      const refreshed = await tryRefresh();
      if (refreshed) return request<T>(path, init, true, responseType);
    }
    const raw: unknown = await res.json().catch(() => ({}));
    const msg =
      raw !== null &&
      typeof raw === "object" &&
      "message" in raw &&
      typeof (raw as { message?: unknown }).message === "string"
        ? (raw as { message: string }).message
        : res.statusText;
    throw new ApiError(res.status, msg);
  }

  if (res.status === 204) return undefined as unknown as T;
  if (responseType === "blob") return res.blob() as Promise<T>;
  return res.json() as Promise<T>;
}

export function apiGet<T>(
  path: string,
  options?: { responseType?: "blob" },
): Promise<T> {
  return request<T>(path, undefined, false, options?.responseType ?? "json");
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) });
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body ?? {}),
  });
}

export function apiDelete(path: string): Promise<void> {
  return request<void>(path, { method: "DELETE" });
}

export { ApiError, tryRefresh };
