import { useQuery, useMutation, useApolloClient } from "@apollo/client/react";
import {
  ME_QUERY,
  LOGIN_MUTATION,
  REGISTER_MUTATION,
  LOGOUT_MUTATION,
  SETUP_TWO_FACTOR_MUTATION,
  ENABLE_TWO_FACTOR_MUTATION,
  VERIFY_TWO_FACTOR_MUTATION,
} from "../graphql/auth.operations";

export function useCurrentUser() {
  const { data, loading, error } = useQuery(ME_QUERY, {
    errorPolicy: "ignore",
  });
  return {
    user: data?.me ?? null,
    loading,
    isAuthenticated: !!data?.me,
    error,
  };
}

export function useLogin() {
  const [mutate, { loading, error }] = useMutation(LOGIN_MUTATION, {
    refetchQueries: [ME_QUERY],
  });

  const login = (email: string, password: string) =>
    mutate({ variables: { input: { email, password } } });

  return { login, loading, error };
}

export function useRegister() {
  const [mutate, { loading, error }] = useMutation(REGISTER_MUTATION, {
    refetchQueries: [ME_QUERY],
  });

  const register = (email: string, password: string, name?: string) =>
    mutate({ variables: { input: { email, password, name } } });

  return { register, loading, error };
}

export function useLogout() {
  const client = useApolloClient();
  const [mutate, { loading }] = useMutation(LOGOUT_MUTATION);

  const logout = async () => {
    await mutate();
    await client.clearStore();
  };

  return { logout, loading };
}

export function useSetupTwoFactor() {
  const [mutate, { loading, data }] = useMutation(SETUP_TWO_FACTOR_MUTATION);
  return {
    setupTwoFactor: () => mutate(),
    loading,
    qrCodeUrl: data?.setupTwoFactor?.qrCodeUrl ?? null,
    secret: data?.setupTwoFactor?.secret ?? null,
  };
}

export function useEnableTwoFactor() {
  const [mutate, { loading, error }] = useMutation(ENABLE_TWO_FACTOR_MUTATION, {
    refetchQueries: [ME_QUERY],
  });
  return {
    enableTwoFactor: (code: string) => mutate({ variables: { code } }),
    loading,
    error,
  };
}

export function useVerifyTwoFactor() {
  const [mutate, { loading, error }] = useMutation(VERIFY_TWO_FACTOR_MUTATION, {
    refetchQueries: [ME_QUERY],
  });
  return {
    verifyTwoFactor: (tempToken: string, code: string) =>
      mutate({ variables: { input: { tempToken, code } } }),
    loading,
    error,
  };
}
