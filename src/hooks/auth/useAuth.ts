import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import type { AuthUser } from "@/types/auth.types";
import { apolloClient, gqlFetch, gqlMutate } from "@/lib/apollo";

export function useCurrentUser() {
  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () =>
      gqlFetch<{ me: AuthUser | null }>(ME_QUERY)
        .then((d) => d.me)
        .catch(() => null),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
  return {
    user: data ?? null,
    loading: isLoading,
    isAuthenticated: !!data,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      gqlMutate<{
        login: {
          user: AuthUser;
          requiresTwoFactor: boolean;
          tempToken: string | null;
        };
      }>(LOGIN_MUTATION, { input }).then((d) => d.login),
    onSuccess: (data) => {
      if (data.user && !data.requiresTwoFactor) {
        queryClient.setQueryData(["me"], data.user);
      }
    },
  });
  return {
    login: (email: string, password: string) =>
      mutateAsync({ email, password }),
    loading: isPending,
    error,
  };
}

export function useRegister() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (input: { email: string; password: string; name?: string }) =>
      gqlMutate<{ register: AuthUser }>(REGISTER_MUTATION, { input }).then(
        (d) => d.register,
      ),
    onSuccess: (user) => {
      queryClient.setQueryData(["me"], user);
    },
  });
  return {
    register: (email: string, password: string, name?: string) =>
      mutateAsync({ email, password, name }),
    loading: isPending,
    error,
  };
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: () =>
      gqlMutate<{ logout: boolean }>(LOGOUT_MUTATION).then((d) => d.logout),
  });
  return {
    logout: async () => {
      await mutateAsync();
      queryClient.clear();
      await apolloClient.clearStore();
      localStorage.setItem("ttc_logout", Date.now().toString());
    },
    loading: isPending,
  };
}

export function useSetupTwoFactor() {
  const { mutate, isPending, data } = useMutation({
    mutationFn: () =>
      gqlMutate<{ setupTwoFactor: { qrCodeUrl: string; secret: string } }>(
        SETUP_TWO_FACTOR_MUTATION,
      ).then((d) => d.setupTwoFactor),
  });
  return {
    setupTwoFactor: () => mutate(),
    loading: isPending,
    qrCodeUrl: data?.qrCodeUrl ?? null,
    secret: data?.secret ?? null,
  };
}

export function useEnableTwoFactor() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error, data } = useMutation({
    mutationFn: (code: string) =>
      gqlMutate<{ enableTwoFactor: { backupCodes: string[] } }>(
        ENABLE_TWO_FACTOR_MUTATION,
        { code },
      ).then((d) => d.enableTwoFactor),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
  return {
    enableTwoFactor: (code: string) => mutateAsync(code),
    loading: isPending,
    error,
    backupCodes: data?.backupCodes ?? null,
  };
}

export function useVerifyTwoFactorBackup() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (input: { tempToken: string; backupCode: string }) =>
      gqlMutate<{ verifyTwoFactorBackup: { user: AuthUser } }>(
        VERIFY_TWO_FACTOR_BACKUP_MUTATION,
        { input },
      ).then((d) => d.verifyTwoFactorBackup),
    onSuccess: (data) => {
      queryClient.setQueryData(["me"], data.user);
    },
  });
  return {
    verifyBackup: (tempToken: string, backupCode: string) =>
      mutateAsync({ tempToken, backupCode }),
    loading: isPending,
    error,
  };
}

export function useVerifyTwoFactor() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (input: { tempToken: string; code: string }) =>
      gqlMutate<{ verifyTwoFactor: { user: AuthUser } }>(
        VERIFY_TWO_FACTOR_MUTATION,
        { input },
      ).then((d) => d.verifyTwoFactor),
    onSuccess: (data) => {
      queryClient.setQueryData(["me"], data.user);
    },
  });
  return {
    verifyTwoFactor: (tempToken: string, code: string) =>
      mutateAsync({ tempToken, code }),
    loading: isPending,
    error,
  };
}

export function useDisableTwoFactor() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (code: string) =>
      gqlMutate<{ disableTwoFactor: boolean }>(DISABLE_TWO_FACTOR_MUTATION, {
        code,
      }).then((d) => d.disableTwoFactor),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
  return {
    disableTwoFactor: (code: string) => mutateAsync(code),
    loading: isPending,
    error,
  };
}

export function useUpdateMe() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (input: {
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
    }) =>
      gqlMutate<{ updateMe: AuthUser }>(UPDATE_ME_MUTATION, { input }).then(
        (d) => d.updateMe,
      ),
    onSuccess: (updated) => {
      queryClient.setQueryData(["me"], updated);
    },
  });
  return {
    updateMe: (input: Parameters<typeof mutateAsync>[0]) => mutateAsync(input),
    loading: isPending,
    error,
  };
}

export function useRequestPasswordReset() {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (email: string) =>
      gqlMutate<{ requestPasswordReset: boolean }>(
        REQUEST_PASSWORD_RESET_MUTATION,
        { email },
      ).then((d) => d.requestPasswordReset),
  });
  return {
    requestReset: (email: string) => mutateAsync(email),
    loading: isPending,
  };
}

export function useResetPassword() {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (vars: { token: string; newPassword: string }) =>
      gqlMutate<{ resetPassword: boolean }>(RESET_PASSWORD_MUTATION, vars).then(
        (d) => d.resetPassword,
      ),
  });
  return {
    resetPassword: (token: string, newPassword: string) =>
      mutateAsync({ token, newPassword }),
    loading: isPending,
  };
}

export function useRegenerateBackupCodes() {
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (code: string) =>
      gqlMutate<{ regenerateBackupCodes: { backupCodes: string[] } }>(
        REGENERATE_BACKUP_CODES_MUTATION,
        { code },
      ).then((d) => d.regenerateBackupCodes),
  });
  return {
    regenerateBackupCodes: (code: string) => mutateAsync(code),
    loading: isPending,
    error,
  };
}

export function useAdminDisableTwoFactor() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (userId: number) =>
      gqlMutate<{ adminDisableTwoFactor: boolean }>(
        ADMIN_DISABLE_TWO_FACTOR_MUTATION,
        { userId },
      ).then((d) => d.adminDisableTwoFactor),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
  return {
    adminDisableTwoFactor: (userId: number) => mutateAsync(userId),
    loading: isPending,
  };
}

export function useBackupCodeCount(skip = false) {
  const { data, isLoading } = useQuery({
    queryKey: ["backupCodeCount"],
    queryFn: () =>
      gqlFetch<{ backupCodeCount: number }>(BACKUP_CODE_COUNT_QUERY).then(
        (d) => d.backupCodeCount,
      ),
    enabled: !skip,
    staleTime: 0,
  });
  return { count: data ?? null, loading: isLoading };
}

export function useChangePassword() {
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (vars: { currentPassword: string; newPassword: string }) =>
      gqlMutate<{ changePassword: boolean }>(
        CHANGE_PASSWORD_MUTATION,
        vars,
      ).then((d) => d.changePassword),
  });
  return {
    changePassword: (currentPassword: string, newPassword: string) =>
      mutateAsync({ currentPassword, newPassword }),
    loading: isPending,
    error,
  };
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: () =>
      gqlMutate<{ deleteAccount: boolean }>(DELETE_ACCOUNT_MUTATION).then(
        (d) => d.deleteAccount,
      ),
  });
  return {
    deleteAccount: async () => {
      await mutateAsync();
      queryClient.clear();
      await apolloClient.clearStore();
      localStorage.setItem("ttc_logout", Date.now().toString());
    },
    loading: isPending,
  };
}
