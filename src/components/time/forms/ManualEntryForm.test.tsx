import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

vi.mock("../tags/TtcTagChips", () => ({
  TtcTagChips: () => <div data-testid="tag-chips" />,
}));

import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/test/queryClientWrapper";
import { ManualEntryForm } from "./ManualEntryForm";

function renderForm(onClose = vi.fn()) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <ManualEntryForm onClose={onClose} recentDescriptions={[]} tags={[]} />
    </QueryClientProvider>,
  );
}

describe("ManualEntryForm", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("renders description, tags, and start/end date/time fields", () => {
    renderForm();

    expect(
      screen.getByPlaceholderText("What did you work on?"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("tag-chips")).toBeInTheDocument();
    expect(screen.getByLabelText("Start date")).toBeInTheDocument();
    expect(screen.getByLabelText("Start time")).toHaveValue("09:00");
    expect(screen.getByLabelText("End date")).toBeInTheDocument();
    expect(screen.getByLabelText("End time")).toHaveValue("10:00");
  });

  it("does not submit when start or end date is missing", () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Save entry" }));

    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("submits with combined local ISO start/end and closes on success", async () => {
    gqlMutate.mockResolvedValueOnce({
      createTimeEntry: { id: 1, description: "Translate" },
    });
    const onClose = vi.fn();
    renderForm(onClose);

    fireEvent.change(screen.getByPlaceholderText("What did you work on?"), {
      target: { value: "Translate" },
    });
    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2026-06-01" },
    });
    fireEvent.change(screen.getByLabelText("End date"), {
      target: { value: "2026-06-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save entry" }));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          input: expect.objectContaining({
            description: "Translate",
            startTime: "2026-06-01T09:00:00",
            endTime: "2026-06-01T10:00:00",
          }),
        }),
      ),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("omits description when blank", async () => {
    gqlMutate.mockResolvedValueOnce({ createTimeEntry: { id: 1 } });
    renderForm();

    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2026-06-01" },
    });
    fireEvent.change(screen.getByLabelText("End date"), {
      target: { value: "2026-06-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save entry" }));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          input: expect.objectContaining({ description: undefined }),
        }),
      ),
    );
  });

  it("does not submit when startDate is set but endDate is missing", () => {
    renderForm();

    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2026-06-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save entry" }));

    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("does not submit when endDate is set but startDate is missing", () => {
    renderForm();

    fireEvent.change(screen.getByLabelText("End date"), {
      target: { value: "2026-06-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save entry" }));

    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("uses custom start and end times in the mutation payload", async () => {
    gqlMutate.mockResolvedValueOnce({ createTimeEntry: { id: 1 } });
    renderForm();

    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2026-06-01" },
    });
    fireEvent.change(screen.getByLabelText("Start time"), {
      target: { value: "14:30" },
    });
    fireEvent.change(screen.getByLabelText("End date"), {
      target: { value: "2026-06-01" },
    });
    fireEvent.change(screen.getByLabelText("End time"), {
      target: { value: "16:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save entry" }));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          input: expect.objectContaining({
            startTime: "2026-06-01T14:30:00",
            endTime: "2026-06-01T16:00:00",
          }),
        }),
      ),
    );
  });

  it("clears description and date fields after a successful save", async () => {
    gqlMutate.mockResolvedValueOnce({ createTimeEntry: { id: 1 } });
    const onClose = vi.fn();
    renderForm(onClose);

    fireEvent.change(screen.getByPlaceholderText("What did you work on?"), {
      target: { value: "Translate" },
    });
    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2026-06-01" },
    });
    fireEvent.change(screen.getByLabelText("End date"), {
      target: { value: "2026-06-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save entry" }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());

    expect(screen.getByPlaceholderText("What did you work on?")).toHaveValue(
      "",
    );
    expect(screen.getByLabelText("Start date")).toHaveValue("");
    expect(screen.getByLabelText("End date")).toHaveValue("");
  });

  it("shows 'Saving…' and disables submit while pending", async () => {
    let resolveCreate!: (v: { createTimeEntry: { id: number } }) => void;
    gqlMutate.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveCreate = resolve;
      }),
    );
    renderForm();

    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2026-06-01" },
    });
    fireEvent.change(screen.getByLabelText("End date"), {
      target: { value: "2026-06-01" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save entry" }));

    expect(
      await screen.findByRole("button", { name: "Saving…" }),
    ).toBeDisabled();

    resolveCreate({ createTimeEntry: { id: 1 } });
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Saving…" }),
      ).not.toBeInTheDocument(),
    );
  });
});
