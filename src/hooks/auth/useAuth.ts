import { useEffect } from "react";
import { useQuery, useMutation, useApolloClient } from "@apollo/client/react";
import {
  ME_QUERY,
  LOGIN_MUTATION,
  REGISTER_MUTATION,
  LOGOUT_MUTATION,
  SETUP_TWO_FACTOR_MUTATION,
  ENABLE_TWO_FACTOR_MUTATION,
  DISABLE_TWO_FACTOR_MUTATION,
  VERIFY_TWO_FACTOR_MUTATION,
  VERIFY_TWO_FACTOR_BACKUP_MUTATION,
  UPDATE_ME_MUTATION,
  REQUEST_PASSWORD_RESET_MUTATION,
  RESET_PASSWORD_MUTATION,
  REGENERATE_BACKUP_CODES_MUTATION,
  ADMIN_DISABLE_TWO_FACTOR_MUTATION,
  BACKUP_CODE_COUNT_QUERY,
  CHANGE_PASSWORD_MUTATION,
  DELETE_ACCOUNT_MUTATION,
} from "../../graphql/auth.operations";
import { USERS_QUERY } from "../../graphql/users.operations";

export function useCurrentUser() {
  const { data, loading, error, refetch } = useQuery(ME_QUERY, {
    errorPolicy: "ignore",
  });

  useEffect(() => {
    const check = () => {
      if (document.visibilityState === "visible") void refetch();
    };
    document.addEventListener("visibilitychange", check);
    return () => document.removeEventListener("visibilitychange", check);
  }, [refetch]);

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
    localStorage.setItem("ttc_logout", Date.now().toString());
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
  const [mutate, { loading, error, data }] = useMutation(
    ENABLE_TWO_FACTOR_MUTATION,
    { refetchQueries: [ME_QUERY] },
  );
  return {
    enableTwoFactor: (code: string) => mutate({ variables: { code } }),
    loading,
    error,
    backupCodes: data?.enableTwoFactor?.backupCodes ?? null,
  };
}

export function useVerifyTwoFactorBackup() {
  const [mutate, { loading, error }] = useMutation(
    VERIFY_TWO_FACTOR_BACKUP_MUTATION,
    { refetchQueries: [ME_QUERY] },
  );
  return {
    verifyBackup: (tempToken: string, backupCode: string) =>
      mutate({ variables: { input: { tempToken, backupCode } } }),
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

export function useDisableTwoFactor() {
  const [mutate, { loading, error }] = useMutation(
    DISABLE_TWO_FACTOR_MUTATION,
    {
      refetchQueries: [ME_QUERY],
    },
  );
  return {
    disableTwoFactor: (code: string) => mutate({ variables: { code } }),
    loading,
    error,
  };
}

export function useUpdateMe() {
  const [mutate, { loading, error }] = useMutation(UPDATE_ME_MUTATION, {
    refetchQueries: [ME_QUERY],
  });
  return {
    updateMe: (input: {
      name?: string;
      email?: string;
      logoUrl?: string;
      defaultCurrency?: string;
      firstName?: string | null;
      lastName?: string | null;
      mobilePhone?: string | null;
      jobTitle?: string | null;
      interfaceLanguage?: string | null;
      dateFormat?: string | null;
      hourFormat?: string | null;
      numberFormat?: string | null;
    }) => mutate({ variables: { input } }),
    loading,
    error,
  };
}

export function useRequestPasswordReset() {
  const [mutate, { loading }] = useMutation(REQUEST_PASSWORD_RESET_MUTATION);
  return {
    requestReset: (email: string) => mutate({ variables: { email } }),
    loading,
  };
}

export function useResetPassword() {
  const [mutate, { loading }] = useMutation(RESET_PASSWORD_MUTATION);
  return {
    resetPassword: (token: string, newPassword: string) =>
      mutate({ variables: { token, newPassword } }),
    loading,
  };
}

export function useRegenerateBackupCodes() {
  const [mutate, { loading, error }] = useMutation(
    REGENERATE_BACKUP_CODES_MUTATION,
  );
  return {
    regenerateBackupCodes: (code: string) => mutate({ variables: { code } }),
    loading,
    error,
  };
}

export function useAdminDisableTwoFactor() {
  const [mutate, { loading }] = useMutation(ADMIN_DISABLE_TWO_FACTOR_MUTATION, {
    refetchQueries: [USERS_QUERY],
  });
  return {
    adminDisableTwoFactor: (userId: number) =>
      mutate({ variables: { userId } }),
    loading,
  };
}

export function useBackupCodeCount(skip = false) {
  const { data, loading } = useQuery(BACKUP_CODE_COUNT_QUERY, {
    skip,
    fetchPolicy: "cache-and-network",
  });
  return { count: data?.backupCodeCount ?? null, loading };
}

export function useChangePassword() {
  const [mutate, { loading, error }] = useMutation(CHANGE_PASSWORD_MUTATION);
  return {
    changePassword: (currentPassword: string, newPassword: string) =>
      mutate({ variables: { currentPassword, newPassword } }),
    loading,
    error,
  };
}

export function useDeleteAccount() {
  const client = useApolloClient();
  const [mutate, { loading }] = useMutation(DELETE_ACCOUNT_MUTATION);

  const deleteAccount = async () => {
    await mutate();
    await client.clearStore();
    localStorage.setItem("ttc_logout", Date.now().toString());
  };

  return { deleteAccount, loading };
}
