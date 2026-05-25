import { useQuery, useMutation } from "@apollo/client/react";
import {
  USERS_QUERY,
  MEMBERS_QUERY,
  UPDATE_USER_MUTATION,
  DELETE_USER_MUTATION,
} from "../../graphql/users.operations";

export function useUsers() {
  const { data, loading, error } = useQuery(USERS_QUERY);
  return { users: data?.users ?? [], loading, error };
}

export function useMembers() {
  const { data, loading } = useQuery(MEMBERS_QUERY);
  return { members: data?.members ?? [], loading };
}

export function useUpdateUser() {
  const [mutate, { loading, error }] = useMutation(UPDATE_USER_MUTATION, {
    refetchQueries: [{ query: USERS_QUERY }],
  });
  return {
    updateUser: (
      input: Parameters<typeof mutate>[0]["variables"]["updateUserInput"],
    ) => mutate({ variables: { updateUserInput: input } }),
    loading,
    error,
  };
}

export function useDeleteUser() {
  const [mutate, { loading, error }] = useMutation(DELETE_USER_MUTATION, {
    refetchQueries: [{ query: USERS_QUERY }],
  });
  return {
    deleteUser: (id: number) => mutate({ variables: { id } }),
    loading,
    error,
  };
}
