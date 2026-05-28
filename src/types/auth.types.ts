import type { ReactNode } from "react";
import type { AdminPermission } from "./users.types";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  twoFactorEnabled: boolean;
  logoUrl: string | null;
  adminPermissions?: AdminPermission[];
}

export type AuthLayoutProps = { title: string; children: ReactNode };

export interface BackupCodesDisplayProps {
  codes: string[];
  onDone: () => void;
}

export interface GoogleOAuthButtonProps {
  from?: string;
}

export interface PasswordStrengthIndicatorProps {
  password: string;
}

export interface TwoFactorEnabledViewProps {
  onCodesRegenerated: (codes: string[]) => void;
}

export interface TwoFactorSetupFlowProps {
  onEnabled: (codes: string[]) => void;
}
