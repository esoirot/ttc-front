import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { TaskAttachment } from "@/types/tasks.types";

import { AttachmentList } from "./AttachmentList";

function makeAttachment(
  overrides: Partial<TaskAttachment> = {},
): TaskAttachment {
  return {
    id: 1,
    taskId: 4,
    type: "URL",
    fileName: null,
    url: "https://example.com",
    displayText: "Spec doc",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function renderList(
  attachments: TaskAttachment[],
  onAdd: () => void = vi.fn(),
) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <AttachmentList taskId={4} attachments={attachments} onAdd={onAdd} />
    </QueryClientProvider>,
  );
}

describe("AttachmentList", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders FILE attachment with 📎 emoji and filename", () => {
    renderList([
      makeAttachment({
        id: 1,
        type: "FILE",
        fileName: "report.pdf",
        url: "/files/report.pdf",
        displayText: null,
      }),
    ]);
    expect(screen.getByText("📎")).toBeInTheDocument();
    expect(screen.getByText("report.pdf")).toBeInTheDocument();
  });

  it("renders URL attachment with 🔗 emoji and display text", () => {
    renderList([
      makeAttachment({ id: 2, type: "URL", displayText: "Spec doc" }),
    ]);
    expect(screen.getByText("🔗")).toBeInTheDocument();
    expect(screen.getByText("Spec doc")).toBeInTheDocument();
  });

  it("shows edit button on URL attachments but not on FILE attachments", () => {
    renderList([
      makeAttachment({
        id: 1,
        type: "FILE",
        fileName: "doc.pdf",
        url: "/files/doc.pdf",
        displayText: null,
      }),
      makeAttachment({
        id: 2,
        type: "URL",
        url: "https://example.com",
        displayText: "Spec",
      }),
    ]);
    expect(screen.queryAllByTitle("Edit")).toHaveLength(1);
  });

  it("clicking the edit button shows the inline edit form", () => {
    renderList([
      makeAttachment({
        id: 2,
        type: "URL",
        url: "https://example.com",
        displayText: "Spec",
      }),
    ]);
    fireEvent.click(screen.getByTitle("Edit"));
    expect(screen.getByPlaceholderText("URL")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Display text (optional)"),
    ).toBeInTheDocument();
  });

  it("Cancel in inline edit hides the form and restores the attachment view", () => {
    renderList([
      makeAttachment({
        id: 2,
        type: "URL",
        url: "https://example.com",
        displayText: "Spec",
      }),
    ]);
    fireEvent.click(screen.getByTitle("Edit"));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByPlaceholderText("URL")).not.toBeInTheDocument();
    expect(screen.getByText("Spec")).toBeInTheDocument();
  });

  it("saving inline edit calls PATCH on the attachment", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );
    renderList([
      makeAttachment({
        id: 3,
        type: "URL",
        url: "https://old.com",
        displayText: "Old",
      }),
    ]);

    fireEvent.click(screen.getByTitle("Edit"));
    fireEvent.change(screen.getByPlaceholderText("URL"), {
      target: { value: "https://new.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/attachments/3"),
        expect.objectContaining({ method: "PATCH" }),
      );
    });
  });

  it("Save is disabled in inline edit when the URL is cleared", () => {
    renderList([
      makeAttachment({ id: 3, type: "URL", url: "https://old.com" }),
    ]);
    fireEvent.click(screen.getByTitle("Edit"));
    fireEvent.change(screen.getByPlaceholderText("URL"), {
      target: { value: "" },
    });
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("deletes an attachment after confirming in the alert dialog", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 200 }),
    );
    renderList([
      makeAttachment({ id: 3, type: "URL", displayText: "Spec doc" }),
    ]);

    fireEvent.click(screen.getByTitle("Delete"));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/attachments/3"),
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  it("renders a URL-type attachment link pointing straight at an already-absolute URL", () => {
    renderList([
      makeAttachment({
        id: 4,
        type: "URL",
        url: "https://example.com/doc",
        displayText: "External doc",
      }),
    ]);
    expect(screen.getByRole("link", { name: "External doc" })).toHaveAttribute(
      "href",
      "https://example.com/doc",
    );
  });

  it("prefixes a bare host with https:// for a URL-type attachment", () => {
    renderList([
      makeAttachment({
        id: 5,
        type: "URL",
        url: "example.com/doc",
        displayText: "Bare host doc",
      }),
    ]);
    expect(screen.getByRole("link", { name: "Bare host doc" })).toHaveAttribute(
      "href",
      "https://example.com/doc",
    );
  });

  it("shows the raw url as the label when a URL attachment has no displayText", () => {
    renderList([
      makeAttachment({
        id: 6,
        type: "URL",
        url: "https://example.com/plain",
        displayText: null,
      }),
    ]);
    expect(
      screen.getByRole("link", { name: "https://example.com/plain" }),
    ).toBeInTheDocument();
  });

  it("calls onAdd when the + Add button is clicked", () => {
    const onAdd = vi.fn();
    renderList([makeAttachment({ id: 1 })], onAdd);
    fireEvent.click(screen.getByText("+ Add"));
    expect(onAdd).toHaveBeenCalled();
  });
});
