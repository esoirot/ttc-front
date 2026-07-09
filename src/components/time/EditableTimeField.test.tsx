import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EditableTimeField } from "./EditableTimeField";

const ISO = "2026-06-01T08:30:15.000Z";

describe("EditableTimeField", () => {
  it("shows the formatted time (with seconds) and enters edit mode on click", () => {
    render(
      <EditableTimeField iso={ISO} label="start time" onCommit={vi.fn()} />,
    );

    const local = new Date(ISO);
    const hh = String(local.getHours()).padStart(2, "0");
    const mm = String(local.getMinutes()).padStart(2, "0");
    const ss = String(local.getSeconds()).padStart(2, "0");

    const span = screen.getByTitle("Click to edit start time");
    expect(span).toHaveTextContent(`${hh}:${mm}:${ss}`);

    fireEvent.click(span);

    const input = screen.getByDisplayValue(`${hh}:${mm}:${ss}`);
    expect(input).toHaveAttribute("type", "time");
    expect(input).toHaveAttribute("step", "1");
  });

  it("commits a new ISO with the same date on Enter, including seconds", () => {
    const onCommit = vi.fn();
    render(
      <EditableTimeField iso={ISO} label="start time" onCommit={onCommit} />,
    );

    fireEvent.click(screen.getByTitle("Click to edit start time"));
    const input = screen.getByDisplayValue(/\d{2}:\d{2}:\d{2}/);
    fireEvent.change(input, { target: { value: "10:15:42" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onCommit).toHaveBeenCalledTimes(1);
    const newIso = onCommit.mock.calls[0][0] as string;
    const newDate = new Date(newIso);
    const original = new Date(ISO);
    expect(newDate.getFullYear()).toBe(original.getFullYear());
    expect(newDate.getMonth()).toBe(original.getMonth());
    expect(newDate.getDate()).toBe(original.getDate());
    expect(newDate.getHours()).toBe(10);
    expect(newDate.getMinutes()).toBe(15);
    expect(newDate.getSeconds()).toBe(42);
  });

  it("cancels without committing on Escape", () => {
    const onCommit = vi.fn();
    render(
      <EditableTimeField iso={ISO} label="start time" onCommit={onCommit} />,
    );

    fireEvent.click(screen.getByTitle("Click to edit start time"));
    const input = screen.getByDisplayValue(/\d{2}:\d{2}:\d{2}/);
    fireEvent.change(input, { target: { value: "10:15:42" } });
    fireEvent.keyDown(input, { key: "Escape" });

    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByTitle("Click to edit start time")).toBeInTheDocument();
  });

  it("commits on blur", () => {
    const onCommit = vi.fn();
    render(
      <EditableTimeField iso={ISO} label="start time" onCommit={onCommit} />,
    );

    fireEvent.click(screen.getByTitle("Click to edit start time"));
    const input = screen.getByDisplayValue(/\d{2}:\d{2}:\d{2}/);
    fireEvent.change(input, { target: { value: "11:00:05" } });
    fireEvent.blur(input);

    expect(onCommit).toHaveBeenCalledTimes(1);
  });

  it("does not commit when the value is unchanged", () => {
    const onCommit = vi.fn();
    render(
      <EditableTimeField iso={ISO} label="start time" onCommit={onCommit} />,
    );

    fireEvent.click(screen.getByTitle("Click to edit start time"));
    const input = screen.getByDisplayValue(/\d{2}:\d{2}:\d{2}/);
    fireEvent.blur(input);

    expect(onCommit).not.toHaveBeenCalled();
  });

  it("suppresses the commit when isValid rejects the candidate", () => {
    const onCommit = vi.fn();
    render(
      <EditableTimeField
        iso={ISO}
        label="start time"
        onCommit={onCommit}
        isValid={() => false}
      />,
    );

    fireEvent.click(screen.getByTitle("Click to edit start time"));
    const input = screen.getByDisplayValue(/\d{2}:\d{2}:\d{2}/);
    fireEvent.change(input, { target: { value: "12:00:00" } });
    fireEvent.blur(input);

    expect(onCommit).not.toHaveBeenCalled();
  });

  it("accepts a browser value with no seconds component, defaulting to :00", () => {
    const onCommit = vi.fn();
    render(
      <EditableTimeField iso={ISO} label="start time" onCommit={onCommit} />,
    );

    fireEvent.click(screen.getByTitle("Click to edit start time"));
    const input = screen.getByDisplayValue(/\d{2}:\d{2}:\d{2}/);
    fireEvent.change(input, { target: { value: "09:00" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onCommit).toHaveBeenCalledTimes(1);
    const newDate = new Date(onCommit.mock.calls[0][0] as string);
    expect(newDate.getHours()).toBe(9);
    expect(newDate.getMinutes()).toBe(0);
    expect(newDate.getSeconds()).toBe(0);
  });
});
