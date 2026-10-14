import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createQueryClient,
  createQueryWrapper,
} from "@/test/queryClientWrapper";

import {
  useCreateAttachment,
  useDeleteAttachment,
  useUpdateAttachment,
} from "./useAttachments";

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status });
}

describe("useCreateAttachment", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uploads a file via multipart form data and reloads the task and its project activity", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { id: 1 }));
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateAttachment(7), {
      wrapper: createQueryWrapper(queryClient),
    });

    const file = new File(["content"], "doc.pdf");
    await result.current.uploadFile(file);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:3000/tasks/7/attachments/file");
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["task"] });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["projectActivities"],
    });
  });

  it("creates a link attachment via JSON body and reloads the task", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { id: 2 }));
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateAttachment(7), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.createUrl("https://example.com", "Doc link");

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({
      url: "https://example.com",
      displayText: "Doc link",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["task"] });
  });

  it("throws when the upload response is not ok", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }));

    const { result } = renderHook(() => useCreateAttachment(7), {
      wrapper: createQueryWrapper(),
    });

    await expect(
      result.current.uploadFile(new File(["x"], "x.txt")),
    ).rejects.toThrow("Upload failed");
  });
});

describe("useUpdateAttachment", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("PATCHes the attachment by id and reloads the task", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { id: 3 }));
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateAttachment(7), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.updateAttachment(3, "https://x.com", "New text");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:3000/tasks/7/attachments/3");
    expect(init.method).toBe("PATCH");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["task"] });
  });
});

describe("useDeleteAttachment", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("DELETEs the attachment and reloads the task and its project activity", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteAttachment(7), {
      wrapper: createQueryWrapper(queryClient),
    });

    await result.current.deleteAttachment(3);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:3000/tasks/7/attachments/3");
    expect(init.method).toBe("DELETE");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["task"] });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["projectActivities"],
    });
  });
});
