import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useSetClockifyCredentialsMock = vi.fn();
vi.mock("@/hooks/integrations/useClockify", () => ({
  useSetClockifyCredentials: () => useSetClockifyCredentialsMock(),
}));

import { ConnectForm } from "./ConnectForm";

function defaultMutation() {
  return { mutate: vi.fn(), isPending: false, error: null };
}

describe("ConnectForm", () => {
  beforeEach(() => {
    useSetClockifyCredentialsMock.mockReset();
    useSetClockifyCredentialsMock.mockReturnValue(defaultMutation());
  });

  it("renders API key label, password input, and submit button", () => {
    render(<ConnectForm />);
    const input = screen.getByLabelText("Clockify API Key");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "password");
    expect(
      screen.getByRole("button", { name: "Connect Clockify" }),
    ).toBeInTheDocument();
  });

  it("submit button is disabled when input is empty", () => {
    render(<ConnectForm />);
    expect(
      screen.getByRole("button", { name: "Connect Clockify" }),
    ).toBeDisabled();
  });

  it("submit button stays disabled when input is whitespace-only", () => {
    render(<ConnectForm />);
    fireEvent.change(screen.getByLabelText("Clockify API Key"), {
      target: { value: "   " },
    });
    expect(
      screen.getByRole("button", { name: "Connect Clockify" }),
    ).toBeDisabled();
  });

  it("submit button is enabled after typing a valid key", () => {
    render(<ConnectForm />);
    fireEvent.change(screen.getByLabelText("Clockify API Key"), {
      target: { value: "my-api-key" },
    });
    expect(
      screen.getByRole("button", { name: "Connect Clockify" }),
    ).not.toBeDisabled();
  });

  it("calls mutate with trimmed api key on submit", () => {
    const mutate = vi.fn();
    useSetClockifyCredentialsMock.mockReturnValue({
      mutate,
      isPending: false,
      error: null,
    });
    render(<ConnectForm />);
    fireEvent.change(screen.getByLabelText("Clockify API Key"), {
      target: { value: "  abc123  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Connect Clockify" }));
    expect(mutate).toHaveBeenCalledWith({ apiKey: "abc123" });
  });

  it("shows Connecting… and disables the button while pending", () => {
    useSetClockifyCredentialsMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
      error: null,
    });
    render(<ConnectForm />);
    expect(screen.getByRole("button", { name: "Connecting…" })).toBeDisabled();
  });

  it("displays the error message when the mutation fails", () => {
    useSetClockifyCredentialsMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: new Error("Invalid API key"),
    });
    render(<ConnectForm />);
    expect(screen.getByText("Invalid API key")).toBeInTheDocument();
  });

  it("does not call mutate on submit when the api key is empty", () => {
    const mutate = vi.fn();
    useSetClockifyCredentialsMock.mockReturnValue({
      mutate,
      isPending: false,
      error: null,
    });
    const { container } = render(<ConnectForm />);
    const form = container.querySelector("form");
    if (!form) throw new Error("form not found");
    fireEvent.submit(form);
    expect(mutate).not.toHaveBeenCalled();
  });
});
