import { useQueryClient } from "@tanstack/react-query";
import {
  USERS_QUERY,
  MEMBERS_QUERY,
  UPDATE_USER_MUTATION,
  DELETE_USER_MUTATION,
} from "../../graphql/users.operations";
import type { User, UserRole, AdminPermission } from "@/types/users.types";
import { useGqlQuery } from "@/lib/gqlQuery";
import { useGqlMutation } from "@/lib/gqlMutation";
import { removeFromFlatArray } from "@/lib/cachePatch";

export function useUsers() {
  const { data, isLoading, error } = useGqlQuery({
    queryKey: ["users"],
    query: USERS_QUERY,
    select: (d) => d.users,
  });
  return { users: data ?? [], loading: isLoading, error };
}

export function useMembers() {
  const { data, isLoading } = useGqlQuery({
    queryKey: ["members"],
    query: MEMBERS_QUERY,
    select: (d) => d.members,
  });
  return { members: data ?? [], loading: isLoading };
}

interface UpdateUserInput {
  id: number;
  role?: UserRole;
  name?: string;
  email?: string;
  adminPermissions?: AdminPermission[];
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  // Not migrated to patchFlatArray: `updated` is only Pick<User, "id" | "role" |
  // "adminPermissions"> from the server, so this merges onto the existing cached
  // user rather than replacing it wholesale.
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: UPDATE_USER_MUTATION,
    unwrap: (d) => d.updateUser,
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
    updateUser: (updateUserInput: UpdateUserInput) =>
      mutateAsync({ updateUserInput }),
    loading: isPending,
    error,
  };
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending, error } = useGqlMutation({
    mutation: DELETE_USER_MUTATION,
    unwrap: (d) => d.removeUser,
    onSuccess: (_data, { id }) => {
      removeFromFlatArray(queryClient, ["users"], id, (u: User) => u.id);
    },
  });
  return {
    deleteUser: (id: number) => mutateAsync({ id }),
    loading: isPending,
    error,
  };
}
