import { gql } from "@apollo/client/core";
import type { TypedDocumentNode } from "@apollo/client/core";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  twoFactorEnabled: boolean;
}

export const ME_QUERY: TypedDocumentNode<
  { me: User | null },
  Record<string, never>
> = gql`
  query Me {
    me {
      id
      email
      name
      role
      twoFactorEnabled
    }
  }
`;

export const LOGIN_MUTATION: TypedDocumentNode<
  {
    login: { user: User; requiresTwoFactor: boolean; tempToken: string | null };
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
  { register: User },
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
  { enableTwoFactor: boolean },
  { code: string }
> = gql`
  mutation EnableTwoFactor($code: String!) {
    enableTwoFactor(code: $code)
  }
`;

export const VERIFY_TWO_FACTOR_MUTATION: TypedDocumentNode<
  { verifyTwoFactor: { user: User } },
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
  { updateMe: User },
  { input: { name?: string; email?: string } }
> = gql`
  mutation UpdateMe($input: UpdateMeInput!) {
    updateMe(input: $input) {
      id
      email
      name
      role
      twoFactorEnabled
    }
  }
`;
