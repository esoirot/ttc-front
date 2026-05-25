import { gql } from "@apollo/client/core";
import type { TypedDocumentNode } from "@apollo/client/core";
import type { AuthUser } from "@/types/auth.types";

export const ME_QUERY: TypedDocumentNode<
  { me: AuthUser | null },
  Record<string, never>
> = gql`
  query Me {
    me {
      id
      email
      name
      role
      twoFactorEnabled
      logoUrl
    }
  }
`;

export const LOGIN_MUTATION: TypedDocumentNode<
  {
    login: {
      user: AuthUser;
      requiresTwoFactor: boolean;
      tempToken: string | null;
    };
  },
  { input: { email: string; password: string } }
> = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        email
        name
        role
        twoFactorEnabled
      }
      requiresTwoFactor
      tempToken
    }
  }
`;

export const REGISTER_MUTATION: TypedDocumentNode<
  { register: AuthUser },
  { input: { email: string; password: string; name?: string } }
> = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      id
      email
      name
      role
    }
  }
`;

export const LOGOUT_MUTATION: TypedDocumentNode<
  { logout: boolean },
  Record<string, never>
> = gql`
  mutation Logout {
    logout
  }
`;

export const REFRESH_TOKEN_MUTATION: TypedDocumentNode<
  { refreshToken: boolean },
  Record<string, never>
> = gql`
  mutation RefreshToken {
    refreshToken
  }
`;

export const SETUP_TWO_FACTOR_MUTATION: TypedDocumentNode<
  { setupTwoFactor: { qrCodeUrl: string; secret: string } },
  Record<string, never>
> = gql`
  mutation SetupTwoFactor {
    setupTwoFactor {
      qrCodeUrl
      secret
    }
  }
`;

export const ENABLE_TWO_FACTOR_MUTATION: TypedDocumentNode<
  { enableTwoFactor: { backupCodes: string[] } },
  { code: string }
> = gql`
  mutation EnableTwoFactor($code: String!) {
    enableTwoFactor(code: $code) {
      backupCodes
    }
  }
`;

export const VERIFY_TWO_FACTOR_BACKUP_MUTATION: TypedDocumentNode<
  { verifyTwoFactorBackup: { user: AuthUser } },
  { input: { tempToken: string; backupCode: string } }
> = gql`
  mutation VerifyTwoFactorBackup($input: VerifyTwoFactorBackupInput!) {
    verifyTwoFactorBackup(input: $input) {
      user {
        id
        email
        name
        role
        twoFactorEnabled
      }
    }
  }
`;

export const VERIFY_TWO_FACTOR_MUTATION: TypedDocumentNode<
  { verifyTwoFactor: { user: AuthUser } },
  { input: { tempToken: string; code: string } }
> = gql`
  mutation VerifyTwoFactor($input: VerifyTwoFactorInput!) {
    verifyTwoFactor(input: $input) {
      user {
        id
        email
        name
        role
        twoFactorEnabled
      }
    }
  }
`;

export const DISABLE_TWO_FACTOR_MUTATION: TypedDocumentNode<
  { disableTwoFactor: boolean },
  { code: string }
> = gql`
  mutation DisableTwoFactor($code: String!) {
    disableTwoFactor(code: $code)
  }
`;

export const UPDATE_ME_MUTATION: TypedDocumentNode<
  { updateMe: AuthUser },
  { input: { name?: string; email?: string; logoUrl?: string } }
> = gql`
  mutation UpdateMe($input: UpdateMeInput!) {
    updateMe(input: $input) {
      id
      email
      name
      role
      twoFactorEnabled
      logoUrl
    }
  }
`;

export const REGENERATE_BACKUP_CODES_MUTATION: TypedDocumentNode<
  { regenerateBackupCodes: { backupCodes: string[] } },
  { code: string }
> = gql`
  mutation RegenerateBackupCodes($code: String!) {
    regenerateBackupCodes(code: $code) {
      backupCodes
    }
  }
`;

export const ADMIN_DISABLE_TWO_FACTOR_MUTATION: TypedDocumentNode<
  { adminDisableTwoFactor: boolean },
  { userId: number }
> = gql`
  mutation AdminDisableTwoFactor($userId: Int!) {
    adminDisableTwoFactor(userId: $userId)
  }
`;

export const BACKUP_CODE_COUNT_QUERY: TypedDocumentNode<
  { backupCodeCount: number },
  Record<string, never>
> = gql`
  query BackupCodeCount {
    backupCodeCount
  }
`;

export const REQUEST_PASSWORD_RESET_MUTATION: TypedDocumentNode<
  { requestPasswordReset: boolean },
  { email: string }
> = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`;

export const RESET_PASSWORD_MUTATION: TypedDocumentNode<
  { resetPassword: boolean },
  { token: string; newPassword: string }
> = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`;
