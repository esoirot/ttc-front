import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { createQueryClient } from "@/test/queryClientWrapper";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigateMock };
});

import { RegisterForm } from "./RegisterForm";

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe("RegisterForm", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    navigateMock.mockReset();
  });

  it("shows a password length error after blurring a short password", () => {
    render(<RegisterForm />, { wrapper });

    const passwordInput = screen.getByLabelText("Password");
    fireEvent.change(passwordInput, { target: { value: "short" } });
    fireEvent.blur(passwordInput);

    expect(
      screen.getByText("Password must be at least 8 characters."),
    ).toBeInTheDocument();
  });

  it("navigates home after a successful registration", async () => {
    gqlMutate.mockResolvedValueOnce({
      register: { id: 5, email: "new@b.com" },
    });

    render(<RegisterForm />, { wrapper });

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "new@b.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "longenoughpw" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/"));
  });

  it("shows the mutation error message on failed registration", async () => {
    gqlMutate.mockRejectedValueOnce(new Error("Email already in use"));

    render(<RegisterForm />, { wrapper });

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "dup@b.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "longenoughpw" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Email already in use")).toBeInTheDocument();
  });
});
