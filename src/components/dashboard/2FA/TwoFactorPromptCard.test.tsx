import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { createIntlWrapper } from "@/test/intlWrapper";
import { TwoFactorPromptCard } from "./TwoFactorPromptCard";

function renderCard(locale: "en" | "fr" = "en") {
  const Wrapper = createIntlWrapper(locale);
  return render(
    <Wrapper>
      <MemoryRouter>
        <TwoFactorPromptCard />
      </MemoryRouter>
    </Wrapper>,
  );
}

describe("TwoFactorPromptCard", () => {
  it("shows the title, body, and CTA", () => {
    renderCard();
    expect(screen.getByText("Secure your account")).toBeInTheDocument();
    expect(
      screen.getByText("Two-factor authentication is not enabled."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Enable 2FA" }),
    ).toBeInTheDocument();
  });

  it("renders French copy when locale is fr", () => {
    renderCard("fr");
    expect(screen.getByText("Sécurisez votre compte")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Activer la 2FA" }),
    ).toBeInTheDocument();
  });
});
