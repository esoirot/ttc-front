import type { AuthUser } from "@/types/auth.types";

export const MOCK_AUTH_USER: AuthUser = {
  id: "1",
  email: "test@example.com",
  name: "Test User",
  role: "USER",
  twoFactorEnabled: false,
  logoUrl: null,
  defaultCurrency: "EUR",
};
