import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";

import { TaskAttachmentModal } from "./TaskAttachmentModal";

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status });
}

function renderModal(
  props: Partial<Parameters<typeof TaskAttachmentModal>[0]> = {},
) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <TaskAttachmentModal
        taskId={4}
        open={true}
        onClose={vi.fn()}
        {...props}
      />
    </QueryClientProvider>,
  );
}

describe("TaskAttachmentModal", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("disables Attach until a file or URL is given", () => {
    renderModal();
    expect(screen.getByText("Attach")).toBeDisabled();
  });

  it("enables Attach and only shows display text once a URL is entered", () => {
    renderModal();
    fireEvent.change(screen.getByPlaceholderText("https://…"), {
      target: { value: "https://example.com" },
    });
    expect(screen.getByText("Attach")).not.toBeDisabled();
    expect(screen.getByPlaceholderText("Link label…")).toBeInTheDocument();
  });

  it("creates a URL attachment and closes the dialog", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { id: 1 }));
    const onClose = vi.fn();
    renderModal({ onClose });

    fireEvent.change(screen.getByPlaceholderText("https://…"), {
      target: { value: "https://example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Link label…"), {
      target: { value: "Spec doc" },
    });
    fireEvent.click(screen.getByText("Attach"));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({
      url: "https://example.com",
      displayText: "Spec doc",
    });
  });

  it("calls onClose without attaching when Cancel is clicked", () => {
    const onClose = vi.fn();
    renderModal({ onClose });

    fireEvent.change(screen.getByPlaceholderText("https://…"), {
      target: { value: "https://example.com" },
    });
    fireEvent.click(screen.getByText("Cancel"));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("enables Attach when a file is selected", () => {
    renderModal();
    const file = new File(["content"], "report.pdf", {
      type: "application/pdf",
    });
    // Dialog renders in a portal — use document.querySelector, not container
    const fileInput = document.querySelector('input[type="file"]')!;

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText("Attach")).not.toBeDisabled();
  });

  it("uploads a file via multipart POST and closes the dialog", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { id: 1 }));
    const onClose = vi.fn();
    renderModal({ onClose });

    const file = new File(["content"], "report.pdf", {
      type: "application/pdf",
    });
    const fileInput = document.querySelector('input[type="file"]')!;
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(screen.getByText("Attach"));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/attachments/file");
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);
  });

  it("omits displayText from the payload when it is empty", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { id: 2 }));
    renderModal();

    fireEvent.change(screen.getByPlaceholderText("https://…"), {
      target: { value: "https://example.com" },
    });
    // leave displayText input empty
    fireEvent.click(screen.getByText("Attach"));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(body).not.toHaveProperty("displayText");
  });
});
