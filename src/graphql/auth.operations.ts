import { gql } from "@apollo/client/core";

export const ME_QUERY = gql`
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

export const LOGIN_MUTATION = gql`
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

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      id
      email
      name
      role
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken {
    refreshToken
  }
`;

export const SETUP_TWO_FACTOR_MUTATION = gql`
  mutation SetupTwoFactor {
    setupTwoFactor {
      qrCodeUrl
      secret
    }
  }
`;

export const ENABLE_TWO_FACTOR_MUTATION = gql`
  mutation EnableTwoFactor($code: String!) {
    enableTwoFactor(code: $code)
  }
`;

export const VERIFY_TWO_FACTOR_MUTATION = gql`
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
