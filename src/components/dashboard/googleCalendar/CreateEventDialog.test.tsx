import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createIntlWrapper } from "@/test/intlWrapper";

const wrapper = createIntlWrapper();

const mutateAsyncMock = vi.fn().mockResolvedValue({ id: "e-new" });
const useCreateGoogleCalendarEventMock = vi.fn(() => ({
  mutateAsync: mutateAsyncMock,
  isPending: false,
}));
vi.mock("@/hooks/integrations/useGoogleCalendar", () => ({
  useCreateGoogleCalendarEvent: () => useCreateGoogleCalendarEventMock(),
}));

import { CreateEventDialog } from "./CreateEventDialog";

describe("CreateEventDialog", () => {
  beforeEach(() => {
    mutateAsyncMock.mockClear();
  });

  it("opens the dialog and pre-fills start/end around the default date", () => {
    render(<CreateEventDialog defaultDate={new Date(2026, 6, 10)} />, {
      wrapper,
    });

    fireEvent.click(screen.getByRole("button", { name: "+ Add event" }));

    expect(screen.getByText("New event")).toBeInTheDocument();
    const startInput = screen.getByLabelText("Start") as HTMLInputElement;
    const endInput = screen.getByLabelText("End") as HTMLInputElement;
    expect(startInput.value).toBe("2026-07-10T09:00");
    expect(endInput.value).toBe("2026-07-10T10:00");
  });

  it("submits the form and creates an event", async () => {
    render(<CreateEventDialog defaultDate={new Date(2026, 6, 10)} />, {
      wrapper,
    });

    fireEvent.click(screen.getByRole("button", { name: "+ Add event" }));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Client call" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create event" }));

    await Promise.resolve();

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      summary: "Client call",
      startDateTime: new Date(2026, 6, 10, 9, 0).toISOString(),
      endDateTime: new Date(2026, 6, 10, 10, 0).toISOString(),
    });
  });

  it("does not submit when the title is empty", () => {
    render(<CreateEventDialog defaultDate={new Date(2026, 6, 10)} />, {
      wrapper,
    });

    fireEvent.click(screen.getByRole("button", { name: "+ Add event" }));
    // Title input has `required` — native validation blocks submit.
    fireEvent.click(screen.getByRole("button", { name: "Create event" }));

    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it("renders French copy when locale is fr", () => {
    render(<CreateEventDialog defaultDate={new Date(2026, 6, 10)} />, {
      wrapper: createIntlWrapper("fr"),
    });

    fireEvent.click(
      screen.getByRole("button", { name: "+ Ajouter un événement" }),
    );

    expect(screen.getByText("Nouvel événement")).toBeInTheDocument();
    expect(screen.getByLabelText("Titre")).toBeInTheDocument();
  });
});
