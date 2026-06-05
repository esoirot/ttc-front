import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  USERS_QUERY,
  MEMBERS_QUERY,
  UPDATE_USER_MUTATION,
  DELETE_USER_MUTATION,
} from "../../graphql/users.operations";
import type {
  User,
  Member,
  UserRole,
  AdminPermission,
} from "@/types/users.types";
import { gqlRequest } from "@/lib/api";

export function useUsers() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: () =>
      gqlRequest<{ users: User[] }>(USERS_QUERY).then((d) => d.users),
  });
  return { users: data ?? [], loading: isLoading, error };
}

export function useMembers() {
  const { data, isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: () =>
      gqlRequest<{ members: Member[] }>(MEMBERS_QUERY).then((d) => d.members),
  });
  return { members: data ?? [], loading: isLoading };
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (updateUserInput: {
      id: number;
      role?: UserRole;
      name?: string;
      email?: string;
      adminPermissions?: AdminPermission[];
    }) =>
      gqlRequest<{
        updateUser: Pick<User, "id" | "role" | "adminPermissions">;
      }>(UPDATE_USER_MUTATION, { updateUserInput }).then((d) => d.updateUser),
    onSuccess: (updated) => {
      queryClient.setQueryData<User[]>(
        ["users"],
        (old) =>
          old?.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)) ??
          [],
      );
    },
  });
  return {
    updateUser: (input: Parameters<typeof mutateAsync>[0]) =>
      mutateAsync(input),
    loading: isPending,
    error,
  };
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: (id: number) =>
      gqlRequest<{ removeUser: { id: number } }>(DELETE_USER_MUTATION, {
        id,
      }).then((d) => d.removeUser),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<User[]>(
        ["users"],
        (old) => old?.filter((u) => u.id !== id) ?? [],
      );
    },
  });
  return {
    deleteUser: (id: number) => mutateAsync(id),
    loading: isPending,
    error,
  };
}
