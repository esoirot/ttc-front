import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/test/queryClientWrapper";
import type { AuthUser } from "@/types/auth.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({
  gqlFetch,
  gqlMutate,
  apolloClient: { clearStore: vi.fn() },
}));

import { ProfileTab } from "./ProfileTab";

function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 1,
    email: "alice@example.com",
    role: "USER",
    name: "Alice Smith",
    firstName: "Alice",
    lastName: "Smith",
    twoFactorEnabled: false,
    defaultCurrency: "EUR",
    logoUrl: null,
    mobilePhone: "+1234",
    jobTitle: "Translator",
    interfaceLanguage: "en",
    dateFormat: "DD/MM/YYYY",
    hourFormat: "24h",
    numberFormat: "1,234.56",
    ...overrides,
  } as AuthUser;
}

function renderProfileTab(user: AuthUser) {
  const queryClient = createQueryClient();
  queryClient.setQueryData(["me"], user);
  return render(
    <QueryClientProvider client={queryClient}>
      <ProfileTab />
    </QueryClientProvider>,
  );
}

describe("ProfileTab", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
  });

  it("pre-fills personal info fields from the current user", () => {
    renderProfileTab(makeUser());

    expect(screen.getByLabelText("First name")).toHaveValue("Alice");
    expect(screen.getByLabelText("Last name")).toHaveValue("Smith");
    expect(screen.getByLabelText("Email")).toHaveValue("alice@example.com");
    expect(screen.getByLabelText("Mobile phone")).toHaveValue("+1234");
    expect(screen.getByLabelText("Job title")).toHaveValue("Translator");
  });

  it("shows the user's role badge", () => {
    renderProfileTab(makeUser({ role: "ADMIN" }));
    expect(screen.getByText("ADMIN")).toBeInTheDocument();
  });

  it("hides the logo preview when logoUrl is not set", () => {
    renderProfileTab(makeUser({ logoUrl: null }));
    expect(screen.queryByAltText("Logo preview")).not.toBeInTheDocument();
  });

  it("shows a logo preview when logoUrl is set", () => {
    renderProfileTab(makeUser({ logoUrl: "https://example.com/logo.png" }));
    expect(screen.getByAltText("Logo preview")).toHaveAttribute(
      "src",
      "https://example.com/logo.png",
    );
  });

  it("submits the form and shows the saved confirmation", async () => {
    gqlMutate.mockResolvedValueOnce({ updateMe: makeUser() });
    renderProfileTab(makeUser());

    fireEvent.change(screen.getByLabelText("First name"), {
      target: { value: "Bob" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() =>
      expect(gqlMutate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          input: expect.objectContaining({ firstName: "Bob" }),
        }),
      ),
    );
    await waitFor(() =>
      expect(screen.getByText("Profile saved.")).toBeInTheDocument(),
    );
  });

  it("disables the submit button and shows 'Saving…' while the mutation is pending", async () => {
    let resolveMutate!: (v: { updateMe: AuthUser }) => void;
    gqlMutate.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveMutate = resolve;
      }),
    );
    renderProfileTab(makeUser());

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(
      await screen.findByRole("button", { name: "Saving…" }),
    ).toBeDisabled();

    resolveMutate({ updateMe: makeUser() });
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Save changes" }),
      ).not.toBeDisabled(),
    );
  });

  it("shows the save error message when the mutation rejects", async () => {
    gqlMutate.mockRejectedValueOnce(new Error("Email already in use"));
    renderProfileTab(makeUser());

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("Email already in use")).toBeInTheDocument();
    expect(screen.queryByText("Profile saved.")).not.toBeInTheDocument();
  });
});
